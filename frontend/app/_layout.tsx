import { Stack } from "expo-router";

import "./globals.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { SplashScreen } from "expo-router";
import Toast from "react-native-toast-message";

import { AuthProvider } from "@/providers/AuthProvider";
import { HabitsProvider } from "@/providers/HabitsProvider";
import { SocialProvider } from "@/providers/SocialProvider";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
    
  return (
    <AuthProvider>
      <HabitsProvider>
        <SocialProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />
        </SocialProvider>
      </HabitsProvider>
    </AuthProvider>
  );
}
