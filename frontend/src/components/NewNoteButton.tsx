interface NewNoteButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export default function NewNoteButton({ onClick, loading }: NewNoteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 rounded-full border border-brown px-5 py-2 text-sm font-medium text-brown transition-colors hover:bg-brown-dark hover:cursor-pointer disabled:opacity-50"
    >
      <span className="text-lg leading-none">+</span>
      New Note
    </button>
  );
}
