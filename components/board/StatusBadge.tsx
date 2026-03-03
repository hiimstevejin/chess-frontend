import { useChessStore } from "@/store/useChessStore";

export default function StatusBadge() {
  const status = useChessStore((state) => state.status);
  const colors = {
    connected: "bg-green-500",
    connecting: "bg-yellow-500",
    disconnected: "bg-red-500",
    error: "bg-red-700",
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-2 h-2 rounded-full ${colors[status]} animate-pulse`} />
      <span className="text-xs text-slate-300 uppercase tracking-widest font-bold">
        {status}
      </span>
    </div>
  );
}
