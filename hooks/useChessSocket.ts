import { useEffect, useRef } from "react";
import { useChessStore } from "@/store/useChessStore";

export const useChessSocket = (gameId: string, mode: string) => {
  const { setSocket, setStatus, applyEngineMove, setPlayerColor } =
    useChessStore();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setStatus("connecting");
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/game/${gameId}?mode=${mode}`,
    );
    socketRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      setSocket(ws);

      // Color negotiation for multiplayer
      const currentColor = useChessStore.getState().playerColor;
      if (currentColor) {
        ws.send(
          JSON.stringify({ type: "ANNOUNCE_COLOR", color: currentColor }),
        );
      } else {
        ws.send(JSON.stringify({ type: "REQUEST_COLOR" }));
      }
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
        } else if (data.type === "REQUEST_COLOR") {
          // Send our color to the newly joined player
          const myColor = useChessStore.getState().playerColor;
          if (myColor) {
            ws.send(
              JSON.stringify({
                type: "ASSIGN_COLOR",
                color: myColor === "w" ? "b" : "w",
              }),
            );
          }
        } else if (
          data.type === "ASSIGN_COLOR" ||
          data.type === "PLAYER_COLOR"
        ) {
          // Receive color assignment from another player or server
          const currentState = useChessStore.getState();
          if (!currentState.playerColor) {
            setPlayerColor(data.color);
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
  }, [gameId, mode, setSocket, applyEngineMove, setStatus, setPlayerColor]);

  return {};
};
