import { Server, WebSocket, OPEN } from "ws";

function broadcast(m: string, wss: Server) {
  wss.clients.forEach((client) => {
    if (client.readyState === OPEN) {
      client.send(m);
    }
  });
}

export default function messageHandler(m: string, ws: WebSocket, wss: Server) {
  console.log(`WS : ${m}`);

  // basically echo all messages for now
  broadcast(m, wss);
}
