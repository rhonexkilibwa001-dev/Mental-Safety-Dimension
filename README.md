# Mental Safety Dimension

A mental health community hub built with JavaScript.

## Overview
This project includes:
- A welcoming frontend website for a mental health community
- A lightweight Express backend API
- Community post creation
- Mood check-ins
- Support contact form
- Resource library

## Project structure

```text
Mental-Safety-Dimension/
├── backend/
│   ├── .env.example
│   ├── data/
│   │   └── store.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── .gitignore
└── README.md
```

## Setup

### 1) Install Node.js
Download and install Node.js from https://nodejs.org/

### 2) Install backend dependencies
```bash
cd backend
npm install
cp .env.example .env
```

### 3) Run the project
```bash
npm run dev
```

Then open: http://localhost:5000

## Features
- Calm, supportive landing page
- Resource cards for wellness guidance
- Community post feed
- Mood tracking form
- Support request form
- Persistent local JSON data storage

## Notes
This is a starter project intended for learning and community demos. For production use, add:
- user authentication
- database integration
- secure hosting
- real email or SMS notifications
- admin moderation
