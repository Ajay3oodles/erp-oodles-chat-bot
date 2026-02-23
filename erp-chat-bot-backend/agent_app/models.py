# python
import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class BaseEntity(models.Model):
    created_by = models.CharField(max_length=255, null=True, blank=True)
    updated_by = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    is_deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True

class Lead(BaseEntity):
    """
    Stores website visitor details.
    One lead can have multiple sessions.
    """

    first_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "lead"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["phone"]),
        ]

    def __str__(self):
        return f"{self.first_name} ({self.email or self.phone})"

class Document(BaseEntity):
    filename = models.CharField(max_length=255, blank=True)           # original filename
    stored_filename = models.CharField(max_length=512, blank=True)    # filename saved (timestamped)
    file_path = models.TextField(blank=True)                          # full local path
    collection_name = models.CharField(max_length=255, blank=True)
    title = models.CharField(max_length=255, default="...")
    raw_text = models.TextField(blank=True)  # NEW (for raw_text uploads)

    def __str__(self):
        return f"{self.filename} (id={self.pk})"

    class Meta:
        db_table = "document"

class Session(BaseEntity):
    """
    Conversation container.
    Each session belongs to a Lead.
    """

    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name="sessions",
        null=True,
        blank=True,
    )

    session_name = models.CharField(max_length=255)

    session_token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        db_index=True
    )

    is_active = models.BooleanField(default=True)

    metadata = models.JSONField(default=dict, blank=True, null=True)

    class Meta:
        db_table = "session"

    def __str__(self):
        return self.session_name

class User(AbstractUser):
    """
    Custom user model. Extends Django's AbstractUser so all
    built-in auth (admin panel, password hashing, JWT) works out of the box.
    """
    name  = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)



    def __str__(self):
        return self.username


class Chat(BaseEntity):
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name="chats"
    )


    message = models.TextField()
    summary = models.TextField()

    class Meta:
        db_table = "chat"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["session", "created_at"]),
        ]