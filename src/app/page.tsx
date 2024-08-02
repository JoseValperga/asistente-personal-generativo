"use client";

import { useEffect, useRef, useState } from "react";
import { ClientMessage } from "./actions";
import { useActions, useUIState } from "ai/rsc";
import { generateId } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="text-center font-serif border border-black p-4 m-3 rounded-xl">ASISTENTE PERSONAL</div>
      <div className="grid grid-cols-12 gap-4 flex-grow p-4 font-serif">
        <div className="col-span-3 border border-black rounded-lg">
          <p className="text-center font-medium mt-4">Resultados</p>
        </div>

        <div className="col-span-7 flex flex-col">
          <div className="flex-grow overflow-y-auto bg-gray-200 p-4 rounded-lg mb-4 border border-black">
            {conversation.map((message: ClientMessage) => (
              <div
                key={message.id}

                className={`mb-2 p-2 rounded-xl shadow ${
                  message.role === "user" ? "bg-yellow-200" : "bg-orange-200"
                } flex ${
                  message.role === "user" ? "justify-start" : "justify-end"
                }`}
              >
                <span className="font-semibold">{message.role}: </span> {message.display}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md grid grid-cols-5 gap-3 border border-black">
            <input
              type="text"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
              }}
              className="col-span-4 w-full p-2 border border-gray-300 rounded"
              placeholder="Type a message..."
            />

            <button
              className="col-span-1 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
              onClick={async () => {
                setConversation((currentConversation: ClientMessage[]) => [
                  ...currentConversation,
                  { id: generateId(), role: "user", display: input },
                ]);

                const message = await continueConversation(input);

                setConversation((currentConversation: ClientMessage[]) => [
                  ...currentConversation,
                  message,
                ]);

                setInput("");
              }}
            >
              Send Message
            </button>
          </div>
        </div>

        <div className="col-span-2 border border-black rounded-lg">
          <p className="text-center font-medium mt-4">Herramientas</p>
        </div>
      </div>
    </div>
  );
}
