import React, { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { palette } from "@/constants/theme";

type ScreenContainerProps = PropsWithChildren<{
  scrollable?: boolean;
  contentClassName?: string;
}>;

const ScreenContainer = ({
  children,
  scrollable = true,
  contentClassName = "",
}: ScreenContainerProps) => {
  if (!scrollable) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        <View className={`flex-1 px-5 pt-4 ${contentClassName}`}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1"
      >
        <View className={`px-5 pt-4 ${contentClassName}`}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScreenContainer;
