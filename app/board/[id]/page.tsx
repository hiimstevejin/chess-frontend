import ChessGame from "@/components/board/ChessGame";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: PageProps ) {
  const { id } = await params;

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-150 p-4 bg-slate-800 shadow-2xl">
         <ChessGame gameId={id} />
      </div>
    </main>
  );
}
