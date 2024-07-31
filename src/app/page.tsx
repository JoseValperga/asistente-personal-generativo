/*'use client';

import { useState } from 'react';
import { Message, continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  return (
    <div>
      <div>
        {conversation.map((message, index) => (
          <div key={index}>
            {message.role}: {message.content}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            const { messages, newMessage } = await continueConversation([
              ...conversation,
              { role: 'user', content: input },
            ]);

            let textContent = '';

            for await (const delta of readStreamableValue(newMessage)) {
              textContent = `${textContent}${delta}`;

              setConversation([
                ...messages,
                { role: 'assistant', content: textContent },
              ]);
            }
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
*/

"use client";

import { useState } from "react";
import { Message, continueConversation } from "./actions";
import { readStreamableValue } from "ai/rsc";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const { messages, newMessage } = await continueConversation([
      ...conversation,
      { role: "user", content: input },
    ]);

    let textContent = "";

    for await (const delta of readStreamableValue(newMessage)) {
      textContent = `${textContent}${delta}`;

      setConversation([
        ...messages,
        { role: "assistant", content: textContent },
      ]);
    }
    setInput(""); // Clear input after sending message
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-y-auto p-4 mb-24">
        {conversation.map((message, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold">{message.role}:</span> {message.content}
          </div>
        ))}
      </div>

      <div className="flex items-center p-4 border-t border-gray-600 bg-white fixed bottom-0 w-full">
        <textarea
          className="flex-grow p-2 border border-gray-600 rounded mr-20 h-24"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
        />

        <button
          className="p-2 bg-blue-500 text-white rounded"
          onClick={handleSendMessage}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}

/*
'use client';

import { type CoreMessage } from 'ai';
import { useState } from 'react';
import { continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';

export const maxDuration = 30;

export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState('');
  const [data, setData] = useState<any>();
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      {messages.map((m, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content as string}
        </div>
      ))}

      <form
        onSubmit={async e => {
          e.preventDefault();
          const newMessages: CoreMessage[] = [
            ...messages,
            { content: input, role: 'user' },
          ];

          setMessages(newMessages);
          setInput('');

          const result = await continueConversation(newMessages);
          setData(result.data);

          for await (const content of readStreamableValue(result.message)) {
            setMessages([
              ...newMessages,
              {
                role: 'assistant',
                content: content as string,
              },
            ]);
          }
        }}
      >
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}*/

/*
"use client";
import { useState, useEffect } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

interface Task {
  message: string;
  what: string[];
  who: string[];
  when: string;
  since: string;
  until: string;
  about: string[];
  duration: string;
}

const HomePage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async (data: Task[]) => {
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks([]);
  }, []);

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">My Productivity Assistant</h1>
      <TaskForm fetchTasks={fetchTasks} />
      <TaskList tasks={tasks} />
    </div>
  );
};

export default HomePage;
*/
