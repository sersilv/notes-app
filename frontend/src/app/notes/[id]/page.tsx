import NoteEditor from "@/components/NoteEditor";

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  return <NoteEditor noteId={Number(id)} />;
}
