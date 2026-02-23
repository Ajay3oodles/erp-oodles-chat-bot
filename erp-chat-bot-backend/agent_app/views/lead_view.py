from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from agent_app.models import Lead, Session, Chat
from agent_app.utils.response_utils import success_response, error_response


class LeadListApi(APIView):
    @swagger_auto_schema(
        operation_summary="Get all active leads",
        responses={200: "List of leads"}
    )
    def get(self, request):
        leads = (
            Lead.objects
            .filter(is_deleted=False)
            .order_by('-created_at')
        )

        data = [
            {
                'id': lead.id,
                'first_name': lead.first_name,
                'email': lead.email,
                'phone': lead.phone,
                'created_at': lead.created_at.isoformat(),
            }
            for lead in leads
        ]

        return success_response(data, "Leads fetched successfully")