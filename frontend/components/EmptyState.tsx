import React from "react";
import { Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <View className="rounded-[30px] border border-primary-200 bg-white p-6">
      <Text className="font-rubik-bold text-2xl text-black-300">{title}</Text>
      <Text className="mt-3 font-rubik text-base leading-6 text-black-100">{description}</Text>
      {actionLabel && onAction ? (
        <CustomButton
          className="mt-6 self-start px-6"
          size="small"
          title={actionLabel}
          onPress={onAction}
        />
      ) : null}
    </View>
  );
};

export default EmptyState;
