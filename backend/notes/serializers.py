from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import Category, Note, ensure_default_categories

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["email", "password"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        email = validated_data["email"]
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
        )
        ensure_default_categories(user)
        return user


class CategorySerializer(serializers.ModelSerializer):
    note_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "dot_color", "note_count"]

    def get_note_count(self, obj):
        return obj.notes.count()


class NoteSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "content",
            "category",
            "category_id",
            "last_edited",
            "created_at",
        ]
        read_only_fields = ["last_edited", "created_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and getattr(request.user, "is_authenticated", False):
            self.fields["category_id"].queryset = Category.objects.filter(
                user=request.user
            )

    def create(self, validated_data):
        user = self.context["request"].user
        category = validated_data.pop("category", None)
        if not category:
            category = Category.objects.filter(user=user).first()
        if not category:
            ensure_default_categories(user)
            category = Category.objects.filter(user=user).first()
        if not category:
            raise serializers.ValidationError(
                {"category": "No categories available for this user."}
            )
        return Note.objects.create(user=user, category=category, **validated_data)
