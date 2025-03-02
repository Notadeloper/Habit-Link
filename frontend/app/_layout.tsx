import { Stack } from "expo-router";

import "./globals.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { SplashScreen } from "expo-router";

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
    
    return <Stack screenOptions={{ headerShown: false }}/>;
}
