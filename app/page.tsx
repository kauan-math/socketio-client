"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

interface Message {
  message: string;
  author: string;
  date: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [author, setAuthor] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL);
    socket.connect();
    socket.on("connect", () => {
      socket.on("message", (data: Message) => {
        setMessages((oldState) => [...oldState, data]);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        message: newMessage,
        author,
        date: new Date().toISOString(),
      }),
    })
      .catch(() => alert("Erro ao enviar mensagem"))
      .finally(() => setNewMessage(""));
  }

  return (
    <main className="w-screen h-screen bg-zinc-950 text-white flex flex-col">
      <div className="px-6 pt-5 pb-4 border-b border-zinc-800">
        <input
          className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm px-4 text-center placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          placeholder="Seu nome..."
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {messages.map((message, index) => {
          const isMe = message.author === author.trim();

          return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-sm px-4 py-3 rounded-2xl flex flex-col gap-1 ${
                  isMe
                    ? "bg-white text-zinc-950 items-end"
                    : "bg-zinc-900 border border-zinc-800 text-white items-start"
                }`}
              >
                {!isMe && (
                  <p className="text-xs font-medium text-zinc-400 tracking-wide">
                    {message.author}
                  </p>
                )}
                <p className="text-sm leading-relaxed">{message.message}</p>
                <p
                  className={`text-xs ${isMe ? "text-zinc-400" : "text-zinc-600"}`}
                >
                  {new Date(message.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 pb-6 pt-3 border-t border-zinc-800">
        <form className="flex items-center gap-3" onSubmit={handleSubmit}>
          <input
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !author.trim()}
            className="bg-white text-zinc-950 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-zinc-200 transition-colors disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed cursor-pointer"
          >
            Enviar
          </button>
        </form>
      </div>
    </main>
  );
}