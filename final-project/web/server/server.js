import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getGuardianReply } from "./geminiService.js";

//////// for demo - delete after
import { classifyRoute } from "./utils/semanticRouter.js";
//////

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Guardian server is running" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await getGuardianReply(message);
    res.json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Something went wrong",
    });
  }
});


//////////////////for demo - delete after
app.post("/api/router-demo", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await classifyRoute(message);
    res.json(result);
  } catch (error) {
    console.error("Router demo error:", error);
    res.status(500).json({ error: "Failed to classify route" });
  }
});
///////////////////////


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

