import { useEffect, useRef } from "react";
import { useChessStore } from "@/store/useChessStore";

export const useChessSocket = (
  gameId: string,
  mode: string,
  initialColor?: string,
) => {
  const { setSocket, setStatus, applyEngineMove, setPlayerColor } =
    useChessStore();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setStatus("connecting");
    const colorParam = initialColor ? `&color=${initialColor}` : "";
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/game/${gameId}?mode=${mode}${colorParam}`,
    );
    socketRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("Disconnected from backend");
      setStatus("disconnected");
      setSocket(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "ENGINE_MOVE") {
          applyEngineMove(data.move);
        } else if (data.type === "COLOR_ASSIGNED") {
          setPlayerColor(data.color);
          if (mode === "bot" && data.color === "b") {
            ws.send(JSON.stringify({ type: "ANNOUNCE_COLOR", color: "b" }));
          }
        } else if (data.move && !data.type) {
          // Fallback if the backend broadcasts a bare `{ move, fen }` without type
          applyEngineMove(data.move);
        } else if (data.type === "ERROR") {
          console.error("Backend Error:", data.message);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message", err);
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };

    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, [
    gameId,
    mode,
    initialColor,
    setSocket,
    applyEngineMove,
    setStatus,
    setPlayerColor,
  ]);

  return {};
};
