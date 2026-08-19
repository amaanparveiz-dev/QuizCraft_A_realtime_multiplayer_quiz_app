import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert, FlatList } from 'react-native'
import styles from '../../styles.js'
import { useNavigation } from '@react-navigation/native' // Removed useStateForPath
import { useState, useEffect, useContext } from 'react'; // Consolidated React imports
import axios from 'axios';
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api.js'
import ThemeContext from '../../Context/ThemeContext.js'
import { Dropdown } from "react-native-element-dropdown";


export default function QuizCreate() {
  // --- Quiz Metadata States ---
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setdifficulty] = useState("");
  const [publicc, setPublicc] = useState("");
  const [marks, setMarks] = useState("");
  const [time, setTime] = useState("");
  const [dropDownValue, setdropDownValue] = useState(null);
  const [dropDownValue2, setDropDownValue2] = useState(null);

  // --- Dynamic Question States ---
  // The main state to hold all added questions (the 2D array / array of objects)
  const [questions, setQuestions] = useState([]);

  // State to hold the data for the question currently being typed into the form
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    choice1: "",
    choice2: "",
    choice3: "",
    choice4: "",
    correctChoice: "",
  });

  // --- Other States and Hooks ---
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const { gradientUp, gradientDown } = useContext(ThemeContext);

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
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        setUser({});
      }
    };
    loadUser();
  }, []);

  const handleAddQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.choice1 || !currentQuestion.choice2 || !currentQuestion.choice3 || !currentQuestion.choice4 || !currentQuestion.correctChoice) {
      Alert.alert("Missing Input", "Please enter the question text, Choice 1, and the Correct Choice number.");
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

    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);

    setCurrentQuestion({
      question: "",
      choice1: "",
      choice2: "",
      choice3: "",
      choice4: "",
      correctChoice: "",
    });

    Alert.alert("Question Added", `You have added ${questions.length + 1} question(s) so far.`);
  };


  const createQuiz = async () => {
    if (questions.length === 0) {
      Alert.alert("Error", "Please add at least one question before creating the quiz.");
      return;
    }

    if (!title || !subject || !description || !difficulty || !marks || !time) {
      Alert.alert("Error", "Please fill in all Quiz Settings fields.");
      return;
    }


    try {
      const res = await axios.post(api + "/api/counter/get-id",);

      console.log("Full response:", res.data);

      if (res.data.status === "OK") {
        const quizData = {
          id: Number(res.data.data.count),
          createdBy: user.username,
          title,
          subject,
          description,
          difficulty,
          time: Number(time),
          totalQuestions: questions.length,
          questions: questions,
          marks: Number(marks),
        };

        console.log("QuizData being sent:", quizData);


        await axios.post(api + "/api/quiz/register-quiz", quizData);
        await axios.post(api + "/api/counter/add-id");

        Alert.alert("Success", "Quiz Created Successfully!");
        navigation.replace('Teacher_Home');

      } else {
        Alert.alert("Error", res.data.data || "ID NOT Found");
      }
    } catch (e) {
      console.log("Full error:", e.response?.data || e.message);
      Alert.alert("Error", e.response?.data?.data || e.message || "Unknown Error");
    }
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#efededff" />
      </View>
    );
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

          <TouchableOpacity onPress={() => navigation.replace('Teacher_Home')}>
            <Ionicons name="chevron-back" size={wp('6%')} color="#efededff" style={{ marginTop: hp(7.65), marginRight: wp(3), marginLeft: hp(-1) }} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Create Quiz</Text>
        </View>
        <View style={{ flexDirection: 'row', marginRight: wp('4'), alignItems: 'center' }}>
          {/* Use the save icon to trigger the final quiz creation */}
          <TouchableOpacity onPress={createQuiz}>
            <Ionicons name="save-outline" size={wp('6%')} color="#efededff" style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
      </View>


      <ScrollView style={{ flex: 1 }}>

        {/* --- Quiz Settings --- */}
        <View style={{ marginTop: 5, flex: 1 }}>
          <View style={[styles.FormContainer]}>
            <View style={{ flexDirection: 'row' }}>
              <Ionicons name="settings-outline" size={wp('7%')} color="#efededff" style={{ marginHorizontal: wp('2.6'), marginVertical: hp('0.2') }} />
              <Text style={[styles.FormContainerText, { textAlign: 'left' }]}>Quiz Settings</Text>
            </View>
            <TextInput
              style={styles.AuthInput}
              placeholder='Title' placeholderTextColor='#616161ff'
              value={title}
              onChangeText={setTitle} />


            <TextInput
              style={styles.AuthInput}
              placeholder='Subject' placeholderTextColor='#616161ff'
              value={subject}
              onChangeText={setSubject} />

            <TextInput
              style={styles.AuthInput}
              placeholder='Description' placeholderTextColor='#616161ff'
              value={description}
              onChangeText={setDescription} />

            <Dropdown
              style={styles.AuthInput}
              placeholderStyle={{ color: "#616161ff", fontSize: hp("2.4%") }}
              selectedTextStyle={{ color: "black", fontSize: hp("2.4%") }}
              containerStyle={{
                borderRadius: 10,
              }}
              data={dropdownData}
              labelField="label"
              valueField="value"
              placeholder="Difficulty"
              value={dropDownValue}
              onChange={(item) => {
                setdropDownValue(item.value);
                setdifficulty(item.value);
              }}
            />


            <TextInput
              style={styles.AuthInput}
              placeholder='Each Question Marks' placeholderTextColor='#616161ff'
              keyboardType='numeric'
              value={marks}
              onChangeText={setMarks} />

            <TextInput
              style={styles.AuthInput}
              placeholder='Time per Question (seconds)' placeholderTextColor='#616161ff'
              keyboardType='numeric'
              value={time}
              onChangeText={setTime} />
          </View>



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

                  <TouchableOpacity
                    onPress={() => {
                      const updated = [...questions];
                      updated.splice(index, 1);
                      setQuestions(updated);
                    }}
                  >
                    <Ionicons name="trash-outline" size={wp('8%')} color="#efededff" style={styles.removeIcon} />
                  </TouchableOpacity>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.addedQuestionsFlatlistQuestion}>
                    {item.question}
                  </Text>

                  <View style={{ flexWrap: 'wrap' }}>
                    {item.choices.map((ch, i) => (
                      <View key={i} style={[styles.choicesButton, { backgroundColor: i + 1 === item.correctChoice ? '#43B749' : '#ffffffe9' }]}>
                        <Text style={styles.choicesButtonText}>{ch}</Text>
                      </View>
                    ))}
                  </View>

                </View>
              </View>

            )}

            ListEmptyComponent={() => (
              <Text style={{ textAlign: 'center', marginTop: 20 ,fontSize:hp(3), fontWeight:700 , color:"#efededff" }}>
                No Questions Added Yet
              </Text>
            )}
          />



          <View style={[styles.FormContainer]}>
            <View style={{ flexDirection: 'row' }}>
              <Ionicons name="book-outline" size={wp('7%')} color="#efededff" style={{ marginHorizontal: wp('2.6'), marginVertical: hp('0.2') }} />
              <Text style={[styles.FormContainerText, { textAlign: 'left' }]}>{`Add Question ${questions.length + 1}`}</Text>
            </View>
            <TextInput
              style={styles.AuthInput}
              placeholder='Question Text' placeholderTextColor='#616161ff'
              value={currentQuestion.question}
              onChangeText={(value) => setCurrentQuestion(prev => ({ ...prev, question: value }))} />

            <TextInput
              style={styles.AuthInput}
              placeholder='Choice 1' placeholderTextColor='#616161ff'
              value={currentQuestion.choice1}
              onChangeText={(value) => setCurrentQuestion(prev => ({ ...prev, choice1: value }))} />

            <TextInput
              style={styles.AuthInput}
              placeholder='Choice 2' placeholderTextColor='#616161ff'
              value={currentQuestion.choice2}
              onChangeText={(value) => setCurrentQuestion(prev => ({ ...prev, choice2: value }))} />

            <TextInput
              style={styles.AuthInput}
              placeholder='Choice 3' placeholderTextColor='#616161ff'
              value={currentQuestion.choice3}
              onChangeText={(value) => setCurrentQuestion(prev => ({ ...prev, choice3: value }))} />

            <TextInput
              style={styles.AuthInput}
              placeholder='Choice 4' placeholderTextColor='#616161ff'
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
                setCurrentQuestion(prev => ({
                  ...prev,
                  correctChoice: item.value,
                }));
              }}
            />

            <View>
          <TouchableOpacity style={styles.addQuestionButton} onPress={handleAddQuestion}>
           <Ionicons name="add" size={wp('8.5%')} color='black' style={styles.removeIcon} />
          </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.Button, { backgroundColor: '#43B749' }]} onPress={createQuiz}>
            <Text style={{ fontSize: 18, fontWeight:700 }}>Create Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.Button} onPress={() => navigation.replace('Teacher_Home')}>
            <Text style={{ fontSize: 18,  fontWeight:700 }}>Cancel & Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}