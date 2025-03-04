import React, { useState } from 'react'
import { Button, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios'
import { API_BASE_URL } from './_env';
import CustomButton from '@/components/CustomButton';
import InputField from '@/components/InputField';
import { Link } from 'expo-router';
import Toast from 'react-native-toast-message';

const SignIn = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
      
  const handleSignIn = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        usernameOrEmail,
        password
      })
      console.log("Login successful:", response.data);
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
      });
    } catch(error) {
      if (axios.isAxiosError(error)) {
        console.log("Error in login call", error.message);
        const backendMessage = error.response?.data?.error || error.message;
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: backendMessage
        });
      } else {
        console.log("Unexpected error in login call", error);
        Toast.show({
          type: 'error',
          text1: 'Login Error',
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
            label="Username or Email"
            placeholder="Username or Email"
            value={usernameOrEmail}
            onChangeText={setUsernameOrEmail}
          />
          <InputField
            label="Password"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <CustomButton className="mt-6" title="Login" onPress={handleSignIn} size="large"/>
          <View className="mt-6">
            <Text className="text-center">Don't have an account?</Text>
            <Link href="/sign-up">
              <CustomButton className="mt-6" bgVariant="secondary" size="large" title="Sign Up" />
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

export default SignIn