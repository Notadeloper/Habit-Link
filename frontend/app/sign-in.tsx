import React, { useState } from 'react'
import { Button, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios'
import Constants from 'expo-constants';

const SignIn = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                usernameOrEmail,
                password
            })
            console.log("Login successful:", response.data);
        } catch(error) {
            if (error instanceof Error) {
                console.log("Error in login call", error.message);
            } else {
                console.log("Unexpected error in login call", error);
            }     
        }
    }

    return (
        <SafeAreaView className="bg-blue h-full">
            <ScrollView contentContainerClassName="h-full">
                <View className="px-10">
                    <Text className="text-base text-center uppercase front-rubik text-black-200">
                        Welcome to Habit Link
                    </Text>
                    <TextInput
                        placeholder="Username or Email"
                        value={usernameOrEmail}
                        onChangeText={setUsernameOrEmail}
                        className="border border-gray-300 rounded p-2 my-2"
                    />
                    <TextInput
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        className="border border-gray-300 rounded p-2 my-2"
                    />
                    <Button title="Sign In" onPress={handleSignIn} />
                    <Text className="text-2xl font-rubik-bold text-black-300 text-center mt-2">
                        Stay Motivated With Your Habits {"\n"}
                        <Text className="text-4xl text-primary-300">Together.</Text>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignIn