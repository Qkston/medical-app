import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "dotenv";
import initSocket from "./utils/initSocket.js";

config();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: process.env.ALLOWED_ORIGIN,
  serveClient: false,
});
io.on("connection", initSocket);

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server ready on port ${port}`);
});
