import { Server, WebSocket } from "ws";
import messageHandler from "./messageHandler";

export default function buildWebSocketEvents(ws: WebSocket, wss: Server) {
  ws.on("message", (m) => messageHandler(m.toString(), ws, wss));

  ws.on("close", () => {
    console.log("Client déconnecté");
  });

  return;
}
