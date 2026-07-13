from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import DEFAULT_CATEGORIES, Category, Note

User = get_user_model()


class AuthAPITests(APITestCase):
    def test_register_creates_user_and_default_categories(self):
        response = self.client.post(
            reverse("register"),
            {"email": "new@example.com", "password": "secret12"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["email"], "new@example.com")
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        user = User.objects.get(email="new@example.com")
        categories = Category.objects.filter(user=user)
        self.assertEqual(categories.count(), len(DEFAULT_CATEGORIES))
        self.assertEqual(
            list(categories.values_list("name", flat=True)),
            [c["name"] for c in DEFAULT_CATEGORIES],
        )

    def test_register_rejects_duplicate_email(self):
        self.client.post(
            reverse("register"),
            {"email": "dup@example.com", "password": "secret12"},
            format="json",
        )
        response = self.client.post(
            reverse("register"),
            {"email": "dup@example.com", "password": "otherpass"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_rejects_short_password(self):
        response = self.client.post(
            reverse("register"),
            {"email": "short@example.com", "password": "123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_valid_credentials(self):
        self.client.post(
            reverse("register"),
            {"email": "login@example.com", "password": "secret12"},
            format="json",
        )

        response = self.client.post(
            reverse("login"),
            {"email": "login@example.com", "password": "secret12"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["email"], "login@example.com")
        self.assertIn("access", response.data)

    def test_login_rejects_invalid_credentials(self):
        self.client.post(
            reverse("register"),
            {"email": "login@example.com", "password": "secret12"},
            format="json",
        )

        response = self.client.post(
            reverse("login"),
            {"email": "login@example.com", "password": "wrongpass"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_requires_email_and_password(self):
        response = self.client.post(reverse("login"), {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CategoryAPITests(APITestCase):
    def setUp(self):
        register = self.client.post(
            reverse("register"),
            {"email": "cats@example.com", "password": "secret12"},
            format="json",
        )
        self.token = register.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        self.user = User.objects.get(email="cats@example.com")
        self.categories = list(Category.objects.filter(user=self.user))

    def test_list_categories_requires_auth(self):
        self.client.credentials()
        response = self.client.get(reverse("category-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_categories_returns_defaults_with_counts(self):
        school = next(c for c in self.categories if c.name == "School")
        Note.objects.create(
            user=self.user, category=school, title="Homework", content="Math"
        )

        response = self.client.get(reverse("category-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), len(DEFAULT_CATEGORIES))

        school_data = next(c for c in response.data if c["name"] == "School")
        self.assertEqual(school_data["note_count"], 1)
        self.assertEqual(school_data["dot_color"], "#FCDC94")


class NoteAPITests(APITestCase):
    def setUp(self):
        register = self.client.post(
            reverse("register"),
            {"email": "notes@example.com", "password": "secret12"},
            format="json",
        )
        self.token = register.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        self.user = User.objects.get(email="notes@example.com")
        self.random = Category.objects.get(user=self.user, name="Random Thoughts")
        self.school = Category.objects.get(user=self.user, name="School")
        self.personal = Category.objects.get(user=self.user, name="Personal")

    def test_create_note_without_category_uses_first_default(self):
        response = self.client.post(reverse("note-list-create"), {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["category"]["name"], "Random Thoughts")
        self.assertEqual(response.data["title"], "")
        self.assertEqual(response.data["content"], "")

    def test_create_note_backfills_missing_categories(self):
        Category.objects.filter(user=self.user).delete()

        response = self.client.post(reverse("note-list-create"), {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.filter(user=self.user).count(), 4)
        self.assertEqual(response.data["category"]["name"], "Random Thoughts")

    def test_create_note_with_specific_category(self):
        response = self.client.post(
            reverse("note-list-create"),
            {"category_id": self.personal.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["category"]["name"], "Personal")

    def test_list_notes_returns_user_notes_only(self):
        self.client.post(reverse("note-list-create"), {}, format="json")
        self.client.post(
            reverse("note-list-create"),
            {"category_id": self.school.id},
            format="json",
        )

        other = User.objects.create_user(
            username="other@example.com",
            email="other@example.com",
            password="secret12",
        )
        other_cat = Category.objects.create(
            user=other, name="Other", dot_color="#111111"
        )
        Note.objects.create(user=other, category=other_cat, title="Private")

        response = self.client.get(reverse("note-list-create"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_notes_by_category(self):
        self.client.post(reverse("note-list-create"), {}, format="json")
        self.client.post(
            reverse("note-list-create"),
            {"category_id": self.school.id},
            format="json",
        )
        self.client.post(
            reverse("note-list-create"),
            {"category_id": self.school.id},
            format="json",
        )

        response = self.client.get(
            reverse("note-list-create"), {"category": self.school.id}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertTrue(
            all(note["category"]["name"] == "School" for note in response.data)
        )

    def test_update_note_title_and_content(self):
        create = self.client.post(reverse("note-list-create"), {}, format="json")
        note_id = create.data["id"]

        response = self.client.patch(
            reverse("note-detail", kwargs={"pk": note_id}),
            {"title": "Grocery List", "content": "Milk\nEggs"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Grocery List")
        self.assertEqual(response.data["content"], "Milk\nEggs")

    def test_update_note_category_changes_category(self):
        create = self.client.post(reverse("note-list-create"), {}, format="json")
        note_id = create.data["id"]

        response = self.client.patch(
            reverse("note-detail", kwargs={"pk": note_id}),
            {"category_id": self.personal.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["category"]["name"], "Personal")
        self.assertEqual(response.data["category"]["dot_color"], "#78ABA8")

    def test_retrieve_single_note(self):
        create = self.client.post(
            reverse("note-list-create"),
            {"category_id": self.school.id},
            format="json",
        )
        note_id = create.data["id"]

        self.client.patch(
            reverse("note-detail", kwargs={"pk": note_id}),
            {"title": "Vacation Ideas"},
            format="json",
        )

        response = self.client.get(reverse("note-detail", kwargs={"pk": note_id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Vacation Ideas")

    def test_user_cannot_access_another_users_note(self):
        create = self.client.post(reverse("note-list-create"), {}, format="json")
        note_id = create.data["id"]

        other_register = self.client.post(
            reverse("register"),
            {"email": "other@example.com", "password": "secret12"},
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {other_register.data['access']}"
        )

        response = self.client.get(reverse("note-detail", kwargs={"pk": note_id}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_notes_require_authentication(self):
        self.client.credentials()
        response = self.client.get(reverse("note-list-create"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
