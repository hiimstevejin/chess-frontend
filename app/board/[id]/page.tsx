import ChessGame from "@/components/board/ChessGame";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BoardPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const mode = (resolvedSearchParams.mode as string) || "player";

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-150 p-4 bg-slate-800 shadow-2xl">
        <ChessGame gameId={id} mode={mode} />
      </div>
    </main>
  );
}
