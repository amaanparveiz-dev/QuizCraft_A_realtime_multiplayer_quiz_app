import { View, Text, TouchableOpacity, Alert , ScrollView } from 'react-native'
import styles from '../../styles.js'
import { TextInput } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import { useState } from 'react';
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react'
import ThemeContext from '../../Context/ThemeContext.js'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import api from '../../config/api.js'

export default function Login() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [roleBg, setRoleBg] = useState("#2da0ecff")
  const [roleIcon, setRoleIcon] = useState("person-outline");
  const [role, setRole] = useState("Student");
  const [roleText, setRoleText] = useState("Join quizzes, compete with friends, and level up your knowledge!");

  const { gradientUp, setGradientUp, gradientDown, setGradientDown, changeTheme, roleSelected, setRoleSelected } = useContext(ThemeContext);

  const navigation = useNavigation();


  function roleChange(roletype) {
    if (roletype === "Student") {
      setRoleIcon("person-outline");
      setRoleBg("#2da0ecff");
      setRole("Student");
      setRoleText("Join quizzes, compete with friends, and level up your knowledge!");
      setRoleSelected("Student");

    }

    if (roletype === "Teacher") {
      setRoleIcon("school-outline");
      setRoleBg("#2ccd17ff");
      setRole("Teacher")
      setRoleText("Create engaging quizzes and track student progress.");
      setRoleSelected("Teacher");
    }

    if (roletype === "Admin") {
      setRoleIcon("shield-outline");
      setRoleBg("#cb2222ff");
      setRole("Admin")
      setRoleText("Manage users, content, and platform settings.");
      setRoleSelected("Admin");
    }
  }

  const handleLogin = async () => {
    console.log("UserData being sent:", { username, password });
    

    try {
      const res = await axios.post(api + "/api/auth/login-"+role, {
        username,
        password
      });

      console.log("Full response:", res.data);
      console.log(api);

      if (res.data.status === "OK") {
        await AsyncStorage.setItem("user", JSON.stringify(res.data.data));
        await AsyncStorage.setItem("token", res.data.token);
        navigation.navigate(role+'_Home', { user: res.data.data });
      } else {
        Alert.alert("Error", res.data.data || "Login failed");
      }
    } catch (e) {
      console.log("Full error:", e.response?.data || e.message);
      Alert.alert("Error", e.response?.data?.data || e.message || "Login failed");
    }
  };


  return (


    <LinearGradient
      colors={[gradientUp, gradientDown]} // teal-blue → purple
      start={{ x: 0, y: 0 }}           // top
      end={{ x: 0, y: 1 }}             // bottom
      style={{ flex: 1 }}
    >
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <View>
        <Text style={styles.Title}>QuizCraft</Text>
        <Text style={styles.MiniTitle}>Choose Your Role To Get Started</Text>

        <View style={styles.FormContainer}>

          <View style={styles.RoleBtnContainer}>

            <TouchableOpacity style={[styles.RoleBtn, { backgroundColor: role === "Student" ? '#9392929b': '#efededff'}]} onPress={() => { roleChange("Student") }}>
              <Ionicons name="person-outline" size={wp('6%')} color="black" style={styles.roleSelectIcon} />
              <Text style={{ fontSize: hp('1.9%') }}>Student</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.RoleBtn, { backgroundColor: role === "Teacher" ? '#9392929b' : '#efededff' }]} onPress={() => { roleChange("Teacher") }}>
              <Ionicons name="school-outline" size={wp('6%')} color="black" style={styles.roleSelectIcon} />
              <Text style={{ fontSize: hp('1.9%') }}>Teacher</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.RoleBtn, { backgroundColor: role === "Admin" ? '#9392929b' : '#efededff' }]} onPress={() => { roleChange("Admin") }}>
              <Ionicons name="shield-outline" size={wp('6%')} color="black" style={styles.roleSelectIcon} />
              <Text style={{ fontSize: hp('1.9%') }}>Admin</Text>
            </TouchableOpacity>

          </View>

          <View style={[styles.RoleBG, { backgroundColor: roleBg }]}>
            <Ionicons name={roleIcon} size={wp('8.35%')} color="white" style={styles.roleSelectIcon} />
            <Text style={[styles.RoleText, { fontSize: hp('3%') }]}>{role} Portal</Text>
            <Text style={[styles.RoleText, { fontSize: hp('1.9%') }]}>{roleText}</Text>
          </View>
          <TextInput
            style={styles.AuthInput}
            placeholder='Username' placeholderTextColor='#616161ff'
            value={username}
            onChangeText={(value) => setUsername(value)} />

          <TextInput
            style={styles.AuthInput}
            placeholder='Password' placeholderTextColor='#616161ff'
            secureTextEntry={true}
            value={password}
            onChangeText={(value) => setPassword(value)} />


          <TouchableOpacity style={styles.Button} onPress={handleLogin}>
            <Text style={{ fontSize: hp('2.1%'), fontWeight: 500 }}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.push('Register')}>
            <Text style={{ alignSelf: 'center', marginTop: hp('1.8%'), color: 'white', fontSize: hp('1.7%') }}>Forgot Password ?</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>


          <TouchableOpacity onPress={() => changeTheme("#007B8F", "#4B0057")}>
            <LinearGradient
              colors={["#007B8F", "#4B0057"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.themeButton}

            >
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => changeTheme("#8f0000ff", "#00570aff")}>
            <LinearGradient
              colors={["#8f0000ff", "#00570aff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.themeButton}
            >
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => changeTheme("#a5a117ff", "#323131ff")}>
            <LinearGradient
              colors={["#a5a117ff", "#323131ff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.themeButton}

            >
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => changeTheme("#FF6B6B", "#FFD93D")}>
            <LinearGradient
              colors={["#FF6B6B", "#FFD93D"]}
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

        <TouchableOpacity onPress={() => navigation.push('Register')}>
          <Text style={{ alignSelf: 'center', color: 'white', fontSize: hp('1.8%'), fontWeight: '500', marginTop: hp('0.5%') }}>Don't Have an Account ?</Text>
        </TouchableOpacity>

      </View>
      </ScrollView>
    </LinearGradient>

  )
}