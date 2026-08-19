import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert, FlatList } from 'react-native'
import styles from '../../styles.js'
import { useNavigation } from '@react-navigation/native'
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api.js'
import ThemeContext from '../../Context/ThemeContext.js'
import { Dropdown } from "react-native-element-dropdown";

export default function TeacherQuizDetails({ route }) {
    const { user, quizID } = route.params;
    const navigation = useNavigation();
    const { gradientUp, gradientDown } = useContext(ThemeContext);

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // --- Editable metadata fields ---
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [marks, setMarks] = useState("");
    const [time, setTime] = useState("");

    // --- Editable questions (working copy) ---
    const [questions, setQuestions] = useState([]);

    // --- Editing a single existing question ---
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
    const [editingQuestionData, setEditingQuestionData] = useState(null);

    // --- Add new question form ---
    const [currentQuestion, setCurrentQuestion] = useState({
        question: "",
        choice1: "",
        choice2: "",
        choice3: "",
        choice4: "",
        correctChoice: "",
    });
    const [dropDownValue2, setDropDownValue2] = useState(null);

    const dropdownData = [
        { label: "Easy", value: "Easy" },
        { label: "Medium", value: "Medium" },
        { label: "Hard", value: "Hard" }
    ];

    const dropdownData2 = [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
    ];

    useEffect(() => {
        loadQuiz();
    }, []);

    const loadQuiz = async () => {
        try {
            const res = await axios.post(api + "/api/Quiz/get-quiz-by-id", { quizID });
            if (res.data.status === 'Error') {
                Alert.alert("Error", "Could not load quiz");
            } else {
                const data = res.data.data;
                setQuiz(data);
                setTitle(data.title);
                setSubject(data.subject);
                setDescription(data.description);
                setDifficulty(data.difficulty);
                setMarks(String(data.marks));
                setTime(String(data.time));
                setQuestions(data.questions || []);
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Could not load quiz");
        } finally {
            setLoading(false);
        }
    }

    const cancelEdit = () => {
        // Reset all fields back to the last saved quiz state
        setTitle(quiz.title);
        setSubject(quiz.subject);
        setDescription(quiz.description);
        setDifficulty(quiz.difficulty);
        setMarks(String(quiz.marks));
        setTime(String(quiz.time));
        setQuestions(quiz.questions || []);
        setEditingQuestionIndex(null);
        setEditingQuestionData(null);
        setEditMode(false);
    }

    const saveChanges = async () => {
        if (!title || !subject || !description || !difficulty || !marks || !time) {
            Alert.alert("Error", "Please fill in all quiz settings fields.");
            return;
        }

        if (questions.length === 0) {
            Alert.alert("Error", "A quiz needs at least one question.");
            return;
        }

        setSaving(true);
        try {
            const res = await axios.post(api + "/api/Quiz/update-quiz", {
                id: quiz.id,
                title,
                subject,
                description,
                difficulty,
                time: Number(time),
                marks: Number(marks),
                questions,
            });

            if (res.data.status === "OK") {
                setQuiz(res.data.data);
                setQuestions(res.data.data.questions || []);
                setEditMode(false);
                setEditingQuestionIndex(null);
                setEditingQuestionData(null);
                Alert.alert("Success", "Quiz updated successfully!");
            } else {
                Alert.alert("Error", "Could not update quiz.");
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Could not update quiz.");
        } finally {
            setSaving(false);
        }
    }

    const handleDeleteQuiz = () => {
        Alert.alert(
            "Delete Quiz",
            "Are you sure you want to delete this quiz? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await axios.post(api + "/api/Quiz/delete-quiz", { id: quiz.id });
                            if (res.data.status === "OK") {
                                Alert.alert("Deleted", "Quiz deleted successfully.");
                                navigation.replace("Teacher_Home");
                            } else {
                                Alert.alert("Error", "Could not delete quiz.");
                            }
                        } catch (error) {
                            console.log(error);
                            Alert.alert("Error", "Could not delete quiz.");
                        }
                    }
                }
            ]
        );
    }

    const handleDeleteQuestion = (index) => {
        if (questions.length <= 1) {
            Alert.alert("Error", "A quiz needs at least one question. Add a new one before removing this.");
            return;
        }
        Alert.alert(
            "Delete Question",
            "Remove this question from the quiz?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        const updated = [...questions];
                        updated.splice(index, 1);
                        setQuestions(updated);
                        if (editingQuestionIndex === index) {
                            setEditingQuestionIndex(null);
                            setEditingQuestionData(null);
                        }
                    }
                }
            ]
        );
    }

    const startEditQuestion = (index) => {
        const q = questions[index];
        setEditingQuestionIndex(index);
        setEditingQuestionData({
            question: q.question,
            choice1: q.choices[0] || "",
            choice2: q.choices[1] || "",
            choice3: q.choices[2] || "",
            choice4: q.choices[3] || "",
            correctChoice: q.correctChoice,
        });
    }

    const cancelEditQuestion = () => {
        setEditingQuestionIndex(null);
        setEditingQuestionData(null);
    }

    const saveEditQuestion = () => {
        if (!editingQuestionData.question || !editingQuestionData.choice1 || !editingQuestionData.choice2 || !editingQuestionData.choice3 || !editingQuestionData.choice4 || !editingQuestionData.correctChoice) {
            Alert.alert("Missing Input", "Please fill in the question text, all choices, and the correct choice.");
            return;
        }

        const updated = [...questions];
        updated[editingQuestionIndex] = {
            question: editingQuestionData.question,
            choices: [
                editingQuestionData.choice1,
                editingQuestionData.choice2,
                editingQuestionData.choice3,
                editingQuestionData.choice4,
            ].filter(c => c !== ""),
            correctChoice: Number(editingQuestionData.correctChoice),
        };
        setQuestions(updated);
        setEditingQuestionIndex(null);
        setEditingQuestionData(null);
    }

    const handleAddQuestion = () => {
        if (!currentQuestion.question || !currentQuestion.choice1 || !currentQuestion.choice2 || !currentQuestion.choice3 || !currentQuestion.choice4 || !currentQuestion.correctChoice) {
            Alert.alert("Missing Input", "Please enter the question text, all choices, and the correct choice.");
            return;
        }

        const correctChoiceNum = Number(currentQuestion.correctChoice);
        if (isNaN(correctChoiceNum) || correctChoiceNum < 1 || correctChoiceNum > 4) {
            Alert.alert("Invalid Input", "Correct Choice must be a number between 1 and 4.");
            return;
        }

        const newQuestion = {
            question: currentQuestion.question,
            choices: [
                currentQuestion.choice1,
                currentQuestion.choice2,
                currentQuestion.choice3,
                currentQuestion.choice4,
            ].filter(choice => choice !== ""),
            correctChoice: correctChoiceNum,
        };

        setQuestions(prev => [...prev, newQuestion]);
        setCurrentQuestion({
            question: "",
            choice1: "",
            choice2: "",
            choice3: "",
            choice4: "",
            correctChoice: "",
        });
        setDropDownValue2(null);
    }

    if (loading || !quiz) {
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

            <View style={styles.header}>
                <View style={{ alignContent: 'left', marginLeft: wp('4'), flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => editMode ? cancelEdit() : navigation.replace('Teacher_Home')}>
                        <Ionicons name="chevron-back" size={wp('6%')} color="#efededff" style={{ marginTop: hp(7.65), marginRight: wp(3), marginLeft: hp(-1) }} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Quiz Details</Text>
                </View>
                <View style={{ flexDirection: 'row', marginRight: wp('4'), alignItems: 'center' }}>
                    {editMode ? (
                        <TouchableOpacity onPress={saveChanges} disabled={saving}>
                            {saving ? (
                                <ActivityIndicator size="small" color="#efededff" style={styles.headerIcon} />
                            ) : (
                                <Ionicons name="checkmark-outline" size={wp('7%')} color="#efededff" style={styles.headerIcon} />
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setEditMode(true)}>
                            <Ionicons name="create-outline" size={wp('6%')} color="#efededff" style={styles.headerIcon} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={handleDeleteQuiz}>
                        <Ionicons name="trash-outline" size={wp('6%')} color="#efededff" style={styles.headerIcon} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView>
                {!editMode ? (
                    // --- VIEW MODE ---
                    <View style={[styles.FormContainer, { marginHorizontal: wp('2%'), backgroundColor: styles.whiteColor || '#efededf3', padding: wp('4%') }]}>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp('1%') }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="book-outline" size={wp('6.5%')} color="#333" style={{ marginRight: wp('2%') }} />
                                <Text style={{ fontSize: hp('2.8%'), fontWeight: '600', color: '#333' }}>{quiz.subject}</Text>
                            </View>
                            <View style={{
                                backgroundColor:
                                    quiz.difficulty === 'Easy' ? '#21f905ff'
                                        : quiz.difficulty === 'Medium' ? '#2da0ecff'
                                            : '#d70000ff',
                                paddingHorizontal: wp('3%'), paddingVertical: hp('0.5%'), borderRadius: 50
                            }}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>{quiz.difficulty}</Text>
                            </View>
                        </View>

                        <Text style={{ fontSize: hp('2.5%'), fontWeight: '700', color: '#333', marginBottom: hp('1%') }}>{quiz.title}</Text>
                        <Text style={{ fontSize: hp('2%'), color: '#555', marginBottom: hp('1%') }}>{quiz.description}</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp('2%') }}>
                            <Ionicons name="person-outline" size={wp('5%')} color="#333" style={{ marginRight: wp('2%') }} />
                            <Text style={{ fontSize: hp('2%'), color: '#333' }}>{quiz.createdBy}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: hp('2%') }}>
                            <View style={styles.statBoxStyle}>
                                <Ionicons name="document-text-outline" size={wp('6%')} color="#2d9cecff" />
                                <Text style={styles.statLabel}>Total Questions</Text>
                                <Text style={styles.statValue}>{quiz.totalQuestions}</Text>
                            </View>

                            <View style={styles.statBoxStyle}>
                                <Ionicons name="time-outline" size={wp('6%')} color="#ec2d2dff" />
                                <Text style={styles.statLabel}>Duration</Text>
                                <Text style={styles.statValue}>{quiz.time || 10} sec</Text>
                            </View>

                            <View style={styles.statBoxStyle}>
                                <Ionicons name="flash-outline" size={wp('6%')} color="#edda06ff" />
                                <Text style={styles.statLabel}>XP Reward</Text>
                                <Text style={styles.statValue}>{quiz.marks} XP</Text>
                            </View>

                            <View style={styles.statBoxStyle}>
                                <Ionicons name="stats-chart-outline" size={wp('6%')} color="#2dec43ff" />
                                <Text style={styles.statLabel}>Avg Score</Text>
                                <Text style={styles.statValue}>
                                    {quiz.avgScore !== null && quiz.avgScore !== undefined ? quiz.avgScore + '%' : 'N/A'}
                                </Text>
                            </View>

                            <View style={styles.statBoxStyle}>
                                <Ionicons name="people-outline" size={wp('6%')} color="#8e2decff" />
                                <Text style={styles.statLabel}>Attempts</Text>
                                <Text style={styles.statValue}>{quiz.totalAttempts}</Text>
                            </View>
                        </View>

                        {/* Questions list (view only) */}
                        <Text style={{ fontSize: hp('2.3%'), fontWeight: '700', color: '#333', marginBottom: hp('1%') }}>Questions</Text>
                        {quiz.questions.map((q, i) => (
                            <View key={i} style={{ backgroundColor: '#f3f2f2', borderRadius: wp(3), padding: wp(3), marginBottom: hp(1.2) }}>
                                <Text style={{ fontWeight: '600', color: '#333', marginBottom: hp(0.6) }}>{i + 1}. {q.question}</Text>
                                {q.choices.map((c, ci) => (
                                    <Text key={ci} style={{ color: ci + 1 === q.correctChoice ? '#2e9e2e' : '#555', fontWeight: ci + 1 === q.correctChoice ? '700' : '400' }}>
                                        {String.fromCharCode(65 + ci)}. {c}{ci + 1 === q.correctChoice ? '  ✓' : ''}
                                    </Text>
                                ))}
                            </View>
                        ))}

                        <TouchableOpacity style={[styles.Button, { marginTop: hp('1'), borderStyle: 'solid', borderWidth: hp(0.05), borderColor: '#787777ff' }]} onPress={() => setEditMode(true)}>
                            <Text style={{ fontSize: hp('2%'), fontWeight: '600', color: '#020101ff' }}>Edit Quiz</Text>
                        </TouchableOpacity>

                    </View>
                ) : (
                    // --- EDIT MODE ---
                    <View style={{ marginTop: 5, flex: 1 }}>
                        <View style={[styles.FormContainer]}>
                            <View style={{ flexDirection: 'row' }}>
                                <Ionicons name="settings-outline" size={wp('7%')} color="#efededff" style={{ marginHorizontal: wp('2.6'), marginVertical: hp('0.2') }} />
                                <Text style={[styles.FormContainerText, { textAlign: 'left' }]}>Quiz Settings</Text>
                            </View>

                            <TextInput style={styles.AuthInput} placeholder='Title' placeholderTextColor='#616161ff' value={title} onChangeText={setTitle} />
                            <TextInput style={styles.AuthInput} placeholder='Subject' placeholderTextColor='#616161ff' value={subject} onChangeText={setSubject} />
                            <TextInput style={styles.AuthInput} placeholder='Description' placeholderTextColor='#616161ff' value={description} onChangeText={setDescription} />

                            <Dropdown
                                style={styles.AuthInput}
                                placeholderStyle={{ color: "#616161ff", fontSize: hp("2.4%") }}
                                selectedTextStyle={{ color: "black", fontSize: hp("2.4%") }}
                                containerStyle={{ borderRadius: 10 }}
                                data={dropdownData}
                                labelField="label"
                                valueField="value"
                                placeholder="Difficulty"
                                value={difficulty}
                                onChange={(item) => setDifficulty(item.value)}
                            />

                            <TextInput style={styles.AuthInput} placeholder='Each Question Marks' placeholderTextColor='#616161ff' keyboardType='numeric' value={marks} onChangeText={setMarks} />
                            <TextInput style={styles.AuthInput} placeholder='Time per Question (seconds)' placeholderTextColor='#616161ff' keyboardType='numeric' value={time} onChangeText={setTime} />
                        </View>

                        {/* Existing questions - editable */}
                        <FlatList
                            data={questions}
                            keyExtractor={(item, index) => index.toString()}
                            scrollEnabled={false}
                            renderItem={({ item, index }) => (
                                <View style={styles.addedQuestionsFlatlistContainer}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: wp(2) }}>
                                        <Text style={{ color: 'black', fontWeight: 700, fontSize: hp(2.3), marginVertical: hp(1) }}>
                                            Question ({index + 1})
                                        </Text>
                                        <View style={{ flexDirection: 'row' }}>
                                            {editingQuestionIndex === index ? (
                                                <>
                                                    <TouchableOpacity onPress={saveEditQuestion}>
                                                        <Ionicons name="checkmark-outline" size={wp('7%')} color="#43B749" style={styles.removeIcon} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={cancelEditQuestion}>
                                                        <Ionicons name="close-outline" size={wp('7%')} color="#efededff" style={styles.removeIcon} />
                                                    </TouchableOpacity>
                                                </>
                                            ) : (
                                                <>
                                                    <TouchableOpacity onPress={() => startEditQuestion(index)}>
                                                        <Ionicons name="pencil-outline" size={wp('6.5%')} color="#efededff" style={styles.removeIcon} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handleDeleteQuestion(index)}>
                                                        <Ionicons name="trash-outline" size={wp('7%')} color="#efededff" style={styles.removeIcon} />
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    {editingQuestionIndex === index ? (
                                        <View>
                                            <TextInput style={styles.AuthInput} placeholder='Question Text' placeholderTextColor='#616161ff'
                                                value={editingQuestionData.question}
                                                onChangeText={(v) => setEditingQuestionData(prev => ({ ...prev, question: v }))} />
                                            <TextInput style={styles.AuthInput} placeholder='Choice 1' placeholderTextColor='#616161ff'
                                                value={editingQuestionData.choice1}
                                                onChangeText={(v) => setEditingQuestionData(prev => ({ ...prev, choice1: v }))} />
                                            <TextInput style={styles.AuthInput} placeholder='Choice 2' placeholderTextColor='#616161ff'
                                                value={editingQuestionData.choice2}
                                                onChangeText={(v) => setEditingQuestionData(prev => ({ ...prev, choice2: v }))} />
                                            <TextInput style={styles.AuthInput} placeholder='Choice 3' placeholderTextColor='#616161ff'
                                                value={editingQuestionData.choice3}
                                                onChangeText={(v) => setEditingQuestionData(prev => ({ ...prev, choice3: v }))} />
                                            <TextInput style={styles.AuthInput} placeholder='Choice 4' placeholderTextColor='#616161ff'
                                                value={editingQuestionData.choice4}
                                                onChangeText={(v) => setEditingQuestionData(prev => ({ ...prev, choice4: v }))} />
                                            <Dropdown
                                                style={styles.AuthInput}
                                                placeholderStyle={{ color: "#616161ff", fontSize: hp("2.4%") }}
                                                selectedTextStyle={{ color: "black", fontSize: hp("2.4%") }}
                                                containerStyle={{ borderRadius: 10 }}
                                                data={dropdownData2}
                                                labelField="label"
                                                valueField="value"
                                                placeholder="Correct Choice"
                                                value={editingQuestionData.correctChoice}
                                                onChange={(item) => setEditingQuestionData(prev => ({ ...prev, correctChoice: item.value }))}
                                            />
                                        </View>
                                    ) : (
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.addedQuestionsFlatlistQuestion}>{item.question}</Text>
                                            <View style={{ flexWrap: 'wrap' }}>
                                                {item.choices.map((ch, i) => (
                                                    <View key={i} style={[styles.choicesButton, { backgroundColor: i + 1 === item.correctChoice ? '#43B749' : '#ffffffe9' }]}>
                                                        <Text style={styles.choicesButtonText}>{ch}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                            ListEmptyComponent={() => (
                                <Text style={{ textAlign: 'center', marginTop: 20, fontSize: hp(3), fontWeight: 700, color: "#efededff" }}>
                                    No Questions Added Yet
                                </Text>
                            )}
                        />

                        {/* Add new question */}
                        <View style={[styles.FormContainer]}>
                            <View style={{ flexDirection: 'row' }}>
                                <Ionicons name="add-circle-outline" size={wp('7%')} color="#efededff" style={{ marginHorizontal: wp('2.6'), marginVertical: hp('0.2') }} />
                                <Text style={[styles.FormContainerText, { textAlign: 'left' }]}>{`Add Question ${questions.length + 1}`}</Text>
                            </View>
                            <TextInput style={styles.AuthInput} placeholder='Question Text' placeholderTextColor='#616161ff'
                                value={currentQuestion.question}
                                onChangeText={(value) => setCurrentQuestion(prev => ({ ...prev, question: value }))} />
                            <TextInput style={styles.AuthInput} placeholder='Choice 1' placeholderTextColor='#616161ff'
                                value={currentQuestion.choice1}
                                onChangeText={(value) => setCurrentQuestion(prev => ({ ...prev, choice1: value }))} />
                            <TextInput style={styles.AuthInput} placeholder='Choice 2' placeholderTextColor='#616161ff'
                                value={currentQuestion.choice2}
                                onChangeText={(value) => setCurrentQuestion(prev => ({ ...prev, choice2: value }))} />
                            <TextInput style={styles.AuthInput} placeholder='Choice 3' placeholderTextColor='#616161ff'
                                value={currentQuestion.choice3}
                                onChangeText={(value) => setCurrentQuestion(prev => ({ ...prev, choice3: value }))} />
                            <TextInput style={styles.AuthInput} placeholder='Choice 4' placeholderTextColor='#616161ff'
                                value={currentQuestion.choice4}
                                onChangeText={(value) => setCurrentQuestion(prev => ({ ...prev, choice4: value }))} />
                            <Dropdown
                                style={styles.AuthInput}
                                placeholderStyle={{ color: "#616161ff", fontSize: hp("2.4%") }}
                                selectedTextStyle={{ color: "black", fontSize: hp("2.4%") }}
                                containerStyle={{ borderRadius: 10 }}
                                data={dropdownData2}
                                labelField="label"
                                valueField="value"
                                placeholder="Correct Choice"
                                value={dropDownValue2}
                                onChange={(item) => {
                                    setDropDownValue2(item.value);
                                    setCurrentQuestion(prev => ({ ...prev, correctChoice: item.value }));
                                }}
                            />
                            <View>
                                <TouchableOpacity style={styles.addQuestionButton} onPress={handleAddQuestion}>
                                    <Ionicons name="add" size={wp('8.5%')} color='black' style={styles.removeIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={[styles.Button, { backgroundColor: '#43B749' }]} onPress={saveChanges} disabled={saving}>
                            {saving ? <ActivityIndicator color="#000" /> : <Text style={{ fontSize: 18, fontWeight: 700 }}>Save Changes</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.Button} onPress={cancelEdit}>
                            <Text style={{ fontSize: 18, fontWeight: 700 }}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.Button, { backgroundColor: '#F44336' }]} onPress={handleDeleteQuiz}>
                            <Text style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Delete Quiz</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    )
}
