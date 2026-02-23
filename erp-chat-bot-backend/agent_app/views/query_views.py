from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
import os
from dotenv import load_dotenv
from agent_app.services.query_service import QueryService
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
from agent_app.utils.response_utils import success_response, error_response
from rest_framework.views import APIView


class AgentFileUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        tags=["Query Agent And Upload Docs"],
        manual_parameters=[
            openapi.Parameter("file",     openapi.IN_FORM, type=openapi.TYPE_FILE),
            openapi.Parameter("raw_text", openapi.IN_FORM, type=openapi.TYPE_STRING),
            openapi.Parameter("title",    openapi.IN_FORM, type=openapi.TYPE_STRING, required=True),
        ],
        responses={201: "Content indexed successfully"}
    )
    def post(self, request):
        file     = request.FILES.get("file")
        raw_text = request.POST.get("raw_text")
        title    = request.POST.get("title")

        if not title:
            return error_response("title is required", 400)

        if not file and not raw_text:
            return error_response("At least one of file or raw_text is required", 400)

        service = QueryService()
        result  = service.process_content(title=title, file=file, raw_text=raw_text)

        return success_response(
            data=result,
            message="Content indexed successfully",
            status_code=201
        )


class AgentQueryView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        tags=["Query Agent"],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["query"],
            properties={
                "query": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="User's message"
                ),
                "session_id": openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description="Existing session ID. Omit to start a new anonymous session."
                ),
                # NOTE: first_name / email / phone removed from API contract.
                # Contact info is now extracted automatically from conversation
                # by the LLM — users are never asked directly.
            },
        ),
        responses={200: "Answer generated successfully"}
    )
    def post(self, request):
        try:
            user_query = request.data.get("query")
            session_id = request.data.get("session_id")

            if not user_query:
                return error_response("Query is required", 400)

            service = QueryService()

            result = service.handle_query(
                user_query=user_query,
                session_id=session_id,
                # lead_data is gone — the service now extracts it from conversation
            )

            return success_response(
                message="Answer generated successfully",
                data=result
            )

        except Exception as e:
            return error_response(str(e), 400)