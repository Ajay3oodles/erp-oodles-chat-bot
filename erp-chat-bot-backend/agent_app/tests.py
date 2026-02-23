from rest_framework import serializers
from agent_app.models import Agent


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ["id", "name", "description", "is_active", "created_at"]
