from rest_framework import serializers
from agent_app.models import Chat


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = [
            "id",
            "message",
            "created_at",
        ]
