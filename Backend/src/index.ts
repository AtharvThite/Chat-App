import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port : 8000});

interface User{
    socket: WebSocket;
    room: string
}

let allSockets : User[] = [];

wss.on("connection", (socket) => {
    console.log("Connected !");
    socket.on("message", (message) => {
        // @ts-ignore
        const parsedMessage = JSON.parse(message);

        if(parsedMessage.type === "join"){
            allSockets.push({
                socket,
                room : parsedMessage.payload.roomId
            })
        }

        if (parsedMessage.type  === "chat"){
            let currentUserRoom = null;
            for(let i =0; i<allSockets.length; i++){
                if(allSockets[i].socket === socket){
                    currentUserRoom = allSockets[i].room;
                    break;
                }
            }

            for(let i =0; i<allSockets.length; i++){
                if(allSockets[i].room === currentUserRoom && allSockets[i].socket !== socket){
                    const isMine = allSockets[i].socket === socket;  
                    allSockets[i].socket.send(
                        JSON.stringify({
                            type: "chat",
                            payload: {
                                message: parsedMessage.payload.message,
                                isMine: isMine, 
                            },
                        })
                    );
                }
            }
        }
    })
})