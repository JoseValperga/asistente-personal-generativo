"use client";

import { useState } from "react";
import { ClientMessage } from "./actions";
import { useActions, useUIState } from "ai/rsc";
import { generateId } from "ai";


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-grow overflow-y-auto bg-gray-100 p-4 rounded-lg mb-4 border border-black">
        {conversation.map((message: ClientMessage) => (
          <div key={message.id} className="mb-2 p-2 bg-white rounded shadow">
            {message.role}: {message.display}
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md grid grid-cols-5 gap-3 border border-black">
        <input
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
          }}
          className="col-span-4 w-full p-2 border border-gray-300 rounded mb-2"
          placeholder="Escribe un mensaje..."
        />
            
        <button className="col-span-1 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
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
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
