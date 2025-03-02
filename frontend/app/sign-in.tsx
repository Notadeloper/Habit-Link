import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SignIn = () => {
    return (
        <SafeAreaView className="bg-white h-full">
            <ScrollView contentContainerClassName="h-full">
                <View className="px-10">
                    <Text className="text-base text-center uppercase front-rubik text-black-200">
                        Welcome to Habit Link
                    </Text>
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