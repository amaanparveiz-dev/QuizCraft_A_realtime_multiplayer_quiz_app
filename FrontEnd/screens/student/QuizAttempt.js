import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import styles from '../../styles.js';
import { useNavigation } from '@react-navigation/native'
import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api.js'
import ThemeContext from '../../Context/ThemeContext.js'
import { StyleSheet } from "react-native";
import * as Haptics from 'expo-haptics';

export default function QuizAttempt({ route }) {

    // Removed 'duration' as we are now using fixed 10s per question
    const { id, user, totalQuestions, time } = route.params;

    const [question, setQuestion] = useState("");
    const [choices, setChoices] = useState([]);
    const [correctChoice, setCorrectChoice] = useState("");
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    // --- TIMER STATE (Per Question) ---
    const [timeLeft, setTimeLeft] = useState(time);
    const [isQuizFinished, setIsQuizFinished] = useState(false);

    const navigation = useNavigation();
    const { gradientUp, gradientDown } = useContext(ThemeContext);

    useEffect(() => {
        // Don't run timer if loading, finished, or time is already up
        if (loading || isQuizFinished || timeLeft <= 0) return;

        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => {

                if(prevTime<6){
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

                }

                if (prevTime <= 1) {
                    clearInterval(intervalId);
                    handleTimeout(); // Time is up!
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, loading, isQuizFinished]);


    // Handle what happens when 10 seconds runs out
    const handleTimeout = () => {
        console.log("Time out! Moving to next question...");
        saveAnswer(0);
    };


    const loadQuestion = async () => {
        setLoading(true);
        try {
            const res = await axios.post(api + "/api/quizAttempt/load-question", {
                id,
                index
            });

            if (!res.data || !res.data.question) {
                setQuestion("Quiz Completed!");
                setChoices([]);
                setIsQuizFinished(true);
            } else {
                setQuestion(res.data.question);
                setChoices(res.data.choices || []);
                setCorrectChoice(res.data.correctChoice);

                setTimeLeft(time);
            }
        } catch (error) {
            console.log(error);
            setQuestion("Error loading question");
        } finally {
            setLoading(false);
        }
    };

    const saveAnswer = async (choiceIndex) => {

        if (loading) return;

        if(choiceIndex != correctChoice){
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        try {
            await axios.post(api + "/api/quizAttempt/save-answer", {
                id,
                attemptedBy: user,
                choice: choiceIndex,
                index,
                correctChoice
            });

            setIndex(prevIndex => prevIndex + 1);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadQuestion();
    }, [index]);


    const goBack = async () => {
        navigation.replace("Student_Home");
    }

    const getTimerColor = () => {
        if (timeLeft > 5) return "#efededff"; // White
        return "#ff4d4d"; // Red
    };


    return (
        <LinearGradient
            colors={[gradientUp, gradientDown]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex:1 }}>
                    <Text style={[styles.headerText , {marginLeft:wp(20) , textAlign:'center'}]}>
                        {question === "Quiz Completed!"
                            ? "Completed"
                            : `Question - ${index + 1}/${totalQuestions}`
                        }
                    </Text>
</View>
                    <View
                        style={{
                            width: wp(13),
                            height: hp(6),
                            borderRadius: wp(10),
                            borderWidth: 4,
                            borderColor: getTimerColor(),
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop:hp(5.8),
                            marginHorizontal:wp(5)
                        }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                            {timeLeft}s
                        </Text>
                    </View>


                </View>

            <ScrollView style={{ marginHorizontal: wp(2) }}>

                {loading ? (
                    <ActivityIndicator size="large" color="#fff" style={{ marginTop: hp(10) }} />
                ) : (
                    <>
                        {/* Question Card */}
                        <View style={styles.questionCard}>
                            <Text style={styles.questionText}>{question}</Text>
                        </View>

                        {/* Choices Container */}
                        <View style={styles.choicesContainer}>
                            {choices.length > 0 ? (
                                choices.map((choice, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.choiceButton}
                                        onPress={() => saveAnswer(i + 1)}
                                    >
                                        <View style={styles.choiceCircle}>
                                            <Text style={styles.choiceLetter}>{String.fromCharCode(65 + i)}</Text>
                                        </View>
                                        <Text style={styles.choiceText}>{choice}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.infoText}>
                                    {question === "Quiz Completed!" ? "You have finished the quiz." : ""}
                                </Text>
                            )}
                        </View>

                        {/* Footer Action */}
                        <TouchableOpacity style={styles.footerButton} onPress={goBack}>
                            <Text style={styles.footerButtonText}>
                                {choices.length > 0 ? "Quit Quiz" : "Finish & Return Home"}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </LinearGradient>
    )
}