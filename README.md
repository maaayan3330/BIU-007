🚧 Project Status: In Progress
This is an ongoing final project, currently under active development.


## 🚀 Run the Project Locally

This project consists of two main parts:

* Backend (FastAPI server)
* Chrome Extension

---

### 🖥️ 1. Run the Backend Server

Navigate to the backend folder:

```bash
cd backend
```

Activate the virtual environment:

```bash
venv\Scripts\activate
```

Run the server:

```bash
python -m uvicorn app.main:app --reload
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
