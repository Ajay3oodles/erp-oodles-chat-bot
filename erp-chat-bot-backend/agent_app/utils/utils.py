import os
from chromadb import PersistentClient
from sentence_transformers import SentenceTransformer
import re
from PyPDF2 import PdfReader
from langchain_community.vectorstores import Chroma
from langchain_openai.embeddings import OpenAIEmbeddings

from ai_agent import settings
CHROMA_DB_PATH = settings.CHROMA_PERSIST_DIR
client = PersistentClient(path=CHROMA_DB_PATH)

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def normalize_collection_name(agent_name):
    sanitized_agent = re.sub(r'[^a-zA-Z0-9_-]', '_', agent_name.lower())
    return f"agent_{sanitized_agent}"

def extract_text_from_file(file):

    if file.name.endswith(".pdf"):
        reader = PdfReader(file)
        print(reader)
        return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    elif file.name.endswith(".txt"):
        return file.read().decode('utf-8')
    return ""
 
def retrieve_relevant_docs(agent_name, query, k=50):
    try:
        print(agent_name)
        collection_name = normalize_collection_name(agent_name)
        print(collection_name)
        persist_directory = CHROMA_DB_PATH
 
        print(f"Looking in collection: {collection_name}")

        vector_store = Chroma(
            collection_name=collection_name,
            embedding_function=OpenAIEmbeddings(),
            persist_directory=persist_directory
        )
 
        results = vector_store.similarity_search(query, k=k)
 
        print(f"Found {results} matching documents.>>>>>")
        return results
 
    except Exception as e:
        print("Error during document retrieval:", str(e))
        return []


def split_into_chunks(text, chunk_size=500, overlap=100):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def build_transcript(whatsapp_messages, fireflies, emails):
    transcript = []

    for msg in whatsapp_messages:
        transcript.append(f"[WhatsApp] {msg.timestamp} - {msg.sender}: {msg.text}")

    for call in fireflies:
        transcript.append(f"[Call] {call.timestamp} - {call.transcript}")

    for email in emails:
        transcript.append(f"[Email] {email.timestamp} - From: {email.sender} - Subject: {email.subject} - {email.body}")

    return "\n".join(transcript)

def match_creator(query, creator_names):
    return [name for name in creator_names if name.lower() in query.lower()]
