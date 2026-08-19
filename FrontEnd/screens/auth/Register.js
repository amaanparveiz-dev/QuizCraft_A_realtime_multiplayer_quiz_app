import { View, Text, TouchableOpacity, Alert , ScrollView } from 'react-native'
import styles from '../../styles.js'
import { TextInput } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import { useEffect, useState } from 'react';
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react'
import ThemeContext from '../../Context/ThemeContext.js'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import api from '../../config/api.js'


export default function Register() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [institution, setInstitutuion] = useState("");
  const [roleBg, setRoleBg] = useState("#2da0ecff")
  const [roleIcon, setRoleIcon] = useState("person-outline");
  const [role, setRole] = useState("Student");
  const [roleText, setRoleText] = useState("Join quizzes, compete with friends, and level up your knowledge!");

  const { gradientUp, setGradientUp, gradientDown, setGradientDown, changeTheme, roleSelected } = useContext(ThemeContext);


  const navigation = useNavigation();

  function handleSubmit() {

    const userData = {
      name: name,
      username: username,
      email: email,
      password: password,
      institution: institution,
    };

    console.log("UserData being sent:", userData);


    axios.post(api + "/api/auth/register-" + role, userData).then(res => console.log(res.data), navigation.navigate("Login"), Alert.alert("User Created")).catch(e => console.log(e));
  }

  useEffect(() => {

    const checkRole = async () => {

      if (roleSelected === "Student") {
        setRoleIcon("person-outline");
        setRoleBg("#2da0ecff");
        setRole("Student");
      }

      if (roleSelected === "Teacher") {
        setRoleIcon("school-outline");
        setRoleBg("#2ccd17ff");
        setRole("Teacher")
      }

      if (roleSelected === "Admin") {
        setRoleIcon("shield-outline");
        setRoleBg("#cb2222ff");
        setRole("Admin")
      }
    };
    checkRole();
  }, [])


  return (

    <LinearGradient
      colors={[gradientUp, gradientDown]} // teal-blue → purple
      start={{ x: 0, y: 0 }}           // top
      end={{ x: 0, y: 1 }}             // bottom
      style={{ flex: 1 }}
    >

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>

      <View style={styles.container}>
        <Text style={[styles.Title, { marginTop: hp('6%') }]}>QuizCraft</Text>
        <Text style={styles.MiniTitle}>Enter Your Details To Register</Text>
        <View style={[styles.FormContainer, { paddingTop: hp('0%') }]}>


          <View style={[styles.RoleBG, { backgroundColor: roleBg }]}>
            <Ionicons name={roleIcon} size={wp('8.35%')} color="white" style={styles.roleSelectIcon} />
            <Text style={[styles.RoleText, { fontSize: hp('3%') }]}>{role} Portal</Text>
          </View>

          <TextInput
            style={styles.AuthInput}
            placeholder='Name' placeholderTextColor='#616161ff'
            value={name}
            onChangeText={(value) => setName(value)} />


          <TextInput
            style={styles.AuthInput}
            placeholder='Username' placeholderTextColor='#616161ff'
            value={username}
            onChangeText={(value) => setUsername(value)} />

          <TextInput
            style={styles.AuthInput}
            placeholder='Email' placeholderTextColor='#616161ff'
            value={email}
            onChangeText={(value) => setEmail(value)} />


          <TextInput
            style={styles.AuthInput}
            placeholder='Password' placeholderTextColor='#616161ff'
            secureTextEntry={true}
            value={password}
            onChangeText={(value) => setPassword(value)} />

          <TextInput
            style={styles.AuthInput}
            placeholder='Institution' placeholderTextColor='#616161ff'
            value={institution}
            onChangeText={(value) => setInstitutuion(value)} />


          <TouchableOpacity style={styles.Button} onPress={handleSubmit}>
            <Text style={{ fontSize: hp('2.1%'), fontWeight: 500 }}>Register</Text>
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


        <TouchableOpacity style={{}} onPress={() => navigation.push('Login')}>
          <Text style={{ alignSelf: 'center', color: 'white', fontSize: hp('1.8%'), fontWeight: '500' }}>Already Have an Account ?</Text>
        </TouchableOpacity>

      </View>
      </ScrollView>
    </LinearGradient>

  )
}