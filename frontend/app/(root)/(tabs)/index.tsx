import React from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";

import CustomButton from "@/components/CustomButton";
import EmptyState from "@/components/EmptyState";
import ScreenContainer from "@/components/ScreenContainer";
import SectionHeader from "@/components/SectionHeader";
import { palette, shadow } from "@/constants/theme";
import { useHabits } from "@/providers/HabitsProvider";
import { useSocial } from "@/providers/SocialProvider";

export default function Index() {
  const { habits, isLoading, error, refreshHabits } = useHabits();
  const { groups, friendRequests, friends } = useSocial();

  const activeHabits = habits.length;
  const bestStreak = habits.reduce((highest, habit) => {
    return Math.max(highest, habit.streak?.max_streak ?? 0);
  }, 0);
  const currentStreaks = habits.filter((habit) => (habit.streak?.current_streak ?? 0) > 0).length;

  return (
    <ScreenContainer>
      <SectionHeader
        eyebrow="Habit Link"
        title="Your planner, with a little momentum."
        subtitle="A simple place to keep your routines, your progress, and your people in view."
      />

      <View
        className="rounded-[32px] p-5"
        style={{ backgroundColor: palette.primaryDark, ...shadow }}
      >
        <Text className="font-rubik text-sm uppercase tracking-[2px] text-primary-100">
          Today at a glance
        </Text>
        <Text className="mt-3 font-rubik-bold text-3xl leading-10 text-white">
          {isLoading ? "Loading your planner..." : `${activeHabits} active habits`}
        </Text>
        <Text className="mt-2 font-rubik text-base leading-6 text-primary-100">
          {error
            ? "We could not load your summary right now."
            : activeHabits === 0
              ? "Start with one habit and build from there."
              : `${currentStreaks} of your habits are on an active run.`}
        </Text>
      </View>

      {error ? (
        <View className="mt-5 rounded-[28px] border border-danger bg-white p-5">
          <Text className="font-rubik-bold text-xl text-black-300">Dashboard unavailable</Text>
          <Text className="mt-2 font-rubik text-base text-black-100">{error}</Text>
          <CustomButton className="mt-5 self-start px-6" size="small" title="Try again" onPress={refreshHabits} />
        </View>
      ) : null}

      {!error ? (
        <View className="mt-6 flex-row gap-3">
          <View className="flex-1 rounded-[28px] border border-primary-200 bg-white p-4">
            <Text className="font-rubik text-sm text-black-100">Best streak</Text>
            <Text className="mt-3 font-rubik-bold text-4xl text-primary-700">{bestStreak}</Text>
          </View>
          <View className="flex-1 rounded-[28px] bg-accent-100 p-4">
            <Text className="font-rubik text-sm text-black-100">Joined groups</Text>
            <Text className="mt-3 font-rubik-bold text-4xl text-black-300">{groups.length}</Text>
          </View>
        </View>
      ) : null}

      {!error ? (
        <View className="mt-6 flex-row gap-3">
          <View className="flex-1 rounded-[28px] bg-white p-4">
            <Text className="font-rubik text-sm text-black-100">Friends</Text>
            <Text className="mt-3 font-rubik-bold text-4xl text-black-300">{friends.length}</Text>
          </View>
          <View className="flex-1 rounded-[28px] border border-primary-200 bg-white p-4">
            <Text className="font-rubik text-sm text-black-100">Open requests</Text>
            <Text className="mt-3 font-rubik-bold text-4xl text-primary-700">
              {friendRequests.length}
            </Text>
          </View>
        </View>
      ) : null}

      {!isLoading && !error && activeHabits === 0 ? (
        <View className="mt-8">
          <EmptyState
            title="Nothing planned yet"
            description="Create your first habit to start seeing your progress here."
            actionLabel="Go to habits"
            onAction={() => router.push("/habits")}
          />
        </View>
      ) : null}

      {!isLoading && !error && activeHabits > 0 ? (
        <View className="mt-8">
          <Text className="font-rubik-bold text-2xl text-black-300">Your routines</Text>
          {habits.slice(0, 3).map((habit) => (
            <View
              key={habit.id}
              className="mt-4 rounded-[28px] border border-primary-200 bg-white p-4"
              style={shadow}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="font-rubik-bold text-xl text-black-300">{habit.title}</Text>
                  <Text className="mt-2 font-rubik text-sm leading-5 text-black-100">
                    {habit.description?.trim() || "No description yet."}
                  </Text>
                </View>
                <View className="rounded-full bg-primary-100 px-3 py-2">
                  <Text className="font-rubik text-xs text-black-300">
                    {habit.frequency_count} / {habit.frequency_period}
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row justify-between">
                <Text className="font-rubik text-sm text-black-100">
                  Current streak: {habit.streak?.current_streak ?? 0}
                </Text>
                <Text className="font-rubik text-sm text-black-100">
                  Max streak: {habit.streak?.max_streak ?? 0}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </ScreenContainer>
  );
}
