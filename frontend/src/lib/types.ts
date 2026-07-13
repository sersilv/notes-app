export interface User {
  id: number;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  dot_color: string;
  note_count: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: Category;
  last_edited: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}
