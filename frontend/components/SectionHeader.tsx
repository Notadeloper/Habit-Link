import React from "react";
import { Text, View } from "react-native";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

const SectionHeader = ({ eyebrow, title, subtitle }: SectionHeaderProps) => (
  <View className="mb-4">
    {eyebrow ? (
      <Text className="font-rubik text-xs uppercase tracking-[2px] text-primary-600">
        {eyebrow}
      </Text>
    ) : null}
    <Text className="mt-1 font-rubik-bold text-3xl text-black-300">{title}</Text>
    {subtitle ? (
      <Text className="mt-2 font-rubik text-base leading-6 text-black-100">
        {subtitle}
      </Text>
    ) : null}
  </View>
);

export default SectionHeader;
