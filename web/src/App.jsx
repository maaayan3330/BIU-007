import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Join from "./pages/Join";
import Header from "./components/Home/Header";
import ChatBot from "./chatBot/ChatBot";

import EmbeddingDemo from "./components/EmbeddingDemo"; // demo!!!!

export default function App() {
  const [openChat, setOpenChat] = useState(false);

  return (
    <BrowserRouter>
      <Header setOpenChat={setOpenChat} />

      <Routes>
        <Route path="/" element={<Home setOpenChat={setOpenChat} />} />
        <Route path="/join" element={<Join />} />

        {/* demo*/}
        <Route path="/demo" element={<EmbeddingDemo />} />
      </Routes>

      <ChatBot openChat={openChat} setOpenChat={setOpenChat} />
    </BrowserRouter>
  );
}