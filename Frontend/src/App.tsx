import { useRef, useState } from "react";
import "./App.css";

function App() {
    const [roomId, setRoomId] = useState(null);
    const [messages, setMessages] = useState([
        { text: "Hello, Welcome to our Chatting App!", isMine: false },
    ]);
    const wsRef = useRef();
    const inputRef = useRef(null);
    const roomRef = useRef(null);

    function joinRoom() {
        // @ts-ignore
        const room = roomRef.current?.value;
        setRoomId(room);

        const ws = new WebSocket("ws://localhost:8000");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((m) => [...m, { text: data.payload.message, isMine: false }]);
        };

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    type: "join",
                    payload: {
                        roomId: room,
                    },
                })
            );
        };

        // @ts-ignore
        wsRef.current = ws;

        return () => {
            ws.close();
        };
    }

    function sendMessage() {
        // @ts-ignore
        const message = inputRef.current?.value;
        // @ts-ignore
        wsRef.current.send(
            JSON.stringify({
                type: "chat",
                payload: {
                    message: message,
                },
            })
        );
        setMessages((m) => [...m, { text: message, isMine: true }]);
        // @ts-ignore
        inputRef.current.value = "";
    }

    return (
        <div className="h-screen bg-black text-white flex flex-col gap-4 p-4 justify-center items-center">
            {!roomId ? (
                <div className="flex flex-col items-center gap-4">
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        ref={roomRef}
                        className="bg-black text-white border border-white p-2 rounded-lg"
                    />
                    <button
                        onClick={joinRoom}
                        className="bg-white text-black px-4 py-2 rounded-lg">
                        Join Room
                    </button>
                </div>
            ) : (
                <>
                    <div className="h-5/6 w-1/2 border border-2-white rounded-3xl bg-[#111111] p-6 overflow-y-scroll">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mt-4 flex ${
                                    msg.isMine ? "justify-end" : "justify-start"
                                }`}
                            >
                                <span
                                    className={`px-2 py-1 rounded-lg ${
                                        msg.isMine
                                            ? "bg-blue-500 text-white"
                                            : "bg-white text-black"
                                    }`}
                                >
                                    {msg.text}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-1/6 w-1/2 border border-2-white rounded-3xl bg-[#111111] py-8 px-4 flex">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type message..."
                            className="bg-black p-2 text-white border border-1-white rounded-lg w-4/5 mr-4"
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-black text-white border border-1-white rounded-lg w-1/5">
                            Send
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
