import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  Alert,
  Animated,
  StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { io } from "socket.io-client";
import ThemeContext from '../../Context/ThemeContext.js';
import api from '../../config/api.js';

const socket = io(api, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default function LiveQuiz({ route }) {
  const { user } = route.params;
  const navigation = useNavigation();
  
  const themeContext = useContext(ThemeContext);
  const { gradientUp, gradientDown } = themeContext || {
    gradientUp: '#667eea',
    gradientDown: '#764ba2'
  };

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [matchID, setMatchID] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [scores, setScores] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [opponentCorrect, setOpponentCorrect] = useState(false);
  const [players, setPlayers] = useState([]);
  const [questionTime, setQuestionTime] = useState(30);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [questionEnded, setQuestionEnded] = useState(false); // NEW: Track if question ended
  
  const timerRef = useRef(null);
  const questionAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  // -------------------------
  // Socket.IO Event Listeners
  // -------------------------
  useEffect(() => {
    console.log('🔗 Connecting to socket...');
    
    socket.emit("joinMatch", { username: user.username });

    const onWaiting = ({ message }) => {
      console.log('⏳ Waiting:', message);
      setLoading(true);
    };

    const onStartMatch = ({ matchID, quiz, scores }) => {
      console.log('🎮 Match started:', matchID);
      
      setMatchID(matchID);
      setQuiz(quiz);
      setCurrentQuestionIndex(0);
      setSelectedChoice(null);
      setScores(scores);
      setQuestionTime(quiz.time || 30);
      setTimeLeft(quiz.time || 30);
      setOpponentAnswered(false);
      setOpponentChoice(null);
      setOpponentCorrect(false);
      setAnswerFeedback(null);
      setCorrectAnswer(null);
      setQuestionEnded(false);
      
      const playerNames = Object.keys(scores);
      setPlayers(playerNames);
      
      setLoading(false);
      
      questionAnim.setValue(0);
      Animated.spring(questionAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    };

    const onNextQuestion = ({ index, scores }) => {
      console.log('➡️ Next question:', index + 1);
      
      setCurrentQuestionIndex(index);
      setSelectedChoice(null);
      setScores(scores);
      setTimeLeft(questionTime);
      setOpponentAnswered(false);
      setOpponentChoice(null);
      setOpponentCorrect(false);
      setAnswerFeedback(null);
      setCorrectAnswer(null);
      setQuestionEnded(false);
      
      questionAnim.setValue(0);
      Animated.spring(questionAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    };

    const onScoreUpdate = ({ user1Score, user2Score }) => {
      if (quiz) {
        const updatedScores = {};
        if (quiz.user1) updatedScores[quiz.user1] = user1Score;
        if (quiz.user2) updatedScores[quiz.user2] = user2Score;
        setScores(updatedScores);
      }
    };

    const onPlayerAnswered = ({ username, questionIndex, choice, isCorrect, questionEnded }) => {
      console.log('👤 Player answered:', username);
      if (username !== user.username && questionIndex === currentQuestionIndex) {
        setOpponentAnswered(true);
        setOpponentChoice(choice);
        setOpponentCorrect(isCorrect);
        
        // NEW: If question ended (opponent answered), disable input
        if (questionEnded) {
          setQuestionEnded(true);
        }
      }
    };

    const onAnswerFeedback = ({ isCorrect, correctChoice, yourChoice }) => {
      console.log('📊 Answer feedback:', isCorrect ? 'Correct' : 'Incorrect');
      setAnswerFeedback({
        isCorrect,
        correctChoice,
        yourChoice
      });
      setCorrectAnswer(correctChoice);
      
      feedbackAnim.setValue(0);
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    const onFinishMatch = ({ winner, finalScores }) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      Alert.alert(
        "Match Finished!",
        `Winner: ${winner}\n\nFinal Scores:\n${
          Object.entries(finalScores)
            .map(([player, score]) => `${player}: ${score}`)
            .join('\n')
        }`,
        [
          { 
            text: 'OK',
            onPress: () => {
              socket.disconnect();
              navigation.navigate("Student_Home");
            }
          }
        ]
      );
    };

    const onOpponentDisconnected = ({ message }) => {
      Alert.alert(
        "Opponent Left",
        message || "Your opponent has disconnected. You win!",
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    };

    const onError = ({ message }) => {
      Alert.alert("Error", message);
    };

    const onTimeout = ({ message }) => {
      Alert.alert("Timeout", message, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    };

    socket.on("waiting", onWaiting);
    socket.on("startMatch", onStartMatch);
    socket.on("nextQuestion", onNextQuestion);
    socket.on("scoreUpdate", onScoreUpdate);
    socket.on("playerAnswered", onPlayerAnswered);
    socket.on("answerFeedback", onAnswerFeedback);
    socket.on("finishMatch", onFinishMatch);
    socket.on("opponentDisconnected", onOpponentDisconnected);
    socket.on("error", onError);
    socket.on("timeout", onTimeout);

    return () => {
      socket.off("waiting", onWaiting);
      socket.off("startMatch", onStartMatch);
      socket.off("nextQuestion", onNextQuestion);
      socket.off("scoreUpdate", onScoreUpdate);
      socket.off("playerAnswered", onPlayerAnswered);
      socket.off("answerFeedback", onAnswerFeedback);
      socket.off("finishMatch", onFinishMatch);
      socket.off("opponentDisconnected", onOpponentDisconnected);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      socket.emit("cancelWaiting");
    };
  }, []);

  useEffect(() => {
    if (!quiz || selectedChoice !== null || questionEnded) return;
    
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleAnswer(null);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, quiz, selectedChoice, questionEnded]);

  const handleAnswer = (choiceIndex) => {
    // NEW: Prevent answering if question has ended (opponent already answered)
    if (!quiz || !matchID || selectedChoice !== null || questionEnded) return;
    
    console.log('📝 Submitting answer:', choiceIndex);
    setSelectedChoice(choiceIndex);
    setTimeLeft(0);
    setQuestionEnded(true); // NEW: Mark question as ended for this user
    
    socket.emit("answer", {
      matchID,
      username: user.username,
      index: currentQuestionIndex,
      choice: choiceIndex,
    });
  };

  if (loading || !quiz) {
    return (
      <LinearGradient
        colors={[gradientUp, gradientDown]}
        style={styles.container}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>
          {!quiz ? "Finding opponent..." : "Starting match..."}
        </Text>
        
        <TouchableOpacity
          onPress={() => {
            socket.emit("cancelWaiting");
            navigation.goBack();
          }}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const opponentName = players.find(player => player !== user.username);
  const showFeedback = answerFeedback !== null;
  const isUserCorrect = answerFeedback?.isCorrect;
  const userChoice = answerFeedback?.yourChoice;

  // NEW: Determine if user can still answer
  const canAnswer = selectedChoice === null && !questionEnded;
  const questionStatus = questionEnded ? 'ended' : 'active';

  return (
    <LinearGradient
      colors={[gradientUp, gradientDown]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.questionCount}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
        </View>
        
        <View style={styles.timerContainer}>
          <Text style={[
            styles.timerText,
            { color: timeLeft <= 10 ? '#ff6b6b' : '#fff' }
          ]}>
            {timeLeft}s
          </Text>
          <Text style={styles.timerLabel}>Time Left</Text>
        </View>
      </View>

      {/* Player Status */}
      <View style={styles.playerStatus}>
        {players.map((player, index) => (
          <View key={index} style={styles.playerInfo}>
            <Text style={[
              styles.playerName,
              { color: player === user.username ? '#FFD700' : '#fff' }
            ]}>
              {player === user.username ? 'You' : player}
            </Text>
            <Text style={styles.playerScore}>
              {scores[player] || 0}
            </Text>
            
            {player === user.username && selectedChoice !== null && (
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.statusText}>
                  {showFeedback ? (isUserCorrect ? 'Correct!' : 'Incorrect') : 'Answered'}
                </Text>
              </View>
            )}
            
            {player !== user.username && opponentAnswered && (
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { 
                  backgroundColor: opponentCorrect ? '#4CAF50' : '#F44336' 
                }]} />
                <Text style={styles.statusText}>
                  {opponentCorrect ? 'Correct!' : 'Incorrect'}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Question Status Banner */}
      {questionEnded && (
        <View style={[
          styles.statusBanner,
          { backgroundColor: opponentAnswered ? '#4CAF50' : '#FF9800' }
        ]}>
          <Text style={styles.statusBannerText}>
            {opponentAnswered 
              ? `⚡ ${opponentName} answered! Next question in 2 seconds...` 
              : '✅ You answered! Next question in 2 seconds...'}
          </Text>
        </View>
      )}

      {/* Question Card */}
      <Animated.View
        style={[
          styles.questionCard,
          {
            opacity: questionAnim,
            transform: [{
              scale: questionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1]
              })
            }]
          }
        ]}
      >
        <Text style={styles.questionText}>
          {currentQuestion.question}
        </Text>
      </Animated.View>

      {/* Choices */}
      <ScrollView
        style={styles.choicesContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentQuestion.choices.map((choice, index) => {
          const isSelected = selectedChoice === index;
          const isOpponentAnswer = opponentChoice === index;
          const isCorrectAnswer = index === currentQuestion.correctChoice;
          
          let backgroundColor = '#fff';
          let borderColor = '#ddd';
          let textColor = '#333';
          let borderWidth = 2;
          
          // After question ended
          if (questionEnded || selectedChoice !== null) {
            if (isCorrectAnswer) {
              backgroundColor = '#E8F5E9';
              borderColor = '#4CAF50';
              borderWidth = 2;
            }
            
            if (isSelected) {
              backgroundColor = isCorrectAnswer ? '#4CAF50' : '#F44336';
              borderColor = isCorrectAnswer ? '#388E3C' : '#D32F2F';
              textColor = '#fff';
            }
            
            if (isOpponentAnswer && !isSelected) {
              backgroundColor = opponentCorrect ? '#E8F5E9' : '#FFEBEE';
              borderColor = opponentCorrect ? '#4CAF50' : '#F44336';
            }
          } else if (isOpponentAnswer) {
            backgroundColor = '#FFF3E0';
            borderColor = '#FF9800';
          }
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleAnswer(index)}
              disabled={!canAnswer} // NEW: Disable if cannot answer
              activeOpacity={0.7}
              style={[
                styles.choiceButton,
                {
                  backgroundColor,
                  borderColor,
                  borderWidth,
                  opacity: canAnswer ? 1 : 0.7
                }
              ]}
            >
              <View style={styles.choiceContent}>
                <View style={styles.choiceLetter}>
                  <Text style={styles.choiceLetterText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                
                <Text style={[styles.choiceText, { color: textColor }]}>
                  {choice}
                </Text>
                
                {isSelected && (
                  <Text style={[
                    styles.indicatorText,
                    { color: textColor }
                  ]}>
                    ✓ Your Answer
                  </Text>
                )}
                
                {isOpponentAnswer && opponentName && !isSelected && (
                  <Text style={styles.opponentIndicator}>
                    {opponentName}'s Answer
                  </Text>
                )}
                
                {isCorrectAnswer && (questionEnded || selectedChoice !== null) && !isSelected && (
                  <Text style={styles.correctIndicator}>
                    ✓ Correct Answer
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {questionEnded
            ? opponentAnswered
              ? '⏳ Next question loading...'
              : '⏳ Waiting for next question...'
            : selectedChoice !== null
            ? '✅ You answered! Waiting for opponent...'
            : opponentAnswered
            ? '⚡ Opponent answered! Question ended.'
            : 'Select your answer...'}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('4%')
  },
  loadingText: {
    color: '#fff',
    fontSize: hp('2.5%'),
    marginTop: hp('3%'),
    textAlign: 'center'
  },
  cancelButton: {
    marginTop: hp('4%'),
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: 10
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: hp('2%')
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%')
  },
  quizTitle: {
    fontSize: hp('1.8%'),
    color: '#fff',
    opacity: 0.8
  },
  questionCount: {
    fontSize: hp('2.5%'),
    fontWeight: 'bold',
    color: '#fff'
  },
  timerContainer: {
    alignItems: 'center'
  },
  timerText: {
    fontSize: hp('3%'),
    fontWeight: 'bold'
  },
  timerLabel: {
    fontSize: hp('1.5%'),
    color: '#fff',
    opacity: 0.7
  },
  playerStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: hp('1.5%'),
    borderRadius: 10,
    marginBottom: hp('2%')
  },
  playerInfo: {
    alignItems: 'center'
  },
  playerName: {
    fontSize: hp('2%'),
    fontWeight: '600'
  },
  playerScore: {
    fontSize: hp('2.5%'),
    color: '#fff',
    fontWeight: 'bold',
    marginTop: hp('0.5%')
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%')
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4
  },
  statusText: {
    fontSize: hp('1.5%'),
    color: '#fff'
  },
  statusBanner: {
    marginBottom: hp('2%'),
    padding: hp('1.5%'),
    borderRadius: 10,
    alignItems: 'center'
  },
  statusBannerText: {
    color: '#fff',
    fontSize: hp('1.8%'),
    fontWeight: '600',
    textAlign: 'center'
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: hp('2.5%'),
    marginBottom: hp('3%')
  },
  questionText: {
    fontSize: hp('2.5%'),
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: hp('3%')
  },
  choicesContainer: {
    flex: 1
  },
  choiceButton: {
    borderRadius: 10,
    padding: hp('2%'),
    marginBottom: hp('1.5%'),
    borderWidth: 2
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  choiceLetter: {
    width: hp('3%'),
    height: hp('3%'),
    borderRadius: hp('1.5%'),
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%')
  },
  choiceLetterText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: hp('1.8%')
  },
  choiceText: {
    flex: 1,
    fontSize: hp('2%'),
    fontWeight: '400'
  },
  indicatorText: {
    fontWeight: 'bold',
    fontSize: hp('1.8%'),
    marginLeft: wp('2%')
  },
  opponentIndicator: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: hp('1.8%'),
    marginLeft: wp('2%')
  },
  correctIndicator: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: hp('1.8%'),
    marginLeft: wp('2%')
  },
  statusBar: {
    marginTop: hp('2%'),
    padding: hp('1.5%'),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10
  },
  statusText: {
    color: '#fff',
    fontSize: hp('1.8%'),
    textAlign: 'center',
    fontWeight: '500'
  }
});