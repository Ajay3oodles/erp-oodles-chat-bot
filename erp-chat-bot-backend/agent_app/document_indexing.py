
import os
import re
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
from agent_app.models import Document
from agent_app.utils.utils import extract_text_from_file, normalize_collection_name
from ai_agent import settings

def normalize_collection_name(agent):
    sanitized_agent = re.sub(r'[^a-zA-Z0-9_-]', '_', agent.lower())
    return f"agent_{sanitized_agent}"

def save_uploaded_file_to_chroma(agent, file,document_id):
    try:
        text = extract_text_from_file(file)
        print("Extracted text:", text[:500], "...")  # Only show first 500 chars

        if not text:
            raise ValueError("Could not extract text from file")

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_text(text)
        print(f"Total chunks created: {len(chunks)}")

        collection_name = normalize_collection_name(agent)

        # IMPORTANT: use settings → not path calculation here
        persist_directory = settings.CHROMA_PERSIST_DIR
        print("Persist directory =>", persist_directory)

        # Try primary model first, fallback if access denied
        model_candidates = ["text-embedding-3-small", "text-embedding-ada-002"]
        embeddings_model = None
        for model_name in model_candidates:
            try:
                print(f"Trying embeddings model: {model_name}...")
                embeddings_model = OpenAIEmbeddings(model=model_name)
                embeddings_model.embed_documents(["Test"])
                print(f"Model {model_name} works!")
                break
            except Exception as e:
                print(f"Model {model_name} failed: {e}")
                embeddings_model = None

        if not embeddings_model:
            raise RuntimeError("No accessible embedding models available for this project.")

        print("Getting embeddings for chunks...")
        embeddings = embeddings_model.embed_documents(chunks)
        print("Embeddings created!")


        # Prepare unique IDs + metadata
        ids = []
        metadatas = []

        for index, chunk in enumerate(chunks):
            ids.append(f"{document_id}_{index}")
            metadatas.append({
                "agent": agent,
                "documentId": document_id,
                "chunkIndex": index
            })
        print("Chunks created With ")

        vector_store = Chroma.from_texts(
            texts=chunks,
            ids=ids,
            metadatas=metadatas,
            embedding=embeddings_model,
            collection_name=collection_name,
            persist_directory=persist_directory
        )

        vector_store.persist()
        print("Saved successfully in Chroma!")
        return True

    except Exception as e:
        print("[Indexing Error]", e)
        return False

def save_uploaded_file_to_chroma_without_document_id(agent, file):
    try:
        text = extract_text_from_file(file)
        print("Extracted text:", text[:500], "...")

        if not text:
            raise ValueError("Could not extract text from file")

        # Split text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = text_splitter.split_text(text)
        print(f"Total chunks created: {len(chunks)}")

        collection_name = normalize_collection_name(agent)
        persist_directory = settings.CHROMA_PERSIST_DIR
        print("Saving inside collection:", collection_name)

        # Load embedding model
        embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")

        # IMPORTANT:
        # Instead of creating new DB every time, load existing DB
        vectordb = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings_model,
            persist_directory=persist_directory
        )

        # Add chunks without metadata or IDs
        vectordb.add_texts(chunks)

        vectordb.persist()

        print("🎯 Saved chunks into vector DB successfully!")
        return True

    except Exception as e:
        print("❌ Error:", e)
        return False

def index_file_from_saved_path(agent, document_id):
    try:
        document = Document.objects.filter(pk=document_id, is_deleted=False).first()
        if not document:
            raise ValueError("Document record not found!")

        file_path = document.file_path

        if not os.path.exists(file_path):
            raise ValueError("File not found in storage path")

        with open(file_path, "rb") as file:
            text = extract_text_from_file(file)

        if not text:
            raise ValueError("Extracted text is empty")

        print("Extracted text:", text[:500])

        # Same logic
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_text(text)

        collection_name = normalize_collection_name(agent)
        persist_directory = settings.CHROMA_PERSIST_DIR

        model_candidates = ["text-embedding-3-small", "text-embedding-ada-002"]
        embeddings_model = None

        for model_name in model_candidates:
            try:
                embeddings_model = OpenAIEmbeddings(model=model_name)
                embeddings_model.embed_documents(["Test"])
                break
            except Exception:
                embeddings_model = None

        if not embeddings_model:
            raise RuntimeError("No embedding model accessible")

        ids = []
        metadatas = []

        for idx, chunk in enumerate(chunks):
            ids.append(f"{document_id}_{idx}")
            metadatas.append({
                "documentId": document_id,
                "chunkIndex": idx,
                "agent": agent
            })

        vectorStore = Chroma.from_texts(
            texts=chunks,
            ids=ids,
            metadatas=metadatas,
            embedding=embeddings_model,
            collection_name=collection_name,
            persist_directory=persist_directory
        )

        vectorStore.persist()
        return True

    except Exception as e:
        print("[Indexing Failed]", e)
        return False