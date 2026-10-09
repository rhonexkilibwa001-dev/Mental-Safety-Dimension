const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendPath = path.join(__dirname, "..", "frontend");
const dataPath = path.join(__dirname, "data", "store.json");

app.use(cors());
app.use(express.json());

function ensureDataFile() {
  const dataDir = path.dirname(dataPath);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(
      dataPath,
      JSON.stringify(
        {
          resources: [],
          posts: [],
          checkins: [],
          contacts: []
        },
        null,
        2
      )
    );
  }
}

function readStore() {
  ensureDataFile();
  const data = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(data);
}

function writeStore(store) {
  fs.writeFileSync(dataPath, JSON.stringify(store, null, 2));
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Mental Safety Dimension API is running."
  });
});

app.get("/api/resources", (req, res) => {
  const store = readStore();
  res.json(store.resources);
});

app.get("/api/posts", (req, res) => {
  const store = readStore();
  res.json(store.posts);
});

app.post("/api/posts", (req, res) => {
  const { name, title, content } = req.body;

  if (!name || !title || !content) {
    return res.status(400).json({
      message: "Name, title, and content are required."
    });
  }

  const store = readStore();
  const newPost = {
    id: Date.now(),
    name,
    title,
    content,
    createdAt: new Date().toISOString()
  };

  store.posts.unshift(newPost);
  writeStore(store);

  res.status(201).json(newPost);
});

app.post("/api/checkins", (req, res) => {
  const { mood, note } = req.body;

  if (!mood) {
    return res.status(400).json({
      message: "Mood is required."
    });
  }

  const store = readStore();
  const newCheckin = {
    id: Date.now(),
    mood,
    note: note || "",
    createdAt: new Date().toISOString()
  };

  store.checkins.unshift(newCheckin);
  writeStore(store);

  res.status(201).json({
    message: "Check-in saved successfully.",
    entry: newCheckin
  });
});

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      message: "Name, email, and message are required."
    });
  }

  const store = readStore();
  const newContact = {
    id: Date.now(),
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };

  store.contacts.unshift(newContact);
  writeStore(store);

  res.status(201).json({
    message: "Support request received. A community volunteer will follow up soon."
  });
});

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Mental Safety Dimension server running on http://localhost:${PORT}`);
});
