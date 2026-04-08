import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import ScreenContainer from "@/components/ScreenContainer";
import SectionHeader from "@/components/SectionHeader";
import { useAuth } from "@/providers/AuthProvider";
import { useHabits } from "@/providers/HabitsProvider";
import { useSocial } from "@/providers/SocialProvider";

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const { habits } = useHabits();
  const { friends, friendRequests, groups } = useSocial();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dayStart, setDayStart] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const bestStreak = habits.reduce((highest, habit) => {
    return Math.max(highest, habit.streak?.max_streak ?? 0);
  }, 0);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setUsername(user?.username ?? "");
    setEmail(user?.email ?? "");
    setDayStart(user?.dayStart ?? "00:00");
  }, [user]);

  const handleLogout = async () => {
    await logout();
    Toast.show({
      type: "success",
      text1: "Logged out",
    });
    router.replace("/sign-in");
  };

  const handleSaveProfile = async () => {
    if (!dayStart.match(/^\d{2}:\d{2}$/)) {
      Toast.show({
        type: "error",
        text1: "Use HH:MM for day start",
      });
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        dayStart: dayStart.trim(),
        currentPassword: currentPassword.trim() || undefined,
        newPassword: newPassword.trim() || undefined,
      });

      Toast.show({
        type: "success",
        text1: "Profile updated",
      });
      setCurrentPassword("");
      setNewPassword("");
      setIsEditing(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Could not save changes",
        text2: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <SectionHeader
        eyebrow="Profile"
        title="Keep the planner tuned to your pace."
        subtitle="Manage your details, shape your day, and keep your account feeling personal."
      />

      <View className="rounded-[32px] bg-primary-700 p-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15">
          <Ionicons name="person-outline" size={30} color="#ffffff" />
        </View>
        <Text className="mt-4 font-rubik-bold text-3xl text-white">
          {user?.fullName ?? "Habit Link user"}
        </Text>
        <Text className="mt-2 font-rubik text-base text-primary-100">
          {user?.email ?? "Signed in"}
        </Text>

        <View className="mt-5 flex-row justify-between rounded-[24px] bg-white/10 p-4">
          <View>
            <Text className="font-rubik text-xs uppercase tracking-[2px] text-primary-100">
              Active habits
            </Text>
            <Text className="mt-2 font-rubik-bold text-2xl text-white">{habits.length}</Text>
          </View>
          <View>
            <Text className="font-rubik text-xs uppercase tracking-[2px] text-primary-100">
              Friends
            </Text>
            <Text className="mt-2 font-rubik-bold text-2xl text-white">{friends.length}</Text>
          </View>
          <View>
            <Text className="font-rubik text-xs uppercase tracking-[2px] text-primary-100">
              Best streak
            </Text>
            <Text className="mt-2 font-rubik-bold text-2xl text-white">{bestStreak}</Text>
          </View>
        </View>
      </View>

      <View className="mt-8 flex-row gap-3">
        <View className="flex-1 rounded-[26px] bg-white p-4">
          <Text className="font-rubik text-sm text-black-100">Groups</Text>
          <Text className="mt-2 font-rubik-bold text-3xl text-black-300">{groups.length}</Text>
        </View>
        <View className="flex-1 rounded-[26px] border border-primary-200 bg-white p-4">
          <Text className="font-rubik text-sm text-black-100">Requests</Text>
          <Text className="mt-2 font-rubik-bold text-3xl text-primary-700">
            {friendRequests.length}
          </Text>
        </View>
      </View>

      <View className="mt-8 rounded-[30px] bg-white p-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-rubik-bold text-2xl text-black-300">Your details</Text>
          <CustomButton
            className="px-6"
            size="small"
            title={isEditing ? "Close" : "Edit"}
            bgVariant="outline"
            textVariant="primary"
            onPress={() => setIsEditing((currentValue) => !currentValue)}
          />
        </View>

        <View className="mt-5 rounded-[22px] bg-[#f7faf6] p-4">
          <Text className="font-rubik text-sm text-black-100">Username</Text>
          <Text className="mt-1 font-rubik-bold text-base text-black-300">
            @{user?.username ?? "-"}
          </Text>
          <Text className="mt-4 font-rubik text-sm text-black-100">Day starts at</Text>
          <Text className="mt-1 font-rubik-bold text-base text-black-300">
            {user?.dayStart ?? "00:00"}
          </Text>
        </View>

        {isEditing ? (
          <View className="mt-5">
            <InputField label="Full name" value={fullName} onChangeText={setFullName} />
            <InputField label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <InputField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <InputField
              label="Day start"
              placeholder="06:00"
              value={dayStart}
              onChangeText={setDayStart}
            />
            <InputField
              label="Current password"
              placeholder="Only if changing password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <InputField
              label="New password"
              placeholder="Leave blank to keep current password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <CustomButton
              className="mt-6"
              title={isSaving ? "Saving..." : "Save changes"}
              onPress={handleSaveProfile}
              size="large"
              disabled={isSaving}
            />
          </View>
        ) : null}
      </View>

      <CustomButton className="mt-8" title="Log Out" onPress={handleLogout} size="large" />
    </ScreenContainer>
  );
};

export default Profile;
