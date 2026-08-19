# QuizCraft 🎯

A full-stack **real-time quiz platform** built with React Native (Expo), Node.js, Express, MongoDB, and Socket.IO.

The application allows teachers to create and publish quizzes, students to attempt quizzes on their own, and — through a live Socket.IO matchmaking system — students to challenge each other to real-time 1v1 quiz battles with live scoring and a declared winner.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Application Workflow](#application-workflow)
- [User Roles](#user-roles)
- [Real-Time Quiz Battle System](#real-time-quiz-battle-system)
- [Data Models](#data-models)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [How to Use](#how-to-use)
  - [Teacher Flow](#teacher-flow)
  - [Student Flow — Solo Quiz](#student-flow--solo-quiz)
  - [Student Flow — Live 1v1 Battle](#student-flow--live-1v1-battle)
- [API Reference](#api-reference)
- [Socket.IO Events](#socketio-events)
- [Environment Variables](#environment-variables)
- [Important Implementation Details](#important-implementation-details)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Learning Objectives](#learning-objectives)
- [Dependencies](#dependencies)
- [License](#license)
- [Author](#author)

---

# Overview

**QuizCraft** is a mobile quiz application designed to bring together quiz creation, solo practice, and competitive live quizzing in one platform.

Instead of a single static quiz-taking experience, the application provides:

1. Separate registration/login for students and teachers.
2. A quiz builder for teachers to publish multiple-choice quizzes.
3. A student dashboard to browse and attempt available quizzes.
4. Server-side scoring and attempt tracking.
5. A real-time matchmaking system that pairs students for live 1v1 quiz battles.
6. Live score updates, question synchronization, and automatic winner determination.

The project combines a mobile frontend (Expo/React Native) with a Node.js/Express REST API and a Socket.IO real-time layer backed by MongoDB.

---

# Key Features

## Authentication

Role-based registration and login for two account types — **Student** and **Teacher** — each with dedicated endpoints, JWT-based sessions, and bcrypt password hashing.

```js
router.post('/register-student', registerStudent);
router.post('/login-student', loginStudent);

router.post('/register-teacher', registerTeacher);
router.post('/login-teacher', loginTeacher);
```

## Quiz Creation

Teachers can build quizzes with a title, subject, description, difficulty (`Easy` / `Medium` / `Hard`), time limit, public/private visibility, and a list of multiple-choice questions, each with a correct-choice index.

```js
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  choices: { type: [String], required: true },
  correctChoice: { type: Number, required: true },
});
```

## Quiz Discovery

Students can browse all public quizzes, and teachers can retrieve the quizzes they've created.

```js
router.get('/get-all-quizes', getAllQuizes);
router.post('/get-teacher-quizes', getTeacherQuizes);
router.post('/get-quiz-by-id', getQuizByID);
```

## Solo Quiz Attempts

Students step through a quiz question-by-question, with answers saved and scored server-side.

```js
router.post('/start-quiz', startQuiz);
router.post('/load-question', loadQuestion);
router.post('/save-answer', saveAnswer);
```

Each attempt is stored with the attempting student, timestamp, submitted answers, and final score.

## Real-Time 1v1 Quiz Battles

Using Socket.IO, two students can be matched live:

- A waiting player queues up; the next student to join is auto-paired.
- A random quiz is selected and a `Match` document is created in MongoDB.
- Both players are placed in a Socket.IO room and receive the quiz simultaneously.
- Each question ends as soon as one player answers — the other player's window closes for that round.
- Scores update live for both players after every question.
- After the final question, a winner is calculated and broadcast, and the match is marked `finished`.
- If a player disconnects mid-match, the remaining player is automatically declared the winner.

## Attempt & Score Tracking

Quiz attempts, per-question answers, and final scores are persisted per student, along with running totals like `totalAttempts` and `attemptedBy` on each quiz.

## Institution-Aware Profiles

Both student and teacher accounts store an `institution` field alongside name, username, and email — useful for school/organization-level context.

---

# Application Workflow

```
┌─────────────────────┐
│   Register / Login   │
│  (Student / Teacher) │
└──────────┬───────────┘
           │
           v
   ┌───────┴────────┐
   │                 │
   v                 v
┌─────────┐      ┌──────────┐
│ Teacher │      │ Student  │
└────┬────┘      └────┬─────┘
     │                │
     v                v
┌─────────────┐  ┌───────────────────────┐
│ Create Quiz │  │ Browse Public Quizzes │
└─────────────┘  └───────────┬───────────┘
                              │
                 ┌────────────┴────────────┐
                 │                          │
                 v                          v
         ┌───────────────┐        ┌──────────────────┐
         │  Solo Attempt  │        │  Live 1v1 Battle  │
         └───────┬────────┘        └─────────┬─────────┘
                 │                            │
                 v                            v
         ┌───────────────┐        ┌──────────────────┐
         │  Save Answers  │        │  Join Match Queue │
         │  & Score       │        └─────────┬─────────┘
         └───────────────┘                    │
                                               v
                                     ┌──────────────────┐
                                     │  Matched & Quiz    │
                                     │  Broadcast Live    │
                                     └─────────┬─────────┘
                                               │
                                               v
                                     ┌──────────────────┐
                                     │ Answer → Score →   │
                                     │ Next Question      │
                                     └─────────┬─────────┘
                                               │
                                               v
                                     ┌──────────────────┐
                                     │  Winner Declared   │
                                     └──────────────────┘
```

---

# User Roles

| Role | Capabilities |
|---|---|
| **Student** | Register/login, browse public quizzes, attempt quizzes solo, join live 1v1 battles, view scores |
| **Teacher** | Register/login, create quizzes, view quizzes they've created |
| **Admin** | Dedicated admin home screen (`screens/admin/Home.js`) for platform-level oversight |

---

# Real-Time Quiz Battle System

The live battle system is implemented entirely in `BackEnd/app.js` using Socket.IO, with in-memory state (`waitingPlayer`, `activeMatches`, `playerAnswers`) layered on top of persistent MongoDB `Match` records.

### Matchmaking

- A student emits `joinMatch` with their username.
- If no one is waiting, they become the `waitingPlayer` and get a 30-second timeout.
- If someone is already waiting, the two are paired immediately, a random quiz is fetched, and a `Match` document is created.

### Question Flow

- Both players receive `startMatch` with the full quiz and starting scores of `0`.
- When either player answers (`answer` event), their answer is scored against `correctChoice`, feedback is sent back privately (`answerFeedback`), and the whole room is notified (`playerAnswered`) that the question has ended — the round does **not** wait for both players.
- Live scores are pushed to the room via `scoreUpdate`.
- After a 2-second pause, the `nextQuestion` event advances both clients.

### Match End

- Once the final question is answered, the match status is set to `finished`, a winner is computed by comparing `user1Score` and `user2Score` (or `"Draw"`), and `finishMatch` is broadcast with final scores.
- In-memory match state is cleaned up a few seconds later.

### Disconnect Handling

- If a player disconnects mid-match, the opponent is notified via `opponentDisconnected` and automatically wins.

---

# Data Models

### Student / Teacher

```js
{
  name: String,
  username: String,   // unique
  email: String,
  password: String,   // bcrypt-hashed
  institution: String,
}
```

### Quiz

```js
{
  id: Number,
  createdBy: String,
  title: String,
  subject: String,
  description: String,
  difficulty: "Easy" | "Medium" | "Hard",
  time: Number,
  publicc: Boolean,        // public/private visibility
  dateCreated: Date,
  totalQuestions: Number,
  questions: [
    { question: String, choices: [String], correctChoice: Number }
  ],
  totalAttempts: Number,
  marks: Number,
  attemptedBy: [String],
}
```

### QuizAttempt

```js
{
  id: Number,
  attemptedBy: String,
  time: Date,
  answers: [Number],
  score: Number,
}
```

### Match

```js
{
  matchID: String,
  user1: String,
  user2: String,
  date: Date,
  status: "waiting" | "live" | "finished",
  quizID: Number,
  user1Score: Number,
  user2Score: Number,
  winner: String,
}
```

### Counter

Used for generating sequential numeric IDs (e.g. for quizzes) across the app.

```js
{
  id: String,
  count: Number,
}
```

---

# Technology Stack

### Frontend

- **React Native** (0.81) + **Expo** (SDK 54) — cross-platform mobile app
- **React Navigation** (native stack) — screen navigation
- **Axios** — REST API communication
- **Socket.IO Client** — real-time match communication
- **AsyncStorage** — local session/token persistence
- **Expo Linear Gradient**, **Expo Haptics** — UI polish and feedback
- **react-native-element-dropdown**, **react-native-size-matters**, **react-native-responsive-screen** — responsive UI components

### Backend

- **Node.js** + **Express 5** — REST API server
- **MongoDB** + **Mongoose** — data persistence and schema modeling
- **Socket.IO** — real-time bidirectional communication for live matches
- **JWT (jsonwebtoken)** — authentication tokens
- **bcryptjs** — password hashing
- **dotenv** — environment variable management
- **cors** — cross-origin request handling

---

# Project Structure

```
QuizCraft/
├── .gitignore
├── README.md
│
├── BackEnd/
│   ├── app.js                  # Express app + Socket.IO server entry point
│   ├── .env.example            # Environment variable template
│   ├── Controllers/
│   │   ├── AuthController.js
│   │   ├── QuizController.js
│   │   ├── QuizAttemptController.js
│   │   ├── MatchController.js
│   │   └── CountController.js
│   ├── Routes/
│   │   ├── AuthRoutes.js
│   │   ├── QuizRoutes.js
│   │   ├── QuizAttemptRoutes.js
│   │   └── CounterRoutes.js
│   └── Schemas/
│       ├── Student.js
│       ├── Teacher.js
│       ├── Quiz.js
│       ├── QuizAttempt.js
│       ├── Match.js
│       ├── MatchLine.js
│       └── Counter.js
│
└── FrontEnd/
    ├── App.js                  # App entry point
    ├── index.js
    ├── app.json                # Expo config
    ├── styles.js
    ├── config/                 # API base URL / app configuration
    ├── Context/                # React context providers (auth/session state)
    └── screens/
        ├── auth/
        │   ├── Login.js
        │   └── Register.js
        ├── admin/
        │   └── Home.js
        ├── teacher/
        │   ├── Home.js
        │   └── QuizCreate.js
        └── student/
            ├── Home.js
            ├── QuizDetails.js
            ├── QuizAttempt.js
            └── LiveQuiz.js
```

---

# Installation

### Prerequisites

- Node.js (v18+)
- npm
- MongoDB (local instance or a cloud connection string, e.g. MongoDB Atlas)
- Expo CLI (`npm install -g expo-cli`) or the **Expo Go** app on a physical device

Check your Node version:

```bash
node --version
```

### Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd QuizCraft
```

### Install Backend Dependencies

```bash
cd BackEnd
npm install
```

### Install Frontend Dependencies

```bash
cd ../FrontEnd
npm install
```

---

# Running the Application

### 1. Configure Environment Variables

```bash
cd BackEnd
cp .env.example .env
```

Fill in `.env`:

```
MONGODB_URL=your_mongodb_connection_string
PORT=5001
```

### 2. Start the Backend Server

```bash
cd BackEnd
npm run Start
# or: node app
```

You should see:

```
MongoDB Connected
🚀 Server running on port 5001
```

### 3. Start the Frontend App

```bash
cd FrontEnd
npx expo start
```

Scan the QR code with **Expo Go**, or launch on an emulator:

```bash
npm run android   # Android emulator
npm run ios       # iOS simulator
npm run web       # Web browser
```

> Make sure `FrontEnd/config` points to your backend server's local IP/URL (not `localhost`, if testing on a physical device) so the app can reach both the REST API and the Socket.IO server.

---

# How to Use

## Teacher Flow

1. **Register/Login** as a teacher.
2. Navigate to **Create Quiz**.
3. Enter title, subject, description, difficulty, and time limit.
4. Add multiple-choice questions, marking the correct choice for each.
5. Publish the quiz as public or private.
6. View created quizzes from the teacher **Home** screen.

## Student Flow — Solo Quiz

1. **Register/Login** as a student.
2. Browse available public quizzes on the **Home** screen.
3. Open a quiz to view its **Details** (subject, difficulty, question count, time limit).
4. Start the attempt — questions load one at a time.
5. Submit answers; the score is computed and saved server-side.

## Student Flow — Live 1v1 Battle

1. From the **Live Quiz** screen, join the match queue.
2. Wait for an opponent (auto-matched, with a 30-second timeout).
3. Once matched, both players receive the same randomly selected quiz.
4. Answer each question — the round ends as soon as either player responds.
5. Watch live score updates after every question.
6. See the final result and winner once the quiz ends.

---

# API Reference

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register-student` | Register a new student account |
| `POST` | `/api/auth/login-student` | Log in as a student |
| `POST` | `/api/auth/register-teacher` | Register a new teacher account |
| `POST` | `/api/auth/login-teacher` | Log in as a teacher |
| `POST` | `/api/quiz/register-quiz` | Create a new quiz |
| `GET` | `/api/quiz/get-all-quizes` | Fetch all public quizzes |
| `POST` | `/api/quiz/get-teacher-quizes` | Fetch quizzes created by a specific teacher |
| `POST` | `/api/quiz/get-quiz-by-id` | Fetch a single quiz by ID |
| `POST` | `/api/quizAttempt/start-quiz` | Begin a quiz attempt |
| `POST` | `/api/quizAttempt/load-question` | Load a specific question in an attempt |
| `POST` | `/api/quizAttempt/save-answer` | Save a submitted answer |
| `POST` | `/api/counter/get-id` | Get the next sequential ID for a resource |
| `POST` | `/api/counter/add-id` | Increment the counter for a resource |

---

# Socket.IO Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `joinMatch` | `{ username }` | Join the matchmaking queue |
| `answer` | `{ matchID, username, index, choice }` | Submit an answer for the current question |
| `cancelWaiting` | — | Cancel matchmaking while waiting |

### Server → Client

| Event | Description |
|---|---|
| `waiting` | Sent while a player is queued, awaiting an opponent |
| `startMatch` | Match found — sends quiz data and starting scores |
| `answerFeedback` | Private feedback on whether the submitted answer was correct |
| `playerAnswered` | Broadcast to the room that a question has ended |
| `scoreUpdate` | Live score update for both players |
| `nextQuestion` | Advances both clients to the next question |
| `finishMatch` | Final scores and winner |
| `opponentDisconnected` | Sent when the opponent leaves mid-match |
| `timeout` | Sent if no opponent is found within 30 seconds |
| `error` | Generic error event (e.g. no quizzes available) |

---

# Environment Variables

The backend requires a `.env` file in `BackEnd/` (see `.env.example`):

```
MONGODB_URL=your_mongodb_connection_string
PORT=5001
```

---

# Important Implementation Details

### Question-Ends-on-First-Answer

Unlike a typical synchronized quiz, QuizCraft's live battles end each question as soon as **either** player answers — the opponent does not get to answer after the round has closed. This keeps matches fast-paced but means reaction speed matters as much as accuracy.

### In-Memory + Persistent State

Match progress (`activeMatches`, `playerAnswers`) is tracked in-memory on the server for speed, while the authoritative `Match` document in MongoDB is updated after every scoring event — so match history and final results survive server restarts, but a mid-match server crash would lose in-progress socket state.

### Random Quiz Selection for Battles

The quiz used in a live match is chosen randomly from all quizzes in the database:

```js
const quizList = await Quiz.find();
const randomQuiz = quizList[Math.floor(Math.random() * quizList.length)];
```

### 30-Second Matchmaking Timeout

A waiting player is automatically timed out and notified if no opponent joins within 30 seconds, preventing indefinite waiting.

---

# Limitations

This project is under active development and has several known limitations.

### No Reconnection Handling

If a player's connection drops momentarily during a live match (rather than a full disconnect), there is no reconnection/resume logic — the match ends and the opponent wins.

### Single Random Quiz Pool

Live matches always draw from the entire quiz collection at random; there's no filtering by subject, difficulty, or topic when matchmaking.

### No Rate Limiting or Input Validation Layer

API routes do not currently implement centralized request validation or rate limiting, which would be important for production hardening.

### Minimal Admin Tooling

The admin role currently has a single home screen; there is no full moderation, analytics, or user-management dashboard yet.

### No Automated Tests

The project does not yet include a test suite (unit, integration, or end-to-end) for either the backend or frontend.

---

# Future Improvements

### Matchmaking Enhancements

- Subject/difficulty-based matchmaking
- Skill-based (ELO-style) matchmaking
- Private match invites between friends

### Gameplay Features

- Power-ups or streak bonuses in live battles
- Leaderboards (global, per-subject, per-institution)
- Rematch and friend-challenge flows

### Platform Features

- Push notifications for match invites and results
- Quiz categories/tags and search
- Teacher analytics dashboard (attempt rates, average scores, question difficulty stats)
- Full admin moderation panel

### Engineering Improvements

- Automated test coverage (Jest for backend, React Native Testing Library for frontend)
- Centralized request validation (e.g. Zod/Joi)
- Reconnection support for dropped live-match connections
- Rate limiting and stricter auth middleware on protected routes
- CI/CD pipeline for backend and Expo builds

---

# Learning Objectives

This project was built to gain practical experience with:

- React Native and Expo for cross-platform mobile development
- Building and consuming a REST API with Express and MongoDB/Mongoose
- Real-time, bidirectional communication with Socket.IO
- Designing multiplayer matchmaking and live game-state synchronization
- Role-based authentication with JWT and bcrypt
- Structuring a full-stack monorepo (separate frontend/backend)
- Managing shared state in a mobile app with React Context

---

# Dependencies

### Backend

```
express
mongoose
socket.io
jsonwebtoken
bcryptjs
dotenv
cors
nodemon
```

### Frontend

```
expo
react
react-native
@react-navigation/native
@react-navigation/native-stack
axios
socket.io-client
@react-native-async-storage/async-storage
expo-linear-gradient
expo-haptics
expo-status-bar
react-native-element-dropdown
react-native-size-matters
react-native-responsive-screen
react-native-safe-area-context
react-native-screens
```

---

# License

This project is currently unlicensed. Add a license file (e.g. MIT) if you intend to open-source or distribute it.

---

# Author

Developed as a full-stack mobile + real-time systems project.

**Project:** QuizCraft
**Frontend:** React Native (Expo)
**Backend:** Node.js, Express, MongoDB
**Real-Time Layer:** Socket.IO
**Auth:** JWT + bcrypt

---

# Conclusion

QuizCraft combines quiz authoring, solo quiz-taking, and real-time competitive quizzing into a single mobile platform. It demonstrates how a REST API, a MongoDB data layer, and a Socket.IO real-time layer can be combined behind a React Native frontend to deliver both asynchronous (solo quiz) and synchronous (live 1v1 battle) user experiences.

It serves as a foundation for a more feature-rich quiz platform with skill-based matchmaking, leaderboards, richer analytics, and production-grade validation and testing.
