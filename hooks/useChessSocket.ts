import { useEffect, useRef } from 'react';
import { useChessStore } from '@/store/useChessStore';

export const useChessSocket = (gameId: string) => {
  const { setSocket, setStatus, applyEngineMove } = useChessStore();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setStatus("connecting");
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/game/${gameId}`);
    socketRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      setSocket(ws)
    }

    ws.onclose = () => setStatus("disconnected");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ENGINE_MOVE") {
          applyEngineMove(data.move);
        }

        if (data.type === "ERROR") {
          console.error("Backend Error:", data.message);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message", err)
      }

    };

    ws.onerror = () => {
      setStatus("error");
    }
    // Store the socket globally or in a way makeMove can access it
    // Or just pass the send function to the store

    ws.onclose = () => {
      console.log("Disconnected from Cerberus");
      setStatus("disconnected");
      setSocket(null);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
    };
  }, [gameId, setSocket, applyEngineMove, setStatus]);

  return {};
};
