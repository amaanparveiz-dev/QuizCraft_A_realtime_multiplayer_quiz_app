import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import styles from '../../styles.js'
import { useNavigation } from '@react-navigation/native'
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api.js'
import ThemeContext from '../../Context/ThemeContext.js'

export default function QuizDetails({ route }) {
    const { user, quizID } = route.params;
    const navigation = useNavigation();
    const { gradientUp, gradientDown } = useContext(ThemeContext);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuiz();
    }, []);

    const loadQuiz = async () => {
        try {
            const res = await axios.post(api + "/api/Quiz/get-quiz-by-id", { quizID });
            if (res.data.status === 'Error') {
                console.log("Unexpected Error");
            } else {
                setQuiz(res.data.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleAttemptQuiz = async () => {
        const attemptData = {
            id: quiz.id,
            attemptedBy: user.username,
        }
        try {
            const res = await axios.post(api + "/api/QuizAttempt/start-quiz", attemptData);
            navigation.replace("Quiz_Attempt", {
                id: quiz.id,
                user: user.username,
                totalQuestions: quiz.totalQuestions,
                time: quiz.time,
                attemptId: res.data.attemptId,

            })

        } catch (error) {
            console.log(error, "Quiz Not Started");
        }

    }

    if (loading) {
        return (
            <LinearGradient
                colors={[gradientUp, gradientDown]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >
                <ActivityIndicator size="large" color="#fff" />
            </LinearGradient>
        )
    }

    return (
        <LinearGradient
            colors={[gradientUp, gradientDown]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >

            <View style={styles.header} >
                <View style={{ alignContent: 'left', marginLeft: wp('4'), flexDirection: 'row' }}>

          <TouchableOpacity onPress={() => navigation.replace('Student_Home')}>
            <Ionicons name="chevron-back" size={wp('6%')} color="#efededff" style={{ marginTop: hp(7.65), marginRight: wp(3), marginLeft: hp(-1) }} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Quiz Details</Text>
        </View>
                        <View style={{ flexDirection: 'row', marginRight: wp('4'), alignItems: 'center' }}>

                    <TouchableOpacity onPress={()=>{navigation.navigate("Student_Home")}}>
                        <Ionicons name="person-outline" size={wp('6%')} color="#efededff" style={styles.headerIcon} />
                    </TouchableOpacity></View>
            </View>

            <ScrollView>
                <View style={[styles.FormContainer, { marginHorizontal: wp('2%'), backgroundColor: styles.whiteColor || '#efededf3', padding: wp('4%') }]}>

                    {/* Subject + Difficulty */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp('1%') }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="book-outline" size={wp('6.5%')} color="#333" style={{ marginRight: wp('2%') }} />
                            <Text style={{ fontSize: hp('2.8%'), fontWeight: '600', color: '#333' }}>{quiz.subject}</Text>
                        </View>
                        <View style={{
                            backgroundColor:
                                quiz.difficulty === 'Easy'
                                    ? '#21f905ff'
                                    : quiz.difficulty === 'Medium'
                                        ? '#2da0ecff'
                                        : '#d70000ff', paddingHorizontal: wp('3%'), paddingVertical: hp('0.5%'), borderRadius: 50
                        }}>
                            <Text style={{ color: '#fff', fontWeight: '600' , }}>{quiz.difficulty}</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={{ fontSize: hp('2.5%'), fontWeight: '700', color: '#333', marginBottom: hp('1%') }}>{quiz.title}</Text>

                    {/* Description */}
                    <Text style={{ fontSize: hp('2%'), color: '#555', marginBottom: hp('1%') }}>{quiz.description}</Text>

                    {/* Created By */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp('2%') }}>
                        <Ionicons name="person-outline" size={wp('5%')} color="#333" style={{ marginRight: wp('2%') }} />
                        <Text style={{ fontSize: hp('2%'), color: '#333' }}>{quiz.createdBy}</Text>
                    </View>

                    {/* Stats Boxes */}
                    <View
                        style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            marginBottom: hp('2%'),
                        }}
                    >

                        {/* Total Questions */}
                        <View style={styles.statBoxStyle}>
                            <Ionicons name="document-text-outline" size={wp('6%')} color="#2d9cecff" />
                            <Text style={styles.statLabel}>Total Questions</Text>
                            <Text style={styles.statValue}>{quiz.totalQuestions}</Text>
                        </View>

                        {/* Duration */}
                        <View style={styles.statBoxStyle}>
                            <Ionicons name="time-outline" size={wp('6%')} color="#ec2d2dff" />
                            <Text style={styles.tatLabel}>Duration</Text>
                            <Text style={styles.statValue}>{quiz.time || 10} sec</Text>
                        </View>

                        {/* XP Reward */}
                        <View style={styles.statBoxStyle}>
                            <Ionicons name="flash-outline" size={wp('6%')} color="#edda06ff" />
                            <Text style={styles.statLabel}>XP Reward</Text>
                            <Text style={styles.statValue}>{quiz.marks} XP</Text>
                        </View>

                        {/* Avg Score */}
                        <View style={styles.statBoxStyle}>
                            <Ionicons name="stats-chart-outline" size={wp('6%')} color="#2dec43ff" />
                            <Text style={styles.statLabel}>Avg Score</Text>
                            <Text style={styles.statValue}>
                                {quiz.avgScore !== null && quiz.avgScore !== undefined
                                    ? quiz.avgScore + '%'
                                    : 'N/A'}
                            </Text>
                        </View>

                    </View>

                    {/* Attempt Button */}
                    <TouchableOpacity style={[styles.Button, { marginTop: hp('-2') , borderStyle:'solid' , borderWidth:hp(0.05) , borderColor:'#787777ff' }]} onPress={handleAttemptQuiz}>
                        <Text style={{ fontSize: hp('2%'), fontWeight: '600', color: '#020101ff' }}>Attempt Quiz</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </LinearGradient>
    )
}