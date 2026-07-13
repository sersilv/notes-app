export default function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <div className="flex h-72 w-72 items-center justify-center">
        <img
          src="/images/boba-tea.png"
          alt="Boba tea"
          className="h-full w-auto object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <p className="text-center font-inter text-lg text-brown-light">
        I’m just here waiting for your charming notes...
      </p>
    </div>
  );
}
