from __future__ import annotations

import os
import re
import json
import logging
import time

from django.db.models import Q

logger = logging.getLogger(__name__)

from ai_agent import settings
from django.shortcuts import get_object_or_404
from langchain_community.chat_models import ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from django.utils import timezone
from agent_app.models import Session, Chat, Document, Lead
from agent_app.utils.utils import extract_text_from_file


class QueryService:

    def __init__(self):
        self.chat_model = ChatOpenAI(
            model_name="gpt-4o-mini",
            temperature=0.1
        )
        self.embedding_model = OpenAIEmbeddings(
            model="text-embedding-3-small"
        )

    # ─────────────────────────────────────────
    # SESSION
    # ─────────────────────────────────────────
    def _get_or_create_session(self, *, session_id=None):
        if session_id:
            session = get_object_or_404(
                Session,
                id=session_id,
                is_active=True,
                is_deleted=False
            )
            logger.info("[SESSION] Reusing session id=%s token=%s", session.id, session.session_token)
            return session, False

        session = Session.objects.create()
        logger.info("[SESSION] Created new session id=%s token=%s", session.id, session.session_token)
        return session, True

    # ─────────────────────────────────────────
    # PARTIAL LEAD — stored in session.metadata
    # ─────────────────────────────────────────
    def _store_partial_lead(self, session: Session, first_name="", phone="", company=""):
        """Store partial lead info in session.metadata until email arrives."""
        metadata = session.metadata or {}

        partial = metadata.get("partial_lead", {})
        if first_name and not partial.get("first_name"):
            partial["first_name"] = first_name
        if phone and not partial.get("phone"):
            partial["phone"] = phone
        if company and not partial.get("company"):
            partial["company"] = company

        metadata["partial_lead"] = partial
        session.metadata = metadata
        session.save(update_fields=["metadata"])

    def _get_partial_lead(self, session: Session) -> dict:
        """Retrieve partial lead info from session.metadata."""
        metadata = session.metadata or {}
        return metadata.get("partial_lead", {})

    # ─────────────────────────────────────────
    # REFUSAL TRACKING — stored in session.metadata
    # ─────────────────────────────────────────
    def _record_refusal(self, session: Session, field: str):
        """Record that the user refused to share a specific field, with the exchange number."""
        metadata = session.metadata or {}
        refusals = metadata.get("refusals", {})

        user_exchange_count = self._count_user_exchanges(session)
        refusals[field] = {
            "refused_at_exchange": user_exchange_count,
            "times_refused": refusals.get(field, {}).get("times_refused", 0) + 1,
        }

        metadata["refusals"] = refusals
        session.metadata = metadata
        session.save(update_fields=["metadata"])

    def _get_refusal_info(self, session: Session) -> dict:
        """Get refusal info from metadata."""
        metadata = session.metadata or {}
        return metadata.get("refusals", {})

    def _last_ask_tracking(self, session: Session, field: str, exchange_num: int):
        """Track when we last asked for a particular field."""
        metadata = session.metadata or {}
        last_asks = metadata.get("last_asks", {})
        last_asks[field] = exchange_num
        metadata["last_asks"] = last_asks
        session.metadata = metadata
        session.save(update_fields=["metadata"])

    def _get_last_ask_exchange(self, session: Session, field: str) -> int:
        """Get the exchange number when we last asked for a field."""
        metadata = session.metadata or {}
        last_asks = metadata.get("last_asks", {})
        return last_asks.get(field, -1)

    # ─────────────────────────────────────────
    # LEAD — CREATE ONLY WHEN EMAIL EXISTS
    # ─────────────────────────────────────────
    def _attach_lead_to_session(self, session: Session, lead_info: dict) -> None:
        if not lead_info:
            return

        first_name = (lead_info.get("first_name") or "").strip()
        email      = (lead_info.get("email") or "").strip()
        phone      = (lead_info.get("phone") or "").strip()
        company    = (lead_info.get("company") or "").strip()

        # ── Validate ──
        bad_names = {
            "sorry", "no", "yes", "okay", "ok", "hi", "hello", "hey",
            "thanks", "thank", "nah", "nope", "none", "na", "null",
            "i", "me", "my", "the", "a", "an", "not", "can't", "cant",
            "don't", "dont", "won't", "wont", "refuse", "skip", "pass",
            "sure", "yeah", "yep", "yup", "hmm", "um", "uh",
        }
        if first_name:
            if (
                len(first_name) < 2
                or first_name.lower() in bad_names
                or not re.match(r'^[a-zA-Z\s\.\'-]+$', first_name)
            ):
                first_name = ""

        if email:
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                email = ""

        if phone:
            phone = re.sub(r'[^\d]', '', phone)
            if len(phone) < 7:
                phone = ""

        if not any([first_name, email, phone, company]):
            return

        logger.debug(
            "[LEAD] Extracted from LLM — name=%r email=%r phone=%r company=%r session=%s",
            first_name, email, phone, company, session.id
        )

        # CASE 1: Session already has a lead — update it
        if session.lead_id:
            try:
                lead = Lead.objects.get(id=session.lead_id, is_deleted=False)
                updated = False
                if first_name and not lead.first_name:
                    lead.first_name = first_name
                    updated = True
                if email and not lead.email:
                    lead.email = email
                    updated = True
                if phone and not lead.phone:
                    lead.phone = phone
                    updated = True
                if company and not lead.company:
                    lead.company = company
                    updated = True
                if updated:
                    lead.save()
                    logger.info("[LEAD] Updated existing lead id=%s fields=%s", lead.id,
                                [f for f in ["first_name", "email", "phone", "company"] if getattr(lead, f)])
                return
            except Lead.DoesNotExist:
                pass

        # CASE 2: No lead on session — store partial until email arrives
        if not email:
            logger.info("[LEAD] No email yet — storing partial: name=%r phone=%r company=%r session=%s",
                        first_name, phone, company, session.id)
            self._store_partial_lead(session, first_name, phone, company)
            return

        # We have email — merge partial info and create/find lead
        partial = self._get_partial_lead(session)
        if not first_name and partial.get("first_name"):
            first_name = partial["first_name"]
        if not phone and partial.get("phone"):
            phone = partial["phone"]
        if not company and partial.get("company"):
            company = partial["company"]

        existing_lead = Lead.objects.filter(
            Q(email=email), is_deleted=False
        ).first()

        if existing_lead:
            updated = False
            if first_name and not existing_lead.first_name:
                existing_lead.first_name = first_name
                updated = True
            if phone and not existing_lead.phone:
                existing_lead.phone = phone
                updated = True
            if company and not existing_lead.company:
                existing_lead.company = company
                updated = True
            if updated:
                existing_lead.save()
            logger.info("[LEAD] Linked existing lead id=%s email=%s to session=%s", existing_lead.id, email, session.id)
            lead = existing_lead
        else:
            lead = Lead.objects.create(
                first_name=first_name,
                email=email,
                phone=phone,
                company=company,
            )
            logger.info("[LEAD] Created new lead id=%s name=%r email=%s company=%r session=%s",
                        lead.id, first_name, email, company, session.id)

        session.lead = lead
        session.save(update_fields=["lead"])

        # Clear partial lead from metadata since we have a real lead now
        metadata = session.metadata or {}
        metadata.pop("partial_lead", None)
        session.metadata = metadata
        session.save(update_fields=["metadata"])
        logger.debug("[LEAD] Cleared partial_lead from session metadata session=%s", session.id)

    # ─────────────────────────────────────────
    # GET COLLECTED LEAD FIELDS
    # ─────────────────────────────────────────
    def _get_collected_lead_fields(self, session: Session) -> dict:
        collected = {
            "first_name": None,
            "email": None,
            "phone": None,
            "company": None,
        }

        # Check actual lead record
        if session.lead_id:
            try:
                lead = Lead.objects.get(id=session.lead_id, is_deleted=False)
                if lead.first_name and lead.first_name.strip():
                    collected["first_name"] = lead.first_name.strip()
                if lead.email and lead.email.strip():
                    collected["email"] = lead.email.strip()
                if lead.phone and lead.phone.strip():
                    collected["phone"] = lead.phone.strip()
                if lead.company and lead.company.strip():
                    collected["company"] = lead.company.strip()
            except Lead.DoesNotExist:
                pass

        # Check partial info in metadata
        partial = self._get_partial_lead(session)
        if not collected["first_name"] and partial.get("first_name"):
            collected["first_name"] = partial["first_name"]
        if not collected["phone"] and partial.get("phone"):
            collected["phone"] = partial["phone"]
        if not collected["company"] and partial.get("company"):
            collected["company"] = partial["company"]

        return collected

    # ─────────────────────────────────────────
    # COUNT USER EXCHANGES
    # ─────────────────────────────────────────
    def _count_user_exchanges(self, session: Session) -> int:
        total_chats = session.chats.filter(is_deleted=False).count()
        user_exchanges = (total_chats + 1) // 2
        return user_exchanges

    # ─────────────────────────────────────────
    # MEMORY
    # ─────────────────────────────────────────
    def _get_conversation_summary(self, session: Session, last_n: int = 5) -> str:
        summaries = (
            session.chats
            .filter(is_deleted=False, summary__isnull=False)
            .exclude(summary="")
            .order_by("-created_at")
            .values_list("summary", flat=True)[:last_n]
        )
        if not summaries:
            return ""
        return " | ".join(reversed(list(summaries)))

    # ─────────────────────────────────────────
    # RECENT CONVERSATION MESSAGES
    # ─────────────────────────────────────────
    def _get_recent_conversation(self, session: Session, last_n: int = 10) -> str:
        recent_chats = (
            session.chats
            .filter(is_deleted=False)
            .order_by("-created_at")
            .values_list("message", flat=True)[:last_n]
        )
        if not recent_chats:
            return ""

        messages = list(reversed(list(recent_chats)))
        conversation = []
        for i, msg in enumerate(messages):
            role = "User" if i % 2 == 0 else "Assistant"
            conversation.append(f"{role}: {msg}")

        return "\n".join(conversation)

    # ─────────────────────────────────────────
    # PRE-PROCESS MESSAGE (extract contact + detect refusals)
    # ─────────────────────────────────────────
    def _preprocess_message(self, session: Session, user_query: str) -> dict:
        """
        Single pre-processing LLM call (runs before the main prompt).
        1. Extracts contact info from the user message — handles ALL informal patterns.
        2. Detects refusals of personal info sharing.

        Stores extracted info immediately via _attach_lead_to_session.
        Returns current refusal state dict.
        """
        recent_chats = list(
            session.chats
            .filter(is_deleted=False)
            .order_by("-created_at")
            .values_list("message", flat=True)[:2]
        )
        prev_assistant_msg = recent_chats[1] if len(recent_chats) >= 2 else ""

        preprocess_prompt = f"""You are a contact info extractor and refusal detector for a chatbot.

Assistant's last message: "{prev_assistant_msg}"
User's current message: "{user_query}"

TASK 1 — CONTACT EXTRACTION:
Extract any personal contact information from the user's current message.
Recognise ALL these name patterns:
  - Direct: "My name is Hemraj", "I'm Hemraj", "Name's Hemraj"
  - Informal intro: "Hemraj here", "This is Hemraj", "Hemraj speaking"
  - Response to bot's name question: if assistant asked for name and user replied with a single word or short phrase, that word is likely their name
  - Embedded in sentence: "Hemraj here, I wanted to ask about ERP..."
  - Casual: "You can call me Alex", "People call me Sara", "call me John"
Extract company from: "I work at Acme", "from Acme Corp", "Acme Inc here", "at TechCorp"
Extract phone from: "my number is 9876543210", "+1-555-0100", "reach me at 9876..."
Extract email from: any token containing @ symbol

TASK 2 — REFUSAL DETECTION:
Did the user refuse to share personal information (name, email, or phone)?
Refusal signals: "no", "nah", "nope", "I won't", "I'd rather not", "not giving", "skip", "pass", "don't want to", "not comfortable", "prefer not", "I am not giving", "I am not telling"
A general topic refusal ("I don't want to talk about pricing") is NOT a personal info refusal.

Return ONLY valid JSON — no explanation, no markdown:
{{"extracted": {{"first_name": null, "email": null, "phone": null, "company": null}}, "refusal": {{"is_refusal": false, "refused_fields": []}}}}

Rules:
- extracted fields: null if genuinely not found in current message
- phone: output digits only (strip spaces, dashes, parentheses, +)
- If user refuses a field, that field's extracted value must be null
- is_refusal = true ONLY for personal info refusals, NOT general topic refusals
- refused_fields: subset of ["name", "email", "phone"] that were explicitly refused"""

        try:
            raw = self.chat_model.predict(preprocess_prompt)
            cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
            data = json.loads(cleaned)

            # Handle contact extraction — store immediately so collected_fields is accurate
            extracted = data.get("extracted", {})
            if any(v for v in extracted.values() if v):
                self._attach_lead_to_session(session, extracted)
                logger.info("[PREPROCESS] Extracted contact=%s session=%s", extracted, session.id)

            # Handle refusals
            refusal = data.get("refusal", {})
            if refusal.get("is_refusal"):
                for field in refusal.get("refused_fields", []):
                    if field in ("name", "email", "phone"):
                        self._record_refusal(session, field)
                        logger.info("[PREPROCESS] Refusal detected field=%s session=%s", field, session.id)

        except Exception as e:
            logger.error("[PREPROCESS] Failed: %s — falling back to existing state", e)

        # Return current refusal state from metadata
        refusal_info = self._get_refusal_info(session)
        return {
            "name": "name" in refusal_info,
            "email": "email" in refusal_info,
            "phone": "phone" in refusal_info,
        }

    def _exchanges_since_refusal(self, session: Session, field: str) -> int:
        """How many user exchanges have happened since the last refusal of a given field."""
        refusal_info = self._get_refusal_info(session)
        if field not in refusal_info:
            return 999

        refused_at = refusal_info[field].get("refused_at_exchange", 0)
        current_exchange = self._count_user_exchanges(session)
        return current_exchange - refused_at

    def _min_exchanges_since_any_refusal(self, session: Session) -> int:
        """Minimum exchanges since ANY refusal (for cool-off period)."""
        refusal_info = self._get_refusal_info(session)
        if not refusal_info:
            return 999

        current_exchange = self._count_user_exchanges(session)
        min_gap = 999
        for field, info in refusal_info.items():
            refused_at = info.get("refused_at_exchange", 0)
            gap = current_exchange - refused_at
            if gap < min_gap:
                min_gap = gap
        return min_gap

    # ─────────────────────────────────────────
    # VECTOR SEARCH
    # ─────────────────────────────────────────
    def _vector_search(self, query: str, k: int = 6, max_distance: float = 1.5):
        def clean(text: str) -> str:
            return re.sub(r"\s+", " ", text.strip())

        try:
            vectordb = Chroma(
                collection_name="global_collection",
                embedding_function=self.embedding_model,
                persist_directory=settings.CHROMA_PERSIST_DIR
            )

            count = vectordb._collection.count()
            if count == 0:
                logger.warning("[VECTOR] ChromaDB collection is empty — no documents indexed")
                return "", 0

            docs_with_scores = vectordb.similarity_search_with_score(query, k=k)
            results = [
                (doc, dist) for doc, dist in docs_with_scores
                if dist <= max_distance
            ]

            if not results:
                logger.info("[VECTOR] No relevant chunks found for query=%r (threshold=%.1f)", query[:60], max_distance)
                return "", 0

            results.sort(key=lambda x: x[1])
            context = "\n\n".join(clean(doc.page_content) for doc, _ in results[:k])
            logger.info("[VECTOR] Retrieved %d chunks (best score=%.4f) for query=%r",
                        len(results), results[0][1], query[:60])
            return context, len(results)

        except Exception as e:
            logger.error("[VECTOR] Search failed: %s", e, exc_info=True)
            return "", 0

    # ─────────────────────────────────────────
    # MAIN HANDLER
    # ─────────────────────────────────────────
    def handle_query(
        self,
        *,
        user_query: str,
        session_id: str = None,
    ) -> dict:

        session, is_created = self._get_or_create_session(session_id=session_id)

        logger.info("[QUERY] session=%s exchange_count=%s query=%r",
                    session.id, self._count_user_exchanges(session), user_query[:80])

        conversation_memory = self._get_conversation_summary(session, last_n=5)
        recent_conversation = self._get_recent_conversation(session, last_n=10)

        Chat.objects.create(
            session=session,
            message=user_query,
            summary=conversation_memory,
        )

        user_exchange_count = self._count_user_exchanges(session)

        # Pre-process: extract contact info + detect refusals (single LLM call)
        # Must run BEFORE _get_collected_lead_fields so extracted data is already stored
        refused_fields = self._preprocess_message(session, user_query)
        if any(refused_fields.values()):
            logger.info("[PREPROCESS] Refusal state=%s session=%s", refused_fields, session.id)

        collected_fields = self._get_collected_lead_fields(session)

        # Calculate exchange gaps since each refusal
        name_refusal_gap = self._exchanges_since_refusal(session, "name")
        email_refusal_gap = self._exchanges_since_refusal(session, "email")
        phone_refusal_gap = self._exchanges_since_refusal(session, "phone")
        min_refusal_gap = self._min_exchanges_since_any_refusal(session)

        context_text, used_chunks = self._vector_search(user_query)
        logger.info("[VECTOR] Context retrieved chunks=%d session=%s", used_chunks, session.id)
        prompt = self._build_prompt(
            user_query=user_query,
            context_text=context_text,
            conversation_memory=conversation_memory,
            recent_conversation=recent_conversation,
            user_exchange_count=user_exchange_count,
            collected_fields=collected_fields,
            refused_fields=refused_fields,
            name_refusal_gap=name_refusal_gap,
            email_refusal_gap=email_refusal_gap,
            phone_refusal_gap=phone_refusal_gap,
            min_refusal_gap=min_refusal_gap,
            is_new_session=is_created,
        )

        _t0 = time.time()
        raw_response = self.chat_model.predict(prompt)
        logger.info("[LLM] Response received in %.2fs session=%s", time.time() - _t0, session.id)

        answer, summary, session_name = self._parse_response(
            raw_response, user_query
        )

        if is_created and session_name:
            session.session_name = session_name[:60]
            session.save(update_fields=["session_name"])
            logger.info("[SESSION] Named new session=%s name=%r", session.id, session.session_name)

        Chat.objects.create(
            session=session,
            message=answer,
            summary=summary,
        )

        response_data = {
            "session_token": str(session.session_token),
            "session_id":    session.id,
            "answer":        answer,
            "used_chunks":   used_chunks,
        }
        if is_created:
            response_data["session_name"] = session.session_name

        return response_data

    # ─────────────────────────────────────────
    # PROMPT BUILDER
    # ─────────────────────────────────────────
    def _build_prompt(
            self,
            *,
            user_query: str,
            context_text: str,
            conversation_memory: str,
            recent_conversation: str,
            user_exchange_count: int = 0,
            collected_fields: dict = None,
            refused_fields: dict = None,
            name_refusal_gap: int = 999,
            email_refusal_gap: int = 999,
            phone_refusal_gap: int = 999,
            min_refusal_gap: int = 999,
            is_new_session: bool = False,
    ) -> str:

        if collected_fields is None:
            collected_fields = {
                "first_name": None, "email": None,
                "phone": None, "company": None,
            }
        if refused_fields is None:
            refused_fields = {"name": False, "email": False, "phone": False}

        has_name = collected_fields.get("first_name")
        has_email = collected_fields.get("email")
        has_phone = collected_fields.get("phone")
        has_company = collected_fields.get("company")

        refused_name = refused_fields.get("name", False)
        refused_email = refused_fields.get("email", False)
        refused_phone = refused_fields.get("phone", False)

        # Build lead status
        lead_status_lines = []
        if has_name:
            lead_status_lines.append(f'  Name: COLLECTED = "{has_name}"')
        elif refused_name:
            lead_status_lines.append(
                f"  Name: USER REFUSED ({name_refusal_gap} exchanges ago)"
            )
        else:
            lead_status_lines.append("  Name: NOT YET KNOWN")

        if has_email:
            lead_status_lines.append(f'  Email: COLLECTED = "{has_email}"')
        elif refused_email:
            lead_status_lines.append(
                f"  Email: USER REFUSED ({email_refusal_gap} exchanges ago)"
            )
        else:
            lead_status_lines.append("  Email: NOT YET KNOWN")

        if has_phone:
            lead_status_lines.append(f'  Phone: COLLECTED = "{has_phone}"')
        elif refused_phone:
            lead_status_lines.append(
                f"  Phone: USER REFUSED ({phone_refusal_gap} exchanges ago)"
            )
        else:
            lead_status_lines.append("  Phone: NOT YET KNOWN (optional)")

        if has_company:
            lead_status_lines.append(f'  Company: COLLECTED = "{has_company}"')
        else:
            lead_status_lines.append("  Company: NOT YET KNOWN")

        lead_status = "\n".join(lead_status_lines)

        memory_section = ""
        if conversation_memory:
            memory_section = (
                f"\nCONVERSATION MEMORY (continuity reference, "
                f"not factual source):\n{conversation_memory}\n"
            )

        recent_conversation_section = ""
        if recent_conversation:
            recent_conversation_section = (
                f"\nRECENT MESSAGES (read carefully before responding):"
                f"\n{recent_conversation}\n"
            )

        context_section = ""
        if context_text:
            context_section = (
                f"\nKNOWLEDGE BASE (your ONLY factual source):\n{context_text}\n"
            )
        else:
            context_section = "\nKNOWLEDGE BASE:\n[No relevant documents found]\n"

        lead_collection_instruction = self._build_lead_instruction(
            user_exchange_count=user_exchange_count,
            has_name=has_name,
            has_email=has_email,
            has_phone=has_phone,
            has_company=has_company,
            refused_name=refused_name,
            refused_email=refused_email,
            refused_phone=refused_phone,
            name_refusal_gap=name_refusal_gap,
            email_refusal_gap=email_refusal_gap,
            phone_refusal_gap=phone_refusal_gap,
            min_refusal_gap=min_refusal_gap,
        )

        session_name_instruction = ""
        session_name_format = ""
        if is_new_session:
            session_name_instruction = """
    SESSION_NAME: Generate a short 3-5 word title for this conversation.
    Examples: "ERP for Manufacturing", "QuickBooks Integration Query"
    Return ONLY the title, no quotes.
    """
            session_name_format = "\nSESSION_NAME: <3-5 word title>"

        return f"""You are a helpful, warm AI assistant for Oodles Technologies.
    You ARE the Oodles Technologies chatbot. Oodles Technologies is YOUR company.

    ABOUT YOUR COMPANY (Oodles Technologies):
    Oodles Technologies is a software development company that builds custom ERP \
    and enterprise software solutions. They specialize in:
    - Custom ERP development and implementation
    - Enterprise software solutions
    - Digital transformation services
    - Cloud solutions and migration
    - AI/ML integration in enterprise systems
    - Supply chain management systems
    - Financial and accounting software
    - HR management systems
    - CRM solutions
    When users ask about "Oodles", "Oodles Technologies", "your company", \
    "your services", "what do you do", etc., they are asking about YOUR company. \
    ALWAYS answer these questions enthusiastically using the Knowledge Base \
    and the company info above.

PERSONALITY:
- Professional, warm, and emotionally intelligent.
- Sound like a knowledgeable enterprise consultant, not a sales bot.
- Concise and clear: typically 2–4 sentences.
- Only ask a follow-up question when it naturally adds value.
- Respect user signals. If the user is ending the conversation, thanking you, or seems frustrated, respond gracefully without pushing further.
- Stay calm and composed even if the user is rude or upset.
- Never argue. Never escalate. Never sound defensive.
- Do not oversell. Be helpful first, commercial second.
- Use the user's name naturally if known, but never force it.
- Match the user’s tone:
    • If they are casual → respond friendly but professional.
    • If they are direct → respond concise and business-like.
    • If they are unhappy → respond empathetic and steady.

    GREETING BEHAVIOR:
    - If the user says "hi", "hey", "hello", or any greeting, respond warmly \
    and introduce yourself as the Oodles Technologies assistant.
    - Example: "Hey there! Thanks for reaching out to Oodles Technologies. \
    I'm here to help you with any questions about our ERP and enterprise \
    software solutions. What are you working on?"
    - ALWAYS mention Oodles Technologies in your greeting.

    FORMATTING RULES:
    - NEVER use em dashes or en dashes (— or –). Use commas, periods, \
    or semicolons instead.
    - NEVER include labels like SUMMARY:, LEAD:, or SESSION_NAME: inside \
    your answer.
    - Keep it conversational, not essay-like.

    USER EXCHANGE NUMBER: {user_exchange_count}
    MIN EXCHANGES SINCE ANY REFUSAL: {min_refusal_gap}

    LEAD STATUS (from database):
    {lead_status}

    CRITICAL LEAD COLLECTION RULES:
    1. If a field says COLLECTED, NEVER ask for it again. Period.
    2. If a field says USER REFUSED:
       - IMMEDIATELY accept: "No worries at all!" or "Totally understand!"
       - Do NOT ask for ANY other personal info in the SAME response as a refusal.
       - Do NOT ask for the same field again until at least 3 exchanges passed.
       - Even after 3 exchanges, only re-ask if conversation naturally warrants it.
    3. Maximum ONE personal detail question per response. Never bundle them.
    4. When user gives info, acknowledge warmly and naturally.
    5. Lead is ONLY created when email is provided. Name/phone/company are \
    stored as partial data until email arrives.
    6. NEVER make the user feel pressured. The conversation should feel natural.
    {memory_section}
    {recent_conversation_section}
    {context_section}

    USER'S CURRENT MESSAGE:
    {user_query}

    SCOPE RULE:
    - You represent Oodles Technologies. Questions about Oodles, your company, \
    your services, what you do, your team, etc. are ALWAYS on-topic. Answer them.
    - Questions about ERP, enterprise software, digital transformation are on-topic.
    - If the user asks about a DIFFERENT company (e.g., "Tell me about SAP", \
    "What does Infosys do?"):
      Say: "I'm your Oodles Technologies specialist, so I'd rather not give \
    incomplete info about other companies. But I can tell you how we handle \
    [related topic]. Would that help?"
    - NEVER treat questions about Oodles Technologies as off-topic.

    HOW TO RESPOND (follow all steps in order):

    STEP 1 - DETECT REFUSAL:
    If the user's current message is refusing to share personal info:
    - Acknowledge warmly: "No worries at all!" or "Totally get it!"
    - Do NOT ask for any other personal info in this same response.
    - Continue helping with their actual question or ask a business follow-up.
    - Skip STEP 3 entirely.

    STEP 2 - ANSWER the user's question using the Knowledge Base.
    - If the user asks about Oodles Technologies, ALWAYS answer positively \
    using the Knowledge Base and the company info provided above.
    - If no relevant info in KB: "I don't have that specific detail handy, \
    but our team can definitely help you with that."
    - If user says "yes"/"okay" without a clear question, guide forward naturally.
    - Show genuine interest in their project.

    STEP 3 - LEAD COLLECTION (only when NOT handling a refusal):
    {lead_collection_instruction}

STEP 4 - ASK ONE follow-up question about their business needs.
- Only ask a follow-up question if the user is continuing the discussion.
- DO NOT ask a follow-up question if the user:
  • is thanking you
  • is ending the conversation
  • says they will connect later
  • expresses dissatisfaction
- If conversation is closing, end politely instead.
- Never repeat a question already asked.

    YOUR RESPONSE MUST HAVE THIS EXACT STRUCTURE:

    ANSWER: <your complete response>
    SUMMARY: <one sentence, max 20 words>{session_name_format}

    CRITICAL: The ANSWER section must NEVER contain the words "Summary:" or "Session_Name:". Those belong ONLY in their labeled sections.
    {session_name_instruction}"""

    def _build_lead_instruction(
        self,
        *,
        user_exchange_count,
        has_name,
        has_email,
        has_phone,
        has_company,
        refused_name,
        refused_email,
        refused_phone,
        name_refusal_gap,
        email_refusal_gap,
        phone_refusal_gap,
        min_refusal_gap,
    ) -> str:

        COOLOFF_EXCHANGES = 3  # Must wait at least 3 exchanges after any refusal

        # ── All key info collected ──
        if has_name and has_email:
            if not has_phone and not refused_phone:
                return (
                    f"LEAD INSTRUCTION: You have {has_name}'s name and email. "
                    f"Phone is optional. Only ask if user is discussing pricing/timelines. "
                    f"Otherwise, do NOT ask for any personal details."
                )
            return "LEAD INSTRUCTION: Key info collected. Do NOT ask for personal details."

        # ── Too early (first 2 exchanges: just build rapport) ──
        if user_exchange_count < 3:
            return (
                "LEAD INSTRUCTION: TOO EARLY. Do NOT ask for name, email, or phone. "
                "Focus entirely on understanding their needs. Build rapport first."
            )

        # ── User JUST refused something (cool-off period) ──
        if min_refusal_gap < COOLOFF_EXCHANGES:
            return (
                f"LEAD INSTRUCTION: COOLING OFF (only {min_refusal_gap} exchange(s) "
                f"since last refusal). Do NOT ask for ANY personal details this turn. "
                f"Just focus on being helpful with their question."
            )

        # ── Name not collected yet ──
        if not has_name and not refused_name:
            if user_exchange_count >= 3:
                return f"""LEAD INSTRUCTION: Ask for the user's name this turn.
This is exchange #{user_exchange_count} and you don't know their name yet.
Weave it naturally into your response, at the END, after answering their question.
Use a casual, friendly approach like:
- "By the way, I'm really enjoying this conversation! What's your name?"
- "I'd love to know who I'm chatting with! What should I call you?"
You can also ask for company alongside if it fits naturally:
- "What's your name, and which company is this for?"
Keep it light. Do NOT make it feel like a form."""

        # ── Name was refused, enough time passed ──
        if refused_name and not has_name and name_refusal_gap >= COOLOFF_EXCHANGES:
            if not has_email and not refused_email:
                return (
                    "LEAD INSTRUCTION: User declined name earlier. That's fine. "
                    "You may gently offer to send resources and ask for email. "
                    'Something like: "I\'d love to have our team share some '
                    'relevant info with you. What\'s a good email?" '
                    "Only ask if the conversation warrants it."
                )
            return (
                "LEAD INSTRUCTION: User declined name. Do not re-ask yet. "
                "Continue being helpful."
            )

        # ── Name collected, email not yet ──
        if has_name and not has_email and not refused_email:
            return f"""LEAD INSTRUCTION: You know the user is {has_name}. \
Now ask for email by offering value.
Weave it naturally at the END of your response:
- "I'd love to have our team send you some detailed info, {has_name}. \
What's a good email?"
- "Want me to send you some relevant case studies, {has_name}? \
What email should I use?"
Keep it natural. ONE question only."""

        # ── Email was refused, enough time passed ──
        if has_name and refused_email and not has_email:
            if email_refusal_gap >= COOLOFF_EXCHANGES:
                return f"""LEAD INSTRUCTION: {has_name} declined email \
{email_refusal_gap} exchanges ago.
You may try ONE more time ONLY if the user is asking about implementation, \
pricing, or showing strong buying intent.
Say something like: "Since you're seriously exploring this, {has_name}, \
would it help if our team reached out? I'd just need your email."
If the conversation doesn't warrant it, do NOT ask."""
            return (
                f"LEAD INSTRUCTION: {has_name} recently declined email. "
                f"Do NOT ask again yet. Continue being helpful."
            )

        # ── No name, name was refused, email not asked yet,
        #    enough cool-off ──
        if not has_name and refused_name and not has_email and not refused_email:
            if name_refusal_gap >= COOLOFF_EXCHANGES:
                return (
                    "LEAD INSTRUCTION: User declined name. Enough time has passed. "
                    "You may offer to send resources and ask for email gently. "
                    "Only if the conversation naturally calls for it."
                )

        return (
            "LEAD INSTRUCTION: PASSIVE. Do not ask for contact details. "
            "If user volunteers info, acknowledge warmly."
        )

    # ─────────────────────────────────────────
    # RESPONSE PARSER
    # ─────────────────────────────────────────
    def _parse_response(self, raw_response: str, user_query: str):
        answer       = ""
        summary      = ""
        session_name = None

        try:
            answer_match = re.search(
                r"ANSWER:\s*(.*?)(?=\n\s*SUMMARY:|\n\s*SESSION_NAME:|\Z)",
                raw_response,
                re.DOTALL
            )
            answer = answer_match.group(1).strip() if answer_match else ""

            summary_match = re.search(
                r"SUMMARY:\s*(.*?)(?=\n\s*SESSION_NAME:|\Z)",
                raw_response,
                re.DOTALL
            )
            summary = summary_match.group(1).strip() if summary_match else ""

            name_match = re.search(r"SESSION_NAME:\s*(.+)", raw_response)
            if name_match:
                session_name = name_match.group(1).strip().strip('"\'')
                if len(session_name) > 60:
                    session_name = session_name[:57] + "..."

        except Exception as e:
            logger.error("[PARSE] Response parsing error: %s", e)

        if not answer:
            answer = raw_response.strip()

        # Clean leaked format labels
        for label in ["SUMMARY:", "SESSION_NAME:", "DECLINED:"]:
            idx = answer.find(label)
            if idx != -1:
                answer = answer[:idx].strip()

        # Remove em/en dashes
        answer = answer.replace("—", ", ").replace("–", ", ")

        # Clean artifacts
        answer = re.sub(r",\s*,", ",", answer)
        answer = re.sub(r"  +", " ", answer)
        answer = answer.strip().rstrip(",").strip()

        return answer, summary, session_name

    # ─────────────────────────────────────────
    # DOCUMENT INDEXING
    # ─────────────────────────────────────────
    def process_content(self, *, title, file=None, raw_text=None):
        if not file and not raw_text:
            raise ValueError("At least one of file or raw_text is required")

        upload_root = settings.UPLOAD_DOCUMENTS_DIR
        os.makedirs(upload_root, exist_ok=True)

        stored_filename     = ""
        stored_file_path    = ""
        extracted_file_text = ""

        if file:
            timestamp        = timezone.now().strftime("%Y%m%d%H%M%S")
            stored_filename  = f"{timestamp}_{file.name}"
            stored_file_path = os.path.join(upload_root, stored_filename)

            with open(stored_file_path, "wb") as dest:
                for chunk in file.chunks():
                    dest.write(chunk)

            extracted_file_text = extract_text_from_file(file)
            if not extracted_file_text.strip():
                raise ValueError("Could not extract text from file")

        document = Document.objects.create(
            title=title,
            filename=file.name if file else "",
            stored_filename=stored_filename,
            file_path=stored_file_path,
            raw_text=raw_text or "",
        )

        texts_to_index = []
        if extracted_file_text:
            texts_to_index.append(extracted_file_text)
        if raw_text and raw_text.strip():
            texts_to_index.append(f"Title: {title}\n\n{raw_text}")

        return self._index_text(
            document_id=document.pk,
            text="\n\n".join(texts_to_index),
            source=title,
        )

    def _index_text(self, *, document_id, text, source):
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks    = splitter.split_text(text)
        ids       = [f"{document_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "document_id": document_id,
                "chunk_index": i,
                "source": source,
            }
            for i in range(len(chunks))
        ]

        vector_store = Chroma(
            collection_name="global_collection",
            embedding_function=self.embedding_model,
            persist_directory=settings.CHROMA_PERSIST_DIR
        )
        vector_store.add_texts(texts=chunks, metadatas=metadatas, ids=ids)
        vector_store.persist()

        return {
            "document_id":    document_id,
            "chunks_created": len(chunks),
            "source":         source,
        }