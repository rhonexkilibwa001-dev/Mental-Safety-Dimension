const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendPath = path.join(__dirname, "..", "frontend");
const dataDir = path.join(__dirname, "data");
const storePath = path.join(dataDir, "store.json");
const usersPath = path.join(dataDir, "users.json");
const sessionsPath = path.join(dataDir, "sessions.json");

app.use(cors());
app.use(express.json());

function ensureJsonFile(filePath, defaultValue) {
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
}

function readJson(filePath, defaultValue = []) {
  ensureJsonFile(filePath, defaultValue);
  const data = fs.readFileSync(filePath, "utf8");

  try {
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function ensureDataFiles() {
  ensureJsonFile(storePath, { resources: [], posts: [], checkins: [], contacts: [] });
  ensureJsonFile(usersPath, []);
  ensureJsonFile(sessionsPath, []);
}

function readStore() {
  ensureDataFiles();
  return readJson(storePath, { resources: [], posts: [], checkins: [], contacts: [] });
}

function writeStore(store) {
  writeJson(storePath, store);
}

function readUsers() {
  ensureDataFiles();
  return readJson(usersPath, []);
}

function writeUsers(users) {
  writeJson(usersPath, users);
}

function readSessions() {
  ensureDataFiles();
  return readJson(sessionsPath, []);
}

function writeSessions(sessions) {
  writeJson(sessionsPath, sessions);
}

function createToken(email) {
  return Buffer.from(`${email}:${Date.now()}:${Math.random()}`).toString("base64url");
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || req.headers["x-auth-token"];

  if (!authHeader) return null;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }

  return authHeader.trim();
}

function authenticate(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const sessions = readSessions();
  const session = sessions.find((item) => item.token === token);

  if (!session) {
    return res.status(401).json({ message: "Invalid session token." });
  }

  req.user = {
    email: session.email,
    token
  };

  next();
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Mental Safety Dimension API is running."
  });
});

app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required."
    });
  }

  const trimmedEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return res.status(400).json({ message: "Please provide a valid email address." });
  }

  const users = readUsers();
  const existingUser = users.find((user) => user.email === trimmedEmail);

  if (existingUser) {
    return res.status(409).json({
      message: "An account with this email already exists. Please log in instead."
    });
  }

  const newUser = {
    id: Date.now(),
    name: String(name).trim(),
    email: trimmedEmail,
    password: String(password),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  const token = createToken(trimmedEmail);
  const sessions = readSessions();
  sessions.push({
    token,
    email: trimmedEmail,
    createdAt: new Date().toISOString()
  });
  writeSessions(sessions);

  res.status(201).json({
    message: "Account created successfully.",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    },
    token
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required."
    });
  }

  const trimmedEmail = String(email).trim().toLowerCase();
  const users = readUsers();
  const user = users.find(
    (item) => item.email === trimmedEmail && item.password === String(password)
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password."
    });
  }

  const token = createToken(trimmedEmail);
  const sessions = readSessions();
  sessions.push({
    token,
    email: trimmedEmail,
    createdAt: new Date().toISOString()
  });
  writeSessions(sessions);

  res.json({
    message: "Login successful.",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    token
  });
});

app.get("/api/me", authenticate, (req, res) => {
  const users = readUsers();
  const user = users.find((item) => item.email === req.user.email);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

app.post("/api/logout", authenticate, (req, res) => {
  const token = req.user.token;
  const sessions = readSessions();
  const filteredSessions = sessions.filter((session) => session.token !== token);
  writeSessions(filteredSessions);

  res.json({ message: "Logged out successfully." });
});

app.get("/api/resources", (req, res) => {
  const store = readStore();
  res.json(store.resources);
});

app.get("/api/posts", (req, res) => {
  const store = readStore();
  res.json(store.posts);
});

app.post("/api/posts", authenticate, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      message: "Title and content are required."
    });
  }

  const users = readUsers();
  const user = users.find((item) => item.email === req.user.email);
  const store = readStore();

  const newPost = {
    id: Date.now(),
    name: user ? user.name : "Member",
    title: String(title).trim(),
    content: String(content).trim(),
    createdAt: new Date().toISOString()
  };

  store.posts.unshift(newPost);
  writeStore(store);

  res.status(201).json(newPost);
});

app.post("/api/checkins", authenticate, (req, res) => {
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
    createdAt: new Date().toISOString(),
    userEmail: req.user.email
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
