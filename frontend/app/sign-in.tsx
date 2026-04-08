import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Link, router } from "expo-router";
import Toast from "react-native-toast-message";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { palette } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";

const SignIn = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    setIsSubmitting(true);

    try {
      await signIn(usernameOrEmail, password);
      Toast.show({
        type: "success",
        text1: "Login Successful",
      });
      router.replace("/(root)/(tabs)");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Error in login call", error.message);
        const backendMessage = error.response?.data?.error || error.message;
        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: backendMessage,
        });
      } else {
        console.log("Unexpected error in login call", error);
        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: "An unexpected error occurred.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="h-full" style={{ backgroundColor: palette.background }}>
      <ScrollView contentContainerClassName="h-full">
        <View className="flex-1 justify-center px-6 py-10">
          <View className="rounded-[36px] bg-primary-700 p-6">
            <Text className="font-rubik text-sm uppercase tracking-[2px] text-primary-100">
              Habit Link
            </Text>
            <Text className="mt-4 font-rubik-bold text-4xl leading-[48px] text-white">
              Plan your habits in a calmer, greener space.
            </Text>
            <Text className="mt-3 font-rubik text-base leading-6 text-primary-100">
              Sign in to track streaks, join group challenges, and keep your momentum visible.
            </Text>
          </View>

          <View className="mt-6 rounded-[32px] bg-white p-6">
            <Text className="font-rubik-bold text-2xl text-black-300">Welcome back</Text>
            <Text className="mt-2 font-rubik text-base text-black-100">
              Use your username or email to continue.
            </Text>

            <InputField
              label="Username or Email"
              placeholder="Username or Email"
              value={usernameOrEmail}
              onChangeText={setUsernameOrEmail}
              autoCapitalize="none"
            />
            <InputField
              label="Password"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <CustomButton
              className="mt-6"
              title={isSubmitting ? "Logging in..." : "Login"}
              onPress={handleSignIn}
              size="large"
              disabled={isSubmitting}
            />

            <View className="mt-6">
              <Text className="text-center font-rubik text-base text-black-100">
                Don&apos;t have an account yet?
              </Text>
              <Link href="/sign-up" asChild>
                <CustomButton
                  className="mt-4"
                  bgVariant="secondary"
                  textVariant="secondary"
                  size="large"
                  title="Create an account"
                />
              </Link>
            </View>
          </View>

          <Text className="mt-6 text-center font-rubik text-sm leading-6 text-black-100">
            Start with habits, build into streaks, then bring friends in through groups and chat.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
