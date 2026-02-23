from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from agent_app.serializers.chat_serializer import ChatSerializer
from agent_app.serializers.session_serializer import SessionSerializer
from agent_app.services.session_chat_service import SessionChatService
from agent_app.utils.response_utils import success_response, error_response


class SessionChatListApi(APIView):

    @swagger_auto_schema(
        operation_summary="Get chats of a session",
        manual_parameters=[
            openapi.Parameter(
                "session_id",
                openapi.IN_PATH,
                description="Session primary key",
                type=openapi.TYPE_INTEGER,
                required=True
            )
        ],
        responses={200: ChatSerializer(many=True)}
    )
    def get(self, request, session_id):
        try:
            # 1️⃣ Get session safely
            session = SessionChatService.get_session(session_id)
            if not session:
                return error_response(
                    message="Session not found",
                    status_code=404
                )

            chats = SessionChatService.get_chats_for_session(session)

            serializer = ChatSerializer(chats, many=True)

            return success_response(
                serializer.data,
                "Chats fetched successfully"
            )

        except Exception as e:
            return error_response(
                message=str(e),
                status_code=400
            )

class SessionDeleteAndUpdateApi(APIView):

    @swagger_auto_schema(
        operation_summary="Delete a session and all related chats",
        manual_parameters=[
            openapi.Parameter(
                "session_id",
                openapi.IN_PATH,
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={200: "Session deleted"}
    )
    def delete(self, request, session_id):
        SessionChatService.delete_session(session_id)

        return success_response(
            message="Session and its chats deleted successfully"
        )

    @swagger_auto_schema(
        operation_summary="Update session name",
        tags=["sessions"],
        manual_parameters=[
            openapi.Parameter(
                "session_id",
                openapi.IN_PATH,
                description="Session primary key",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
            openapi.Parameter(
                "name",
                openapi.IN_QUERY,
                description="New session name",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={200: "Session name updated successfully"}
    )
    def put(self, request, session_id):
        name = request.query_params.get("name")

        if not name:
            return error_response(
                message="name is required",
                status_code=400
            )

        try:
            session = SessionChatService.update_session_name(
                session_id=session_id,
                name=name
            )

            return success_response(
                data={
                    "session_id": session.id,
                    "session_name": session.session_name
                },
                message="Session name updated successfully"
            )

        except ValueError as e:
            return error_response(str(e), 404)

        except Exception as e:
            return error_response(str(e), 400)

class SessionListApi(APIView):
        @swagger_auto_schema(
            operation_summary="List all sessions (non-deleted)",
            tags=["sessions"],
            responses={200: SessionSerializer(many=True)}
        )
        def get(self, request):
            sessions = SessionChatService.get_all_sessions()
            serializer = SessionSerializer(sessions, many=True)
            return success_response(
                data=serializer.data,
                message="Sessions fetched successfully"
            )
