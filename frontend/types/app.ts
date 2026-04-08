export type FrequencyPeriod = "day" | "week" | "month";

export type AppUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  dayStart: string;
  onboardingCompleted: boolean;
  created_at: string;
  updated_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  frequency_count: number;
  frequency_period: FrequencyPeriod;
  goalStreak?: number | null;
  created_at: string;
  updated_at: string;
  streak?: {
    current_streak: number;
    max_streak: number;
    last_updated: string;
  } | null;
};

export type CreateHabitPayload = {
  title: string;
  description?: string;
  frequency_count: number;
  frequency_period: FrequencyPeriod;
  goalStreak?: number;
};

export type PublicUser = {
  id: string;
  username: string;
  fullName: string;
};

export type GroupMembership = {
  id: string;
  user_id: string;
  group_id: string;
  role: "USER" | "ADMIN";
  joined_at: string;
  user: PublicUser;
};

export type GroupHabit = {
  id: string;
  title: string;
  frequency_count: number;
  frequency_period: FrequencyPeriod;
  goalStreak?: number | null;
  dayStart: string;
  created_at: string;
  updated_at: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string | null;
  creator_id: string;
  groupHabitId: string;
  created_at: string;
  updated_at: string;
  memberships: GroupMembership[];
  groupHabit: GroupHabit;
};

export type CreateGroupPayload = {
  name: string;
  description?: string;
  habitTitle: string;
  frequency_count: number;
  frequency_period: FrequencyPeriod;
  goalStreak?: number;
  dayStart: string;
};

export type ConversationParticipant = {
  id: string;
  conversationId: string;
  userId: string;
  lastReadAt?: string | null;
  user: PublicUser;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  media_url?: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

export type Conversation = {
  id: string;
  isGroup: boolean;
  created_at: string;
  updated_at: string;
  participants: ConversationParticipant[];
  messages: Message[];
};

export type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  sender: PublicUser;
};

export type FriendListEntry = {
  id: string;
  username: string;
};
