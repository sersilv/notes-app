from django.urls import path

from .views import (
    CategoryListView,
    LoginView,
    NoteDetailView,
    NoteListCreateView,
    RegisterView,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("notes/", NoteListCreateView.as_view(), name="note-list-create"),
    path("notes/<int:pk>/", NoteDetailView.as_view(), name="note-detail"),
]
