import React, { useState } from 'react'
import { ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SignUp = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');


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
                    <Text className="text-2xl font-rubik-bold text-black-300 text-center mt-2">
                        Stay Motivated With Your Habits {"\n"}
                        <Text className="text-4xl text-primary-300">Together.</Text>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignUp