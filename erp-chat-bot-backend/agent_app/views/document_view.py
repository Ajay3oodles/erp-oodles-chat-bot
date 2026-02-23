import os
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ai_agent import settings
from django.http import FileResponse
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from agent_app.models import Document
from agent_app.utils.response_utils import success_response, error_response


class DocumentApi(APIView):
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_summary="Upload and index a document",
        manual_parameters=[
            openapi.Parameter("file",     openapi.IN_FORM, type=openapi.TYPE_FILE,   required=False, description="File to upload (PDF, TXT, DOCX)"),
            openapi.Parameter("title",    openapi.IN_FORM, type=openapi.TYPE_STRING, required=True,  description="Document title"),
            openapi.Parameter("raw_text", openapi.IN_FORM, type=openapi.TYPE_STRING, required=False, description="Raw text to index instead of file"),
        ],
        responses={201: "Document uploaded", 400: "Bad request", 500: "Server error"}
    )
    def post(self, request):
        uploaded_file = request.FILES.get("file")
        title         = request.POST.get("title", "").strip()
        raw_text      = request.POST.get("raw_text", "").strip()

        if not title:
            return error_response("title is required", status_code=400)
        if not uploaded_file and not raw_text:
            return error_response("Either file or raw_text is required", status_code=400)

        upload_root = settings.UPLOAD_DOCUMENTS_DIR
        os.makedirs(upload_root, exist_ok=True)

        stored_filename  = ""
        stored_file_path = ""

        if uploaded_file:
            timestamp        = timezone.now().strftime("%Y%m%d%H%M%S")
            stored_filename  = f"{timestamp}_{uploaded_file.name}"
            stored_file_path = os.path.join(upload_root, stored_filename)
            try:
                with open(stored_file_path, "wb") as dest:
                    for chunk in uploaded_file.chunks():
                        dest.write(chunk)
            except Exception as e:
                return error_response(f"File save failed: {str(e)}", status_code=500)

        doc = Document.objects.create(
            title           = title,
            filename        = uploaded_file.name if uploaded_file else "",
            stored_filename = stored_filename,
            file_path       = stored_file_path,
            raw_text        = raw_text,
            collection_name = "global_collection",
        )

        return success_response(
            {
                "id":       doc.pk,
                "title":    doc.title,
                "filename": doc.filename,
                "uploaded_at": doc.created_at.isoformat(),
            },
            "Document uploaded successfully",
            201,
        )

    @swagger_auto_schema(
        operation_summary="List all documents",
        responses={200: "Documents list"}
    )
    def get(self, request):
        qs = Document.objects.filter(is_deleted=False).order_by("-created_at")

        docs = [
            {
                "id":          d.pk,
                "title":       d.title,
                "filename":    d.filename,
                "content":     d.raw_text[:120] + "..." if d.raw_text and len(d.raw_text) > 120 else d.raw_text or "",
                "uploaded_at": d.created_at.isoformat(),
            }
            for d in qs
        ]
        return success_response(docs, "Documents fetched successfully")


class DocumentDeleteApi(APIView):

    @swagger_auto_schema(
        operation_summary="Delete a document and remove its vectors from ChromaDB",
        manual_parameters=[
            openapi.Parameter("document_id", openapi.IN_PATH, type=openapi.TYPE_INTEGER, description="Document ID")
        ],
        responses={200: "Deleted", 404: "Not found"}
    )
    def delete(self, request, document_id):
        if not document_id:
            return error_response("document_id is required", 400)

        document = get_object_or_404(Document, pk=document_id, is_deleted=False)

        # Soft delete
        document.is_deleted = True
        document.deleted_at = timezone.now()
        document.save(update_fields=["is_deleted", "deleted_at"])

        # Remove vectors from ChromaDB
        try:
            collection_name = document.collection_name or "global_collection"
            vector_store = Chroma(
                collection_name  = collection_name,
                persist_directory= settings.CHROMA_PERSIST_DIR,
                embedding_function=OpenAIEmbeddings(model="text-embedding-3-small")
            )
            existing = vector_store.get()
            ids_to_delete = [_id for _id in existing["ids"] if _id.startswith(f"{document_id}_")]
            if ids_to_delete:
                vector_store.delete(ids=ids_to_delete)
                vector_store.persist()
        except Exception as e:
            print(f"[DELETE] Vector cleanup error: {e}")

        return success_response(
            {"document_id": document_id},
            "Document deleted and removed from knowledge base"
        )


class DocumentDownloadApi(APIView):

    @swagger_auto_schema(
        operation_summary="Download or preview a document",
        manual_parameters=[
            openapi.Parameter("document_id", openapi.IN_PATH,  type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter("mode",        openapi.IN_QUERY, type=openapi.TYPE_STRING,  default="download", description="download or inline"),
        ],
        responses={200: "File response"}
    )
    def get(self, request, document_id):
        document = Document.objects.filter(id=document_id, is_deleted=False).first()
        if not document:
            return error_response("Document not found", 404)
        if not document.file_path:
            return error_response("No file associated with this document", 400)
        if not os.path.exists(document.file_path):
            return error_response("File not found on server", 404)

        mode     = request.query_params.get("mode", "download")
        filename = document.filename or "document.pdf"

        response = FileResponse(open(document.file_path, "rb"), content_type="application/pdf")
        response["Content-Disposition"] = (
            f'inline; filename="{filename}"' if mode == "inline"
            else f'attachment; filename="{filename}"'
        )
        return response