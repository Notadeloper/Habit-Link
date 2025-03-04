import CustomButton from '@/components/CustomButton';
import InputField from '@/components/InputField';
import { Link } from 'expo-router';
import React, { useState } from 'react'
import { API_BASE_URL } from './_env';
import { ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios';
import Toast from 'react-native-toast-message';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        username,
        email,
        fullName,
        password,
      })
      console.log("Signup successful:", response.data);
      Toast.show({
        type: 'success',
        text1: 'Signup Successful',
      });
    } catch(error) {
      if (axios.isAxiosError(error)) {
        console.log("Error in signup call", error.message);
        const backendMessage = error.response?.data?.error || error.message;
        Toast.show({
          type: 'error',
          text1: 'Signup Error',
          text2: backendMessage
        });
      } else {
        console.log("Unexpected error in signup call", error);
        Toast.show({
          type: 'error',
          text1: 'Signup Error',
          text2: 'An unexpected error occurred.',
        });
      }     
    }
  }


  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerClassName="h-full">
        <View className="px-10">
          <Text className="text-base text-center uppercase front-rubik text-black-300">
                        Welcome to Habit Link
          </Text>
          <InputField
            label="Username"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <InputField
            label="Full Name"
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
          <InputField
            label="Email"
            placeholder="Email"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
          />
          <InputField
            label="Password"
            placeholder="Password"
            secureTextEntry={true}
            textContentType="password"
            value={password}
            onChangeText={setPassword}
          />
          <CustomButton className="mt-6" title="Sign Up" onPress={handleSignUp} size="large"/>

          <View className="mt-6">
            <Text className="text-center">Already have an account?</Text>
            <Link href="/sign-in">
              <CustomButton className="mt-6" bgVariant="secondary" textVariant="secondary" title="Sign In" size="large"/>
            </Link>
            <Text className="text-2xl font-rubik-bold text-black-300 text-center mt-6">
                            Stay Motivated With Your Habits {"\n"}
              <Text className="text-4xl text-primary-300">Together.</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp