import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/auth/Login.js';
import Register from './screens/auth/Register.js';
import Student_Home from './screens/student/Home.js';
import Teacher_Home from './screens/teacher/Home.js';
import Quiz_Attempt from './screens/student/QuizAttempt.js';
import Quiz_Create from './screens/teacher/QuizCreate.js';
import Quiz_Details_Student from './screens/student/QuizDetails.js';
import Live_Quiz from './screens/student/LiveQuiz.js';
import { ThemeProvider } from './Context/ThemeContext.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');

        if (token && userData) {
          setInitialRoute('Home');
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error("Error checking login:", error);
        setInitialRoute('Login');
      }
    };

    checkLogin();
  }, []);


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Student_Home" component={Student_Home} />
        <Stack.Screen name="Teacher_Home" component={Teacher_Home} />
        <Stack.Screen name='Quiz_Attempt' component={Quiz_Attempt}/>
        <Stack.Screen name='Quiz_Create' component={Quiz_Create}/>
        <Stack.Screen name='Quiz_Details_Student' component={Quiz_Details_Student}/>
        <Stack.Screen name='Live_Quiz' component={Live_Quiz}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
