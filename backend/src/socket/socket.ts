import { Server, Socket } from "socket.io";

export async function initSocket(io: Server)
{
    io.on("connection", (socket: Socket) => {
        console.log(socket.id)
    });
}