from django.urls import path, include
from rest_framework.routers import DefaultRouter
from agent_app.views.query_views import (
    AgentFileUploadView,
    AgentQueryView,
)
from rest_framework_simplejwt.views import TokenRefreshView
from agent_app.views.auth_view import SignupView, LoginView, LogoutView
from agent_app.views.lead_view import LeadListApi
from agent_app.views.document_view import DocumentApi, DocumentDownloadApi
from agent_app.views.session_chat_view import SessionChatListApi,SessionListApi,SessionDeleteAndUpdateApi
router = DefaultRouter()

urlpatterns = [

    # Auth
    path("api/auth/signup/", SignupView.as_view(), name="auth-signup"),
    path("api/auth/login/", LoginView.as_view(), name="auth-login"),
    path("api/auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # Upload
    path("api/chat-bot/v1/upload/", AgentFileUploadView.as_view()),

    # Query
    path("api/chat-bot/v1/query/", AgentQueryView.as_view()),

    # Documents list
    path("api/chat-bot/v1/documents/", DocumentApi.as_view(), name="documents"),


    path(
        "api/chat-bot/v1/sessions/<int:session_id>/chats/",
        SessionChatListApi.as_view(),
        name="session-chats"
    ),

    path(
        "api/chat-bot/v1/sessions/<int:session_id>/",
        SessionDeleteAndUpdateApi.as_view(),
        name="delete-session"
    ),

    path(
        "api/chat-bot/v1/sessions/",
        SessionListApi.as_view(),
        name="session-list"
    ),
    path(
        "api/chat-bot/v1/documents/<int:document_id>/download/",
        DocumentDownloadApi.as_view(),
        name="document-download"
    ),


    path("api/chat-bot/v1/leads/", LeadListApi.as_view(), name="leads"),

    # 🔥 Agent CRUD via ViewSet (router)
    path("", include(router.urls)),
]
