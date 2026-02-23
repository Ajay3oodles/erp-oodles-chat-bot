from rest_framework import serializers
from agent_app.models import Session


class SessionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Session
        fields = [
            "id",
            "session_token",
            "session_name",
            "created_at",
        ]
