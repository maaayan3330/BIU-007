import { useState } from "react";
import { Send, Shield, X, MessageCircle } from "lucide-react";
import { sendMessageToGuardian } from "../services/chatService";
import "./ChatBot.css";

export default function ChatBot({ openChat, setOpenChat }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uiLanguage, setUiLanguage] = useState("en");

  const isHebrewUI = uiLanguage === "he";

  const suggestions = isHebrewUI
    ? ["איך התוסף עובד?", "למה כדאי להשתמש ב-Guardian?"]
    : ["How does Guardian work?", "Why should I use Guardian?"];

  const handleSend = async (customMessage) => {
    const messageToSend = customMessage || input;

    if (!messageToSend.trim() || loading) return;

    const userMessage = messageToSend.trim();

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
          text: isHebrewUI
            ? "משהו השתבש. נסי שוב בעוד רגע."
            : "Sorry, something went wrong. Please try again.",
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

            <div className="chatbot-header-actions">
              <button
                className="chatbot-language-button"
                onClick={() =>
                  setUiLanguage((prev) => (prev === "he" ? "en" : "he"))
                }
              >
                {isHebrewUI ? "EN" : "עב"}
              </button>

              <button
                className="chatbot-close-button"
                onClick={() => setOpenChat(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="chatbot-body">
            <div className="chatbot-messages">
              {messages.length === 0 && (
                <div
                  className={`chatbot-welcome ${
                    isHebrewUI ? "chatbot-welcome-hebrew" : ""
                  }`}
                >
                  <img
                    src="/guardian-bot.png"
                    alt="Guardian bot"
                    className="chatbot-welcome-image"
                  />

                  <h3>
                    {isHebrewUI
                      ? "היי, איך אפשר לעזור לך היום?"
                      : "Hi, how can I help you today?"}
                  </h3>

                  <p>
                    {isHebrewUI
                    ? "אפשר לשאול על תגובות פוגעניות, התוסף של Guardian או הפלטפורמה."
                    : "Ask me about harmful comments, the Guardian extension, or the platform."}
                  </p>

                  <div className="chatbot-suggestions">
                    {suggestions.map((text) => (
                      <button key={text} onClick={() => handleSend(text)}>
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                <div
                  className={`chatbot-message chatbot-message-bot chatbot-typing ${
                    isHebrewUI ? "chatbot-message-hebrew" : ""
                  }`}
                >
                  {isHebrewUI ? "Guardian מקליד..." : "Guardian is typing..."}
                </div>
              )}
            </div>
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder={isHebrewUI ? "כתבי הודעה..." : "Type a message..."}
              className={`chatbot-input ${
                isHebrewUI ? "chatbot-input-hebrew" : ""
              }`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              onClick={() => handleSend()}
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