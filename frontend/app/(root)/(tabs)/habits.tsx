import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";

import CustomButton from "@/components/CustomButton";
import EmptyState from "@/components/EmptyState";
import InputField from "@/components/InputField";
import ScreenContainer from "@/components/ScreenContainer";
import SectionHeader from "@/components/SectionHeader";
import { useHabits } from "@/providers/HabitsProvider";
import { FrequencyPeriod } from "@/types/app";

const frequencyPeriods: FrequencyPeriod[] = ["day", "week", "month"];

export default function HabitsScreen() {
  const { habits, isLoading, error, refreshHabits, createHabit } = useHabits();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequencyCount, setFrequencyCount] = useState("1");
  const [goalStreak, setGoalStreak] = useState("");
  const [frequencyPeriod, setFrequencyPeriod] = useState<FrequencyPeriod>("day");

  const sortedHabits = useMemo(() => {
    return [...habits].sort(
      (firstHabit, secondHabit) =>
        new Date(secondHabit.updated_at).getTime() - new Date(firstHabit.updated_at).getTime(),
    );
  }, [habits]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFrequencyCount("1");
    setGoalStreak("");
    setFrequencyPeriod("day");
  };

  const handleCreateHabit = async () => {
    if (!title.trim()) {
      Toast.show({
        type: "error",
        text1: "Habit title required",
      });
      return;
    }

    const parsedFrequencyCount = Number(frequencyCount);
    const parsedGoalStreak = goalStreak.trim() ? Number(goalStreak) : undefined;

    if (!Number.isFinite(parsedFrequencyCount) || parsedFrequencyCount < 1) {
      Toast.show({
        type: "error",
        text1: "Frequency count must be 1 or more",
      });
      return;
    }

    if (parsedGoalStreak !== undefined && (!Number.isFinite(parsedGoalStreak) || parsedGoalStreak < 1)) {
      Toast.show({
        type: "error",
        text1: "Goal streak must be 1 or more",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        frequency_count: parsedFrequencyCount,
        frequency_period: frequencyPeriod,
        goalStreak: parsedGoalStreak,
      });

      Toast.show({
        type: "success",
        text1: "Habit created",
      });
      resetForm();
      setShowCreateForm(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create habit right now.";

      Toast.show({
        type: "error",
        text1: "Create habit failed",
        text2: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <SectionHeader
        eyebrow="Planner"
        title="Build routines you can actually keep."
        subtitle="Start small, stay consistent, and keep the habits that matter close at hand."
      />

      <View className="rounded-[30px] bg-primary-100 p-5">
        <Text className="font-rubik text-sm text-primary-700">Create from here</Text>
        <Text className="mt-2 font-rubik-bold text-2xl leading-8 text-black-300">
          Add a routine that fits your day.
        </Text>
        <CustomButton
          className="mt-5 self-start px-6"
          size="small"
          title={showCreateForm ? "Close form" : "Create habit"}
          onPress={() => setShowCreateForm((currentValue) => !currentValue)}
        />
      </View>

      {showCreateForm ? (
        <View className="mt-5 rounded-[30px] border border-primary-200 bg-white p-5">
          <Text className="font-rubik-bold text-2xl text-black-300">New habit</Text>
          <InputField label="Title" placeholder="Read 20 pages" value={title} onChangeText={setTitle} />
          <InputField
            label="Description"
            placeholder="Optional description"
            value={description}
            onChangeText={setDescription}
          />
          <InputField
            label="Frequency count"
            placeholder="1"
            value={frequencyCount}
            onChangeText={setFrequencyCount}
            keyboardType="number-pad"
          />

          <View className="mt-3">
            <Text className="mb-3 font-rubik text-base text-black-300">Frequency period</Text>
            <View className="flex-row gap-3">
              {frequencyPeriods.map((period) => (
                <CustomButton
                  key={period}
                  className="flex-1"
                  size="small"
                  title={period}
                  bgVariant={frequencyPeriod === period ? "primary" : "outline"}
                  textVariant={frequencyPeriod === period ? "default" : "primary"}
                  onPress={() => setFrequencyPeriod(period)}
                />
              ))}
            </View>
          </View>

          <InputField
            label="Goal streak"
            placeholder="Optional goal"
            value={goalStreak}
            onChangeText={setGoalStreak}
            keyboardType="number-pad"
          />

          <CustomButton
            className="mt-6"
            title={isSubmitting ? "Saving..." : "Save habit"}
            onPress={handleCreateHabit}
            size="large"
            disabled={isSubmitting}
          />
        </View>
      ) : null}

      {error ? (
        <View className="mt-5 rounded-[28px] border border-danger bg-white p-5">
          <Text className="font-rubik-bold text-xl text-black-300">Could not load habits</Text>
          <Text className="mt-2 font-rubik text-base text-black-100">{error}</Text>
          <CustomButton className="mt-5 self-start px-6" size="small" title="Try again" onPress={refreshHabits} />
        </View>
      ) : null}

      {isLoading ? (
        <View className="mt-5 rounded-[28px] bg-white p-5">
          <Text className="font-rubik text-base text-black-100">Loading your habits...</Text>
        </View>
      ) : null}

      {!isLoading && !error && sortedHabits.length === 0 ? (
        <View className="mt-5">
          <EmptyState
            title="No habits yet"
            description="Create your first habit and it will show up here with its schedule and progress."
            actionLabel="Create your first habit"
            onAction={() => setShowCreateForm(true)}
          />
        </View>
      ) : null}

      {!isLoading && !error
        ? sortedHabits.map((habit) => (
          <View
            key={habit.id}
            className="mt-4 rounded-[30px] border border-primary-200 bg-white p-5"
          >
            <View className="flex-row items-center justify-between">
              <View className="rounded-full bg-primary-100 px-3 py-2">
                <Text className="font-rubik text-xs uppercase tracking-[2px] text-primary-700">
                  {habit.frequency_period}
                </Text>
              </View>
              <View className="rounded-full bg-accent-100 px-3 py-2">
                <Text className="font-rubik text-xs text-black-300">
                  {(habit.streak?.current_streak ?? 0) > 0 ? "Streak active" : "No streak yet"}
                </Text>
              </View>
            </View>

            <Text className="mt-4 font-rubik-bold text-2xl text-black-300">{habit.title}</Text>
            <Text className="mt-2 font-rubik text-base leading-6 text-black-100">
              {habit.description?.trim() || "No description yet."}
            </Text>

            <View className="mt-5 flex-row justify-between rounded-[22px] bg-[#f7faf6] p-4">
              <View>
                <Text className="font-rubik text-sm text-black-100">Cadence</Text>
                <Text className="mt-1 font-rubik-bold text-base text-black-300">
                  {habit.frequency_count} / {habit.frequency_period}
                </Text>
              </View>
              <View>
                <Text className="font-rubik text-sm text-black-100">Current streak</Text>
                <Text className="mt-1 font-rubik-bold text-base text-black-300">
                  {habit.streak?.current_streak ?? 0}
                </Text>
              </View>
              <View>
                <Text className="font-rubik text-sm text-black-100">Goal streak</Text>
                <Text className="mt-1 font-rubik-bold text-base text-black-300">
                  {habit.goalStreak ?? "-"}
                </Text>
              </View>
            </View>
          </View>
        ))
        : null}
    </ScreenContainer>
  );
}
