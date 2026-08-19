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

let socket = null;

export default function LiveQuiz({ route }) {
  const { user, quizID } = route.params;
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
  const [questionEnded, setQuestionEnded] = useState(false);
  const [matchFinished, setMatchFinished] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [matchResultShown, setMatchResultShown] = useState(false);
  
  const timerRef = useRef(null);
  const questionAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const socketRef = useRef(null);
  const isMounted = useRef(true);

  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const quizRef = useRef(quiz);
  const matchFinishedRef = useRef(matchFinished);
  const matchResultShownRef = useRef(matchResultShown);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    quizRef.current = quiz;
  }, [quiz]);

  useEffect(() => {
    matchFinishedRef.current = matchFinished;
  }, [matchFinished]);

  useEffect(() => {
    matchResultShownRef.current = matchResultShown;
  }, [matchResultShown]);

  // -------------------------
  // Initialize Socket Connection
  // -------------------------
  const initializeSocket = () => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('Socket already connected, reusing...');
      return socketRef.current;
    }

    if (socketRef.current) {
      console.log('Socket exists but disconnected, reconnecting...');
      socketRef.current.connect();
      return socketRef.current;
    }

    console.log('Creating new socket connection...');
    const newSocket = io(api, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = newSocket;
    return newSocket;
  };

  // -------------------------
  // Reset Match State
  // -------------------------
  const resetMatchState = () => {
    setQuiz(null);
    setMatchID(null);
    setCurrentQuestionIndex(0);
    setSelectedChoice(null);
    setScores({});
    setTimeLeft(30);
    setOpponentAnswered(false);
    setOpponentChoice(null);
    setOpponentCorrect(false);
    setPlayers([]);
    setQuestionTime(30);
    setAnswerFeedback(null);
    setCorrectAnswer(null);
    setQuestionEnded(false);
    setMatchFinished(false);
    setMatchResultShown(false);
    setLoading(true);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // -------------------------
  // Setup Socket Listeners
  // -------------------------
  const setupSocketListeners = (socket) => {
    socket.removeAllListeners();

    socket.on("waiting", ({ message }) => {
      console.log('Waiting:', message);
      if (isMounted.current) {
        setLoading(true);
      }
    });

    socket.on("startMatch", ({ matchID, quiz, scores }) => {
      console.log('Match started:', matchID);
      
      if (isMounted.current) {
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
        setMatchFinished(false);
        setMatchResultShown(false);
        
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
      }
    });

    socket.on("nextQuestion", ({ index, scores }) => {
      console.log('Next question:', index + 1);
      
      if (isMounted.current) {
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
      }
    });

    socket.on("scoreUpdate", ({ user1Score, user2Score }) => {
      const currentQuiz = quizRef.current;
      if (currentQuiz && isMounted.current) {
        const updatedScores = {};
        if (currentQuiz.user1) updatedScores[currentQuiz.user1] = user1Score;
        if (currentQuiz.user2) updatedScores[currentQuiz.user2] = user2Score;
        setScores(updatedScores);
      }
    });

    socket.on("playerAnswered", ({ username, questionIndex, choice, isCorrect, questionEnded }) => {
      console.log('Player answered:', username);
      if (isMounted.current && username !== user.username && questionIndex === currentQuestionIndexRef.current) {
        setOpponentAnswered(true);
        setOpponentChoice(choice);
        setOpponentCorrect(isCorrect);
        
        if (questionEnded) {
          setQuestionEnded(true);
        }
      }
    });

    socket.on("answerFeedback", ({ isCorrect, correctChoice, yourChoice }) => {
      console.log('Answer feedback:', isCorrect ? 'Correct' : 'Incorrect');
      if (isMounted.current) {
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
      }
    });

    socket.on("finishMatch", ({ winner, finalScores }) => {
      console.log('Match finished! Winner:', winner);
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      if (isMounted.current) {
        setMatchFinished(true);
        setMatchResultShown(true);
        
        Alert.alert(
          "Match Finished!",
          `Winner: ${winner}\n\nFinal Scores:\n${
            Object.entries(finalScores)
              .map(([player, score]) => `${player}: ${score}`)
              .join('\n')
          }`,
          [
            { 
              text: 'Play Again',
              onPress: handlePlayAgain
            },
            { 
              text: 'Go Home',
              onPress: handleGoHome,
              style: 'cancel'
            }
          ]
        );
      }
    });

    socket.on("opponentDisconnected", ({ message }) => {
      console.log('Opponent disconnected event received');
      
      // CRITICAL FIX: Only show alert if match is NOT finished
      if (matchFinishedRef.current) {
        console.log('Match already finished, ignoring opponent disconnect');
        return;
      }
      
      // Also check if result was already shown
      if (matchResultShownRef.current) {
        console.log('Match result already shown, ignoring opponent disconnect');
        return;
      }
      
      if (isMounted.current) {
        Alert.alert(
          "Opponent Left",
          message || "Your opponent has disconnected. You win!",
          [
            { 
              text: 'Play Again',
              onPress: handlePlayAgain
            },
            { 
              text: 'Go Home',
              onPress: handleGoHome,
              style: 'cancel'
            }
          ]
        );
      }
    });

    socket.on("error", ({ message }) => {
      console.log('Error from server:', message);
      Alert.alert("Error", message);
    });

    socket.on("timeout", ({ message }) => {
      Alert.alert("Timeout", message, [
        { 
          text: 'Try Again',
          onPress: handlePlayAgain
        },
        { 
          text: 'Go Home',
          onPress: handleGoHome,
          style: 'cancel'
        }
      ]);
    });

    socket.on("disconnect", (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setIsReconnecting(true);
        setLoading(true);
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsReconnecting(false);
      setLoading(false);
      
      if (!matchFinishedRef.current && isMounted.current) {
        socket.emit("joinMatch", { 
          username: user.username,
          quizID: quizID
        });
      }
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log('Reconnection attempt:', attempt);
      setIsReconnecting(true);
    });

    socket.on("reconnect_failed", () => {
      console.log('Reconnection failed');
      setIsReconnecting(false);
      
      if (!matchFinishedRef.current && !matchResultShownRef.current) {
        Alert.alert(
          "Connection Lost",
          "Unable to reconnect to server. Please try again.",
          [
            { 
              text: 'Retry',
              onPress: handlePlayAgain
            },
            { 
              text: 'Go Home',
              onPress: handleGoHome,
              style: 'cancel'
            }
          ]
        );
      }
    });
  };

  // -------------------------
  // Start New Match
  // -------------------------
  const startNewMatch = () => {
    console.log('Starting new match...');
    resetMatchState();
    setIsReconnecting(false);
    
    const socket = initializeSocket();
    setupSocketListeners(socket);
    
    if (!socket.connected) {
      socket.connect();
    }
    
    socket.emit("joinMatch", { 
      username: user.username,
      quizID: quizID
    });
  };

  // -------------------------
  // Handlers
  // -------------------------
  const handlePlayAgain = () => {
    console.log('Play Again clicked');
    startNewMatch();
  };

  const handleGoHome = () => {
    console.log('Going home...');
    if (socketRef.current) {
      socketRef.current.emit("cancelWaiting");
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    navigation.navigate("Student_Home");
  };

  const handleAnswer = (choiceIndex) => {
    if (!quiz || !matchID || selectedChoice !== null || questionEnded || matchFinished) return;
    
    console.log('Submitting answer:', choiceIndex);
    setSelectedChoice(choiceIndex);
    setTimeLeft(0);
    setQuestionEnded(true);
    
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("answer", {
        matchID,
        username: user.username,
        index: currentQuestionIndex,
        choice: choiceIndex,
      });
    } else {
      Alert.alert("Connection Lost", "Please reconnect and try again.");
    }
  };

  const cancelMatchmaking = () => {
    if (socketRef.current) {
      socketRef.current.emit("cancelWaiting");
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    navigation.goBack();
  };

  // -------------------------
  // Initialize on Mount
  // -------------------------
  useEffect(() => {
    isMounted.current = true;
    console.log('LiveQuiz mounted, quizID:', quizID);

    if (!quizID) {
      Alert.alert("Error", "Quiz ID is missing. Please go back and try again.");
      navigation.goBack();
      return;
    }

    startNewMatch();

    return () => {
      isMounted.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
      }
    };
  }, []);

  // -------------------------
  // Timer Effect
  // -------------------------
  useEffect(() => {
    if (!quiz || selectedChoice !== null || questionEnded || matchFinished) return;
    
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
  }, [timeLeft, quiz, selectedChoice, questionEnded, matchFinished]);

  // -------------------------
  // Loading Screen
  // -------------------------
  if (loading || !quiz) {
    return (
      <LinearGradient
        colors={[gradientUp, gradientDown]}
        style={styles.container}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>
          {isReconnecting 
            ? "Reconnecting to server..." 
            : !quiz 
            ? "Finding opponent..." 
            : "Starting match..."}
        </Text>
        
        <TouchableOpacity
          onPress={cancelMatchmaking}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // -------------------------
  // Main Game UI
  // -------------------------
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const opponentName = players.find(player => player !== user.username);
  const showFeedback = answerFeedback !== null;
  const isUserCorrect = answerFeedback?.isCorrect;
  const canAnswer = selectedChoice === null && !questionEnded && !matchFinished;

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
      {questionEnded && !matchFinished && (
        <View style={[
          styles.statusBanner,
          { backgroundColor: opponentAnswered ? '#4CAF50' : '#FF9800' }
        ]}>
          <Text style={styles.statusBannerText}>
            {opponentAnswered 
              ? `${opponentName} answered! Next question in 2 seconds...` 
              : 'You answered! Waiting for opponent...'}
          </Text>
        </View>
      )}

      {matchFinished && (
        <View style={[
          styles.statusBanner,
          { backgroundColor: '#2196F3' }
        ]}>
          <Text style={styles.statusBannerText}>
            Match finished! Tap "Play Again" to start a new match.
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
          const choiceNumber = index + 1;
          const isSelected = selectedChoice === choiceNumber;
          const isOpponentAnswer = opponentChoice === choiceNumber;
          const isCorrectAnswer = choiceNumber === currentQuestion.correctChoice;
          
          let backgroundColor = '#fff';
          let borderColor = '#ddd';
          let textColor = '#333';
          let borderWidth = 2;
          
          if (questionEnded || selectedChoice !== null || matchFinished) {
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
              onPress={() => handleAnswer(choiceNumber)}
              disabled={!canAnswer}
              activeOpacity={0.7}
              style={[
                styles.choiceButton,
                {
                  backgroundColor,
                  borderColor,
                  borderWidth,
                }
              ]}
            >
              <View style={styles.choiceRow}>
                <View style={styles.choiceLetter}>
                  <Text style={styles.choiceLetterText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                
                <Text style={[styles.choiceText, { color: textColor }]}>
                  {choice}
                </Text>
                
                <View style={styles.indicatorContainer}>
                  {isSelected && (
                    <View style={[styles.indicatorBadge, { backgroundColor: isCorrectAnswer ? '#4CAF50' : '#F44336' }]}>
                      <Text style={styles.indicatorBadgeText}>You</Text>
                    </View>
                  )}
                  
                  {isOpponentAnswer && opponentName && !isSelected && (
                    <View style={[styles.indicatorBadge, { backgroundColor: opponentCorrect ? '#4CAF50' : '#F44336' }]}>
                      <Text style={styles.indicatorBadgeText}>Opp</Text>
                    </View>
                  )}
                  
                  {isCorrectAnswer && (questionEnded || selectedChoice !== null || matchFinished) && !isSelected && !isOpponentAnswer && (
                    <View style={[styles.indicatorBadge, { backgroundColor: '#4CAF50' }]}>
                      <Text style={styles.indicatorBadgeText}>✓</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {matchFinished
            ? 'Match finished! Play again or go home.'
            : questionEnded
            ? opponentAnswered
              ? 'Next question loading...'
              : 'Waiting for opponent to answer...'
            : selectedChoice !== null
            ? 'You answered! Waiting for opponent...'
            : opponentAnswered
            ? 'Opponent answered! Question ended.'
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
    padding: hp('1.5%'),
    marginBottom: hp('1.5%'),
    borderWidth: 2
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
    fontWeight: '400',
    flexWrap: 'wrap'
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp('2%')
  },
  indicatorBadge: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: wp('6%')
  },
  indicatorBadgeText: {
    color: '#fff',
    fontSize: hp('1.4%'),
    fontWeight: 'bold'
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