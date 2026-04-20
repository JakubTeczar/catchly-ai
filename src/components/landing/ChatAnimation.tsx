"use client";

import { useState, useEffect } from "react";
import "./ChatAnimation.scss";

export interface ChatMessage {
  sender: "bot" | "user";
  text: string;
}

interface Props {
  messages: ChatMessage[];
  botName?: string;
}

export function ChatAnimation({ messages, botName = "Catchly AI" }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (visibleCount === messages.length) {
      t = setTimeout(() => {
        setVisibleCount(0);
        setShowTyping(false);
      }, 3500);
    } else if (showTyping) {
      t = setTimeout(() => {
        setShowTyping(false);
        setVisibleCount((c) => c + 1);
      }, 1500);
    } else {
      const next = messages[visibleCount];
      if (next?.sender === "bot") {
        t = setTimeout(() => setShowTyping(true), visibleCount === 0 ? 700 : 500);
      } else {
        t = setTimeout(() => setVisibleCount((c) => c + 1), visibleCount === 0 ? 900 : 750);
      }
    }

    return () => clearTimeout(t);
  }, [visibleCount, showTyping]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="chat-anim">
      <div className="chat-anim-header">
        <div className="chat-anim-avatar">C</div>
        <div>
          <p className="chat-anim-name">{botName}</p>
          <p className="chat-anim-status">{showTyping ? "pisze..." : "online"}</p>
        </div>
      </div>
      <div className="chat-anim-messages">
        {messages.slice(0, visibleCount).map((msg, i) => (
          <div key={i} className={`chat-anim-row chat-anim-row--${msg.sender}`}>
            {msg.sender === "bot" && (
              <div className="chat-anim-avatar chat-anim-avatar--sm">C</div>
            )}
            <div className={`chat-anim-bubble chat-anim-bubble--${msg.sender}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {showTyping && (
          <div className="chat-anim-row chat-anim-row--bot">
            <div className="chat-anim-avatar chat-anim-avatar--sm">C</div>
            <div className="chat-anim-bubble chat-anim-bubble--bot chat-anim-bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
