# Mental Safety Dimension

A mental health community hub built with JavaScript, featuring email-based pseudo accounts.

## Overview
This project includes:
- A welcoming frontend website for a mental health community
- A lightweight Express backend API
- Email-based pseudo account creation and login
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
│   │   ├── sessions.json
│   │   ├── store.json
│   │   ├── users.json
│   │   └── ???
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
- Email-based pseudo account creation and login
- Local persistent JSON-based user and session handling

## Account flow
- Create an account with your email and password
- Log in using the same email and password
- Your session is saved in the browser and validated by the backend
- Log out at any time using the user panel

## Notes
This is a demo pseudo-authentication system for local development and learning. It is not production-grade security. For real-world use, you would add:
- password hashing
- real database storage
- secure JWT/session management
- email verification
- admin moderation and user roles
