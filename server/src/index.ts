import express from "express";
import http from "http";
import WebSocket from "ws";
import buildHttpRoutes from "./http/buildHttpRoutes";
import buildWebSocketEvents from "./wss/buildWebSocketEvents";

// Crée une application Express
const app = express();

// Crée un serveur HTTP basé sur Express
const server = http.createServer(app);

// Initialise un serveur WebSocket sur le même serveur HTTP
const wss = new WebSocket.Server({ server });

// Gérer les requêtes HTTP
app.use(buildHttpRoutes());

// Gérer les connexions WebSocket
wss.on("connection", (ws) => buildWebSocketEvents(ws, wss));

// Démarrer le serveur
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
