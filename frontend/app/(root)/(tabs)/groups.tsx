import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";

import CustomButton from "@/components/CustomButton";
import EmptyState from "@/components/EmptyState";
import InputField from "@/components/InputField";
import ScreenContainer from "@/components/ScreenContainer";
import SectionHeader from "@/components/SectionHeader";
import { useAuth } from "@/providers/AuthProvider";
import { useSocial } from "@/providers/SocialProvider";
import { FrequencyPeriod } from "@/types/app";

const frequencyPeriods: FrequencyPeriod[] = ["day", "week", "month"];

export default function GroupsScreen() {
  const { user } = useAuth();
  const {
    groups,
    conversations,
    friendRequests,
    isLoading,
    error,
    refreshSocial,
    createGroup,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useSocial();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestActionId, setRequestActionId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [habitTitle, setHabitTitle] = useState("");
  const [frequencyCount, setFrequencyCount] = useState("1");
  const [goalStreak, setGoalStreak] = useState("");
  const [frequencyPeriod, setFrequencyPeriod] = useState<FrequencyPeriod>("day");

  const recentConversations = useMemo(() => conversations.slice(0, 3), [conversations]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setHabitTitle("");
    setFrequencyCount("1");
    setGoalStreak("");
    setFrequencyPeriod("day");
  };

  const handleCreateGroup = async () => {
    if (!name.trim() || !habitTitle.trim()) {
      Toast.show({
        type: "error",
        text1: "Add a group name and challenge",
      });
      return;
    }

    const parsedFrequencyCount = Number(frequencyCount);
    const parsedGoalStreak = goalStreak.trim() ? Number(goalStreak) : undefined;

    if (!Number.isFinite(parsedFrequencyCount) || parsedFrequencyCount < 1) {
      Toast.show({
        type: "error",
        text1: "Set a frequency of at least 1",
      });
      return;
    }

    if (
      parsedGoalStreak !== undefined &&
      (!Number.isFinite(parsedGoalStreak) || parsedGoalStreak < 1)
    ) {
      Toast.show({
        type: "error",
        text1: "Goal streak must be at least 1",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        habitTitle: habitTitle.trim(),
        frequency_count: parsedFrequencyCount,
        frequency_period: frequencyPeriod,
        goalStreak: parsedGoalStreak,
        dayStart: user?.dayStart ?? "00:00",
      });

      Toast.show({
        type: "success",
        text1: "Group created",
      });
      resetForm();
      setShowCreateForm(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Could not create group",
        text2: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFriendRequest = async (requestId: string, action: "accept" | "reject") => {
    setRequestActionId(requestId);

    try {
      if (action === "accept") {
        await acceptFriendRequest(requestId);
        Toast.show({
          type: "success",
          text1: "Friend request accepted",
        });
      } else {
        await rejectFriendRequest(requestId);
        Toast.show({
          type: "success",
          text1: "Friend request dismissed",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setRequestActionId(null);
    }
  };

  return (
    <ScreenContainer>
      <SectionHeader
        eyebrow="Together"
        title="Build momentum with other people."
        subtitle="Create a shared challenge, keep tabs on your circles, and stay connected."
      />

      <View className="rounded-[30px] bg-primary-700 p-5">
        <Text className="font-rubik text-sm uppercase tracking-[2px] text-primary-100">
          Your social spaces
        </Text>
        <Text className="mt-3 font-rubik-bold text-3xl leading-10 text-white">
          {groups.length} groups, {friendRequests.length} requests, {conversations.length} chats
        </Text>
        <CustomButton
          className="mt-5 self-start px-6"
          size="small"
          title={showCreateForm ? "Close form" : "Start a group"}
          onPress={() => setShowCreateForm((currentValue) => !currentValue)}
        />
      </View>

      {showCreateForm ? (
        <View className="mt-5 rounded-[30px] border border-primary-200 bg-white p-5">
          <Text className="font-rubik-bold text-2xl text-black-300">Create a group</Text>
          <InputField
            label="Group name"
            placeholder="Early Birds"
            value={name}
            onChangeText={setName}
          />
          <InputField
            label="Description"
            placeholder="What are you all working on?"
            value={description}
            onChangeText={setDescription}
          />
          <InputField
            label="Challenge habit"
            placeholder="Morning walk"
            value={habitTitle}
            onChangeText={setHabitTitle}
          />
          <InputField
            label="How often"
            placeholder="1"
            value={frequencyCount}
            onChangeText={setFrequencyCount}
            keyboardType="number-pad"
          />

          <View className="mt-3">
            <Text className="mb-3 font-rubik text-base text-black-300">Repeat by</Text>
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
            placeholder="Optional"
            value={goalStreak}
            onChangeText={setGoalStreak}
            keyboardType="number-pad"
          />

          <CustomButton
            className="mt-6"
            title={isSubmitting ? "Creating..." : "Create group"}
            onPress={handleCreateGroup}
            size="large"
            disabled={isSubmitting}
          />
        </View>
      ) : null}

      {error ? (
        <View className="mt-5 rounded-[28px] border border-danger bg-white p-5">
          <Text className="font-rubik-bold text-xl text-black-300">Could not load this tab</Text>
          <Text className="mt-2 font-rubik text-base text-black-100">{error}</Text>
          <CustomButton
            className="mt-5 self-start px-6"
            size="small"
            title="Try again"
            onPress={refreshSocial}
          />
        </View>
      ) : null}

      {!error && !isLoading && groups.length === 0 ? (
        <View className="mt-5">
          <EmptyState
            title="No groups yet"
            description="Start a shared challenge when you want a little extra accountability."
            actionLabel="Create a group"
            onAction={() => setShowCreateForm(true)}
          />
        </View>
      ) : null}

      {groups.length > 0 ? (
        <View className="mt-8">
          <Text className="font-rubik-bold text-2xl text-black-300">Your groups</Text>
          {groups.map((group) => (
            <View
              key={group.id}
              className="mt-4 rounded-[30px] border border-primary-200 bg-white p-5"
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-rubik-bold text-2xl text-black-300">{group.name}</Text>
                <View className="rounded-full bg-primary-100 px-3 py-2">
                  <Text className="font-rubik text-xs text-primary-700">
                    {group.memberships.length} members
                  </Text>
                </View>
              </View>
              <Text className="mt-2 font-rubik text-base text-black-100">
                {group.description?.trim() || "A shared habit space."}
              </Text>
              <View className="mt-5 rounded-[22px] bg-[#f7faf6] p-4">
                <Text className="font-rubik text-sm text-black-100">Current challenge</Text>
                <Text className="mt-1 font-rubik-bold text-lg text-black-300">
                  {group.groupHabit.title}
                </Text>
                <Text className="mt-2 font-rubik text-sm text-black-100">
                  {group.groupHabit.frequency_count} times per {group.groupHabit.frequency_period}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View className="mt-8">
        <Text className="font-rubik-bold text-2xl text-black-300">Friend requests</Text>
        {friendRequests.length === 0 ? (
          <View className="mt-4 rounded-[26px] bg-white p-4">
            <Text className="font-rubik text-base text-black-100">You're all caught up.</Text>
          </View>
        ) : (
          friendRequests.map((request) => (
            <View
              key={request.id}
              className="mt-4 rounded-[26px] border border-primary-200 bg-white p-4"
            >
              <Text className="font-rubik-bold text-lg text-black-300">
                {request.sender.fullName || request.sender.username}
              </Text>
              <Text className="mt-1 font-rubik text-sm text-black-100">
                @{request.sender.username} wants to connect.
              </Text>
              <View className="mt-4 flex-row gap-3">
                <CustomButton
                  className="flex-1"
                  size="small"
                  title={requestActionId === request.id ? "Working..." : "Accept"}
                  onPress={() => handleFriendRequest(request.id, "accept")}
                  disabled={requestActionId === request.id}
                />
                <CustomButton
                  className="flex-1"
                  size="small"
                  title="Dismiss"
                  bgVariant="outline"
                  textVariant="primary"
                  onPress={() => handleFriendRequest(request.id, "reject")}
                  disabled={requestActionId === request.id}
                />
              </View>
            </View>
          ))
        )}
      </View>

      <View className="mt-8">
        <Text className="font-rubik-bold text-2xl text-black-300">Recent chats</Text>
        {recentConversations.length === 0 ? (
          <View className="mt-4 rounded-[26px] bg-white p-4">
            <Text className="font-rubik text-base text-black-100">No conversations yet.</Text>
          </View>
        ) : (
          recentConversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(
              (participant) => participant.userId !== user?.id,
            );
            const latestMessage = conversation.messages[0];

            return (
              <View
                key={conversation.id}
                className="mt-4 rounded-[26px] border border-primary-200 bg-white p-4"
              >
                <Text className="font-rubik-bold text-lg text-black-300">
                  {otherParticipant?.user.fullName ||
                    otherParticipant?.user.username ||
                    "Direct message"}
                </Text>
                <Text className="mt-1 font-rubik text-sm text-black-100">
                  {latestMessage?.content || "No messages yet."}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScreenContainer>
  );
}
