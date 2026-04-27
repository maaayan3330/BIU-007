import { useState } from "react";
import { Send, Shield, X, MessageCircle } from "lucide-react";
import { sendMessageToGuardian } from "../services/chatService";
import "./ChatBot.css";

export default function ChatBot({ openChat, setOpenChat }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your digital guardian 🛡️ How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendMessageToGuardian(userMessage);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <>
      {!openChat && (
        <button className="chat-toggle-button" onClick={() => setOpenChat(true)}>
          <MessageCircle size={26} />
        </button>
      )}

      {openChat && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <Shield size={18} />
              <span>Guardian</span>
            </div>

            <button
              className="chatbot-close-button"
              onClick={() => setOpenChat(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-body">
            <div className="chatbot-messages">
              {messages.map((msg, index) => {
  const isHebrew = /[\u0590-\u05FF]/.test(msg.text);

  return (
    <div
      key={index}
      className={`chatbot-message ${
        msg.sender === "user"
          ? "chatbot-message-user"
          : "chatbot-message-bot"
      } ${isHebrew ? "chatbot-message-hebrew" : ""}`}
    >
      {msg.text}
    </div>
  );
})}

              {loading && (
                <div className="chatbot-message chatbot-message-bot chatbot-typing">
                  Guardian is typing...
                </div>
              )}
            </div>
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Type a message..."
              className="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="chatbot-send-button"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}