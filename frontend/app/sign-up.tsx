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

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    setIsSubmitting(true);

    try {
      await signUp({
        username,
        email,
        fullName,
        password,
      });
      Toast.show({
        type: "success",
        text1: "Signup Successful",
      });
      router.replace("/(root)/(tabs)");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Error in signup call", error.message);
        const backendMessage = error.response?.data?.error || error.message;
        Toast.show({
          type: "error",
          text1: "Signup Error",
          text2: backendMessage,
        });
      } else {
        console.log("Unexpected error in signup call", error);
        Toast.show({
          type: "error",
          text1: "Signup Error",
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
          <View className="rounded-[36px] bg-accent-100 p-6">
            <Text className="font-rubik text-sm uppercase tracking-[2px] text-primary-700">
              New to Habit Link
            </Text>
            <Text className="mt-4 font-rubik-bold text-4xl leading-[48px] text-black-300">
              Create your planner and grow into your routine.
            </Text>
            <Text className="mt-3 font-rubik text-base leading-6 text-black-100">
              Start solo, then bring others into shared habits and group streaks when you are ready.
            </Text>
          </View>

          <View className="mt-6 rounded-[32px] bg-white p-6">
            <Text className="font-rubik-bold text-2xl text-black-300">Create account</Text>
            <InputField
              label="Username"
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
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
              autoCapitalize="none"
            />
            <InputField
              label="Password"
              placeholder="Password"
              secureTextEntry
              textContentType="password"
              value={password}
              onChangeText={setPassword}
            />
            <CustomButton
              className="mt-6"
              title={isSubmitting ? "Creating account..." : "Sign Up"}
              onPress={handleSignUp}
              size="large"
              disabled={isSubmitting}
            />

            <View className="mt-6">
              <Text className="text-center font-rubik text-base text-black-100">
                Already have an account?
              </Text>
              <Link href="/sign-in" asChild>
                <CustomButton
                  className="mt-4"
                  bgVariant="outline"
                  textVariant="primary"
                  title="Sign In"
                  size="large"
                />
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
