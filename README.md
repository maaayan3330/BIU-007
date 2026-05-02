# AI Toxicity Filtering Platform

# Project Status: In Progress 🚧 - Final project for real-time detection and filtering of toxic content.

# 💡 Overview

A full-stack system designed to identify and filter toxic text in real-time.
The platform combines a fine-tuned BERT-based model, a FastAPI backend, a React web application (including a chatbot), and a Chrome Extension for live content analysis.


# ⚙️ Backend (FastAPI)

The backend is responsible for all core logic and model interaction.

# Main Responsibilities:
* Receive text input from clients (extension / React app)
* Run inference using a fine-tuned BERT model
* Return structured prediction:
  - label
  - score
  - is_toxic
# Additional Capabilities:
* REST API endpoints for predictions and chatbot handling
* Threshold-based classification logic
* Clean modular architecture (routes, services, utils)
* CORS configuration for frontend communication

 
* 🧠 Model & Fine-Tuning
Based on a pretrained BERT model
Further fine-tuned on a custom dataset for toxicity detection
Training process included:
Manual collection of real-world comments (social media)
Data cleaning and labeling
Iterative experimentation and evaluation
Key Focus:
* Improve detection for Hebrew language
* Handle slang and informal toxic expressions
* Reduce false positives and missed cases

  
# 🌐 Frontend
* React Web Application
* Built with React
* Includes a chatbot interface for user interaction
* Sends user messages to backend
* Displays model responses and predictions


# 🤖 Chatbot Logic
User message → converted into embedding
Compared against predefined intents using cosine similarity
Based on similarity:
Routed to LLM (Gemini)
Or handled with a predefined response

👉 Ensures more relevant responses and avoids unnecessary model calls.

# Chrome Extension
Scans user-generated content (e.g. comments)
Sends text to backend API
Blurs toxic content in real-time
Allows user to reveal hidden content manually

---

### 🖥️ 1. Run the Backend Server

Navigate to the backend folder:

```bash
cd backend
```

Create and activate the virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

Install dependencies to the virtual environment:
```bash
pip install -r requirements.txt
```

For the dev: create an .env file with the DB credentials
```bash
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/the_guardian_db
```


If you have a "Script Execution" error run this:
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

For the devs: run this when adding new dependencies
```bash
pip freeze > requirements.txt
```

Run the server:

```bash
uvicorn app.main:app --reload
```

The server will start at:

```
http://127.0.0.1:8000
```

You can verify it's running by opening:

```
http://127.0.0.1:8000/docs
```

---

### 🧩 2. Load the Chrome Extension

1. Open Chrome and go to:

   ```
   chrome://extensions/
   ```
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `extension` folder

---

### 🔁 3. Run the Full System

1. Start the backend server
2. Load the extension
3. Open YouTube or Twitter (X)

The extension will automatically detect and blur harmful content.

---

### 🔄 Notes

* If you update the backend → it reloads automatically
* If you update the extension → click **Reload** in Chrome Extensions

---
