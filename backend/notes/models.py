from django.conf import settings
from django.db import models


DEFAULT_CATEGORIES = [
    {"name": "Random Thoughts", "dot_color": "#EF9C66"},
    {"name": "School", "dot_color": "#FCDC94"},
    {"name": "Personal", "dot_color": "#78ABA8"},
    {"name": "Drama", "dot_color": "#C8CFA0"},
]


def ensure_default_categories(user):
    existing_names = set(
        Category.objects.filter(user=user).values_list("name", flat=True)
    )
    created = []
    for cat in DEFAULT_CATEGORIES:
        if cat["name"] not in existing_names:
            created.append(Category.objects.create(user=user, **cat))
    return created


class Category(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
    )
    name = models.CharField(max_length=100)
    dot_color = models.CharField(max_length=7)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "categories"
        unique_together = ["user", "name"]
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.name} ({self.user.email})"


class Note(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    title = models.CharField(max_length=255, blank=True, default="")
    content = models.TextField(blank=True, default="")
    last_edited = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-last_edited"]

    def __str__(self):
        return self.title or f"Note {self.pk}"
