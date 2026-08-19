const mongoose = require("mongoose");
require("../Schemas/Match");
require("../Schemas/MatchLine");
require("../Schemas/Quiz");

const Match = mongoose.model("MatchInfo");
const MatchLine = mongoose.model("MatchLineInfo");
const Quiz = mongoose.model("QuizInfo");

let matchCounter = 1; // optional: can use a sequence for matchID

// Join 1v1 queue
const joinMatchQueue = async (req, res) => {
    const { username } = req.body;

    try {
        let waiting = await MatchLine.findOne({ status: "waiting" });

        if (!waiting) {
            await MatchLine.create({ user1: username, status: "waiting" });
            return res.json({ status: "waiting", message: "Waiting for opponent..." });
        }

        // Someone waiting → create match
        const quizList = await Quiz.find();
        const quiz = quizList[Math.floor(Math.random() * quizList.length)];

        const matchID = matchCounter++;
        const newMatch = await Match.create({
            matchID,
            user1: waiting.user1,
            user2: username,
            quizID: quiz.id,
            status: "live",
        });

        await MatchLine.deleteOne({ _id: waiting._id });

        res.json({
            status: "live",
            matchID,
            quiz,
            players: [waiting.user1, username],
        });
    } catch (error) {
        console.error(error);
        res.json({ status: "error", error });
    }
};

// Save answer in match
const saveMatchAnswer = async (req, res) => {
    const { matchID, username, index, choice } = req.body;

    try {
        const match = await Match.findOne({ matchID });
        const quiz = await Quiz.findOne({ id: match.quizID });

        let scoreField = username === match.user1 ? "user1Score" : "user2Score";
        if (choice === quiz.questions[index].correctChoice) match[scoreField] += 1;

        await match.save();

        res.json({ status: "ok", scores: { user1: match.user1Score, user2: match.user2Score } });
    } catch (error) {
        console.error(error);
        res.json({ status: "error", error });
    }
};

module.exports = {
    joinMatchQueue,
    saveMatchAnswer,
};
