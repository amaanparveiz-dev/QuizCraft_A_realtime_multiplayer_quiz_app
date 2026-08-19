const express = require("express");
const app = express();
const mongoose = require("mongoose");
require('dotenv').config();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Import routes and schemas
const authRoutes = require('./Routes/AuthRoutes');
const quizRoutes = require('./Routes/QuizRoutes');
const counterRoutes = require('./Routes/CounterRoutes');
const quizAttemptRoutes = require('./Routes/QuizAttemptRoutes');
const Match = require("./Schemas/Match");
const Quiz = require("./Schemas/Quiz");

app.use(cors());
app.use(express.json());

const mongourl = process.env.MONGODB_URL;
mongoose.connect(mongourl)
  .then(() => console.log("MongoDB Connected"))
  .catch(e => console.log(e));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/counter', counterRoutes);
app.use('/api/quizAttempt', quizAttemptRoutes);

app.get("/", (req, res) => {
    res.send({ status: "Server started successfully" });
});

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000
});

// ----------------------
// Socket.IO Logic
// ----------------------
let waitingPlayer = null;
const activeMatches = new Map();
const playerAnswers = new Map();

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Join match queue
  socket.on("joinMatch", async ({ username }) => {
    try {
      console.log(`🎮 Join match request from: ${username}`);
      
      // Clean up if already waiting
      if (waitingPlayer && waitingPlayer.socketId === socket.id) {
        socket.emit("waiting", { message: "Already waiting for opponent..." });
        return;
      }
      
      if (waitingPlayer && waitingPlayer.socketId !== socket.id) {
        // Found an opponent!
        const opponent = waitingPlayer;
        
        // Get random quiz
        const quizList = await Quiz.find();
        if (quizList.length === 0) {
          socket.emit("error", { message: "No quizzes available" });
          const opponentSocket = io.sockets.sockets.get(opponent.socketId);
          if (opponentSocket) {
            opponentSocket.emit("error", { message: "No quizzes available" });
          }
          waitingPlayer = null;
          return;
        }
        
        const randomQuiz = quizList[Math.floor(Math.random() * quizList.length)];
        
        const matchID = `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`🤝 Match created: ${matchID} between ${opponent.username} and ${username}`);
        
        // Create match in database
        const newMatch = new Match({
          matchID: matchID,
          user1: opponent.username,
          user2: username,
          quizID: randomQuiz.id,
          user1Score: 0,
          user2Score: 0,
          status: "live",
        });
        
        await newMatch.save();
        
        // Create room
        const room = matchID;
        socket.join(room);
        
        // Get opponent's socket
        const opponentSocket = io.sockets.sockets.get(opponent.socketId);
        if (opponentSocket) {
          opponentSocket.join(room);
          
          // Clear opponent's waiting timeout
          if (opponentSocket.waitingTimeout) {
            clearTimeout(opponentSocket.waitingTimeout);
            delete opponentSocket.waitingTimeout;
          }
        }
        
        // Prepare quiz data
        const quizData = {
          ...randomQuiz.toObject(),
          user1: opponent.username,
          user2: username,
          time: randomQuiz.time || 30,
          totalQuestions: randomQuiz.questions.length
        };
        
        // Initialize match state
        activeMatches.set(matchID, {
          players: [opponent.username, username],
          currentQuestion: 0,
          quiz: quizData,
          room: room,
          match: newMatch
        });
        
        playerAnswers.set(matchID, new Set());
        
        // Send start match to both players
        io.to(room).emit("startMatch", {
          matchID: matchID,
          quiz: quizData,
          scores: {
            [opponent.username]: 0,
            [username]: 0
          }
        });
        
        waitingPlayer = null;
      } else {
        // No opponent yet, become waiting player
        waitingPlayer = {
          username,
          socketId: socket.id,
          joinedAt: Date.now()
        };
        
        console.log(`⏳ ${username} is waiting for opponent`);
        socket.emit("waiting", { message: "Waiting for opponent..." });
        
        // Timeout after 30 seconds
        const timeout = setTimeout(() => {
          if (waitingPlayer && waitingPlayer.socketId === socket.id) {
            console.log(`⏰ Timeout for ${username}`);
            socket.emit("timeout", { message: "No opponent found. Please try again." });
            waitingPlayer = null;
          }
        }, 30000);
        
        socket.waitingTimeout = timeout;
      }
    } catch (error) {
      console.error("❌ Join match error:", error);
      socket.emit("error", { message: "Server error joining match" });
      waitingPlayer = null;
    }
  });

  // Handle answer submission - NEW LOGIC
  socket.on("answer", async ({ matchID, username, index, choice }) => {
    try {
      console.log(`📝 Answer from ${username} for match ${matchID}, Q${index + 1}, choice: ${choice}`);
      
      const match = await Match.findOne({ matchID });
      if (!match) {
        console.error(`❌ Match not found: ${matchID}`);
        socket.emit("error", { message: "Match not found" });
        return;
      }

      const quiz = await Quiz.findOne({ id: match.quizID });
      if (!quiz) {
        console.error(`❌ Quiz not found for match: ${matchID}`);
        socket.emit("error", { message: "Quiz not found" });
        return;
      }

      const room = matchID;
      const question = quiz.questions[index];
      
      if (!question) {
        console.error(`❌ Question not found at index ${index} for match ${matchID}`);
        return;
      }

      // Track that this player answered
      if (!playerAnswers.has(matchID)) {
        playerAnswers.set(matchID, new Set());
      }
      playerAnswers.get(matchID).add(username);
      
      let isCorrect = false;
      
      // Update score if answer is correct
      if (choice !== null && choice === question.correctChoice) {
        isCorrect = true;
        if (username === match.user1) {
          match.user1Score += 1;
        } else if (username === match.user2) {
          match.user2Score += 1;
        }
        await match.save();
        console.log(`✅ ${username} answered correctly! Score: ${username === match.user1 ? match.user1Score : match.user2Score}`);
      } else {
        console.log(`❌ ${username} answered incorrectly.`);
      }
      
      // Send immediate feedback to the player who answered
      socket.emit("answerFeedback", {
        isCorrect: isCorrect,
        correctChoice: question.correctChoice,
        yourChoice: choice
      });
      
      // Notify room that a player has answered AND QUESTION ENDS
      io.to(room).emit("playerAnswered", {
        username: username,
        questionIndex: index,
        choice: choice,
        isCorrect: isCorrect,
        questionEnded: true // NEW: Signal that question has ended
      });
      
      // Send updated scores
      io.to(room).emit("scoreUpdate", {
        user1Score: match.user1Score,
        user2Score: match.user2Score
      });
      
      // IMMEDIATELY move to next question after ONE player answers
      const matchData = activeMatches.get(matchID);
      
      console.log(`⚡ Question ${index + 1} ended after ${username}'s answer. Moving to next question...`);
      
      // Reset answers for next question
      playerAnswers.set(matchID, new Set());
      
      // Move to next question or finish
      if (index + 1 < quiz.questions.length) {
        // Update active match state
        activeMatches.set(matchID, {
          ...matchData,
          currentQuestion: index + 1
        });
        
        // Wait 2 seconds then send next question (so players can see result)
        setTimeout(() => {
          io.to(room).emit("nextQuestion", {
            index: index + 1,
            scores: {
              [match.user1]: match.user1Score,
              [match.user2]: match.user2Score
            }
          });
          console.log(`➡️ Next question (${index + 2}) for match ${matchID}`);
        }, 2000);
      } else {
        // Match finished
        match.status = "finished";
        match.winner = match.user1Score > match.user2Score ? match.user1 :
                      match.user2Score > match.user1Score ? match.user2 : "Draw";
        await match.save();
        
        console.log(`🏁 Match ${matchID} finished. Winner: ${match.winner}`);
        
        // Wait 2 seconds then show results
        setTimeout(() => {
          io.to(room).emit("finishMatch", {
            winner: match.winner,
            finalScores: {
              [match.user1]: match.user1Score,
              [match.user2]: match.user2Score
            }
          });
          
          // Cleanup after 3 seconds
          setTimeout(() => {
            activeMatches.delete(matchID);
            playerAnswers.delete(matchID);
            console.log(`🧹 Cleaned up match ${matchID}`);
          }, 3000);
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Answer error:", error);
      socket.emit("error", { message: "Error processing answer" });
    }
  });

  // Cancel waiting
  socket.on("cancelWaiting", () => {
    if (waitingPlayer && waitingPlayer.socketId === socket.id) {
      console.log(`❌ ${waitingPlayer.username} cancelled waiting`);
      if (socket.waitingTimeout) {
        clearTimeout(socket.waitingTimeout);
        delete socket.waitingTimeout;
      }
      waitingPlayer = null;
    }
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log("🔌 User disconnected:", socket.id);
    
    if (socket.waitingTimeout) {
      clearTimeout(socket.waitingTimeout);
      delete socket.waitingTimeout;
    }
    
    if (waitingPlayer && waitingPlayer.socketId === socket.id) {
      console.log(`👋 Waiting player ${waitingPlayer.username} disconnected`);
      waitingPlayer = null;
    }
    
    for (const [matchID, matchData] of activeMatches.entries()) {
      if (matchData.players) {
        io.to(matchData.room).emit("opponentDisconnected", { 
          message: "Your opponent has disconnected. You win!" 
        });
        
        console.log(`⚠️ Player disconnected from match ${matchID}`);
        
        activeMatches.delete(matchID);
        playerAnswers.delete(matchID);
      }
    }
  });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});