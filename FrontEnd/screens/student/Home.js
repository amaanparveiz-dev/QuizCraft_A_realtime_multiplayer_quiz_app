import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert, FlatList , RefreshControl} from 'react-native'
import styles from '../../styles.js'
import { useNavigation } from '@react-navigation/native'
import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import api from '../../config/api.js';
import ThemeContext from '../../Context/ThemeContext.js'





export default function Home() {


  const [user, setUser] = useState("");
  const navigation = useNavigation();
  const [quizes, setQuizes] = useState([]);
  const [quizList, setQuizList] = useState(3);

  const { gradientUp, setGradientUp, gradientDown, setGradientDown, changeTheme, roleSelected, setRoleSelected } = useContext(ThemeContext);


  const [refresh , setRefresh] = useState(false);


  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        loadQuizes(parsedUser.username);
      }
    };
    loadUser();
  }, []);

    const loadQuizes = async () => {
      try {
        const res = await axios.get(api + "/api/Quiz/get-all-quizes")
        if(!res){
          console.log("No Quizes");
        }

        setQuizes(res.data.data);
        console.log("Quizes Found");
      } catch (error) {
        console.log(error);
      }
    }


       const startQuiz =async (quiz) => {

    const attemptData = {
      id:quiz.id,
      attemptedBy:user.username,
    }
    try {
      await axios.post(api + "/api/QuizAttempt/start-quiz" , attemptData);
        navigation.replace("Quiz_Attempt" , {
                    id:quiz.id,
                    user: user.username,
                    totalQuestions:quiz.totalQuestions,
                    time: quiz.time,

                })  
              
              } catch (error) {
      console.log(error , "Quiz Not Started");
    }

   } 


  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007B8F" />
      </View>
    );
  }

  return (

    <LinearGradient
      colors={[gradientUp, gradientDown]} // teal-blue → purple
      start={{ x: 0, y: 0 }}           // top
      end={{ x: 0, y: 1 }}             // bottom
      style={{ flex: 1 }}
    >

      <View style={styles.header}>
        <View style={{ alignContent: 'left', marginLeft: wp('4'), }}>
          <Text style={styles.headerText}>Dashboard</Text>
        </View>
        <View style={{ flexDirection: 'row', marginRight: wp('4'), alignItems: 'center' }}>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={wp('6%')} color="#efededff" style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="person-outline" size={wp('6%')} color="#efededff" style={styles.headerIcon} />
          </TouchableOpacity></View>
      </View>


      <ScrollView  contentContainerStyle={{ flexGrow: 1 }}    
      refreshControl={
    <RefreshControl refreshing={refresh} onRefresh={loadQuizes} />
  }>
        
        <View style={{ flex: 1 }}>

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity>
              <View style={[styles.insightsButton, { backgroundColor: '#0bbe0bff' }]}>
                <View>
                  <Text style={[styles.insightsButtonText, { fontWeight: 500, }]}>Quizes</Text>
                  <Text style={[styles.insightsButtonText, { fontWeight: 900, fontSize: hp(3) }]}>{quizes.length}</Text>
                </View>

                <View>
                  <Ionicons name="book-outline" size={wp('8%')} color="#efededff" style={styles.insightsButtonIcon} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={[styles.insightsButton, { backgroundColor: '#c3371eff' }]}>
                <View>
                  <Text style={[styles.insightsButtonText, { fontWeight: 500, }]}>Avg Score</Text>
                  <Text style={[styles.insightsButtonText, { fontWeight: 900, fontSize: hp(3) }]}>77 %</Text>
                </View>

                <View>
                  <Ionicons name="trending-up-outline" size={wp('8%')} color="#efededff" style={styles.insightsButtonIcon} />
                </View>
              </View>
            </TouchableOpacity>
          </View>


          <View style={styles.FormContainer}>
            <Text style={styles.FormContainerText}>Available Quizes</Text>

            <FlatList
              data={quizes.slice(0, quizList)}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                
<TouchableOpacity onPress={() => navigation.replace("Live_Quiz", { user: user })}>
  <View style={styles.flatlistContainer}>
  <View style={styles.leftContainer}>
    <Text
      style={styles.flatlistTextTitle}
      numberOfLines={2}
      ellipsizeMode="tail"
    >
      {item.title}
    </Text>

    <Text style={styles.flatlistText}>{item.subject}</Text>
    <Text style={styles.flatlistText}>{item.difficulty}</Text>
    <Text style={styles.flatlistText}>Avg Score: 85%</Text>
  </View>

  <View style={styles.rightContainer}>
    <Text style={styles.flatlistText2}>
      {item.totalAttempts} Attempts
    </Text>

    <TouchableOpacity style={styles.flatlistButton} onPress={()=>{navigation.replace('Quiz_Details_Student' , {user: user, quizID: item.id })}}>
      <Text>View Details</Text>
    </TouchableOpacity>
  </View>
</View>
  </TouchableOpacity>

              )}
              ListEmptyComponent={() => (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>No quizzes available</Text>
              )}
            />

            <TouchableOpacity style={{ alignItems: 'center', marginVertical: hp(1) }}
              onPress={() => { quizList === 3 ? setQuizList() : setQuizList(3) }}
            >
              <Text style={styles.viewAll}>{quizList === 3 ? 'View All' : 'View Less'}</Text>
            </TouchableOpacity>
          </View>





          <View style={[styles.FormContainer]}>
            <Text style={styles.FormContainerText}>Quick Actions</Text>
            <View style={{ flexDirection: 'row', alignSelf: 'center', justifyContent: 'center' }}>
              <TouchableOpacity style={styles.quickActionsButton} onPress={() => navigation.replace('Quiz_Create')}>
                <Ionicons name="add" size={wp('6%')} color="black" style={styles.quickActionsIcon} />
                <Text style={{ fontSize: hp(2.2), fontWeight: 500 }}>Create Quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionsButton}>
                <Ionicons name="analytics" size={wp('6%')} color="black" style={styles.quickActionsIcon} />
                <Text style={{ fontSize: hp(2.2), fontWeight: 500 }}>Analytics</Text>
              </TouchableOpacity>
            </View>

          </View>




          <View style={{ flexDirection: 'row', alignSelf: 'center' }}>


            <TouchableOpacity onPress={() => changeTheme("#000000ff", "#000000ff")}>
              <LinearGradient
                colors={["#000000ff", "#000000ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.themeButton}

              >
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => changeTheme("#081A14", "#1A4B37")}>
              <LinearGradient
                colors={["#081A14", "#1A4B37"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.themeButton}
              >
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => changeTheme("#2D1E2F", "#4E2A4F")}>
              <LinearGradient
                colors={["#2D1E2F", "#4E2A4F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.themeButton}

              >
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => changeTheme("#2C0F12", "#6B1E23")}>
              <LinearGradient
                colors={["#2C0F12", "#6B1E23"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.themeButton}
              >
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => changeTheme("#141E30", "#243B55")}>
              <LinearGradient
                colors={["#141E30", "#243B55"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.themeButton}
              >
              </LinearGradient>
            </TouchableOpacity>

          </View>

          <TouchableOpacity style={styles.Button} onPress={handleLogout}>
            <Text style={{ fontSize: 18 }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}