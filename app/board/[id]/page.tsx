import ChessGame from "@/components/board/ChessGame";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BoardPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const mode = (resolvedSearchParams.mode as string) || "player";
  const color = (resolvedSearchParams.color as string) || undefined;

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-4 lg:px-8 lg:py-5">
      <div className="mx-auto w-full max-w-6xl rounded-xl bg-slate-800 p-4 shadow-2xl lg:p-5">
        <ChessGame gameId={id} mode={mode} initialColor={color} />
      </div>
    </main>
  );
}
