import { io, Socket } from "socket.io-client";

let socket: Socket | null;

export const connectWithSocketServer = () => {
  socket = io("http://localhost:5000");
  socket.on("connect", () => {
    console.log("Connected to socket server")
  })
};