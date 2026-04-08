import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Conversation, CreateGroupPayload, FriendListEntry, FriendRequest, Group } from "@/types/app";

type SocialContextValue = {
  groups: Group[];
  conversations: Conversation[];
  friendRequests: FriendRequest[];
  friends: FriendListEntry[];
  isLoading: boolean;
  error: string | null;
  refreshSocial: () => Promise<void>;
  createGroup: (payload: CreateGroupPayload) => Promise<Group>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
};

const SocialContext = createContext<SocialContextValue | undefined>(undefined);

export const SocialProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSocial = async () => {
    if (!isAuthenticated || !user) {
      setGroups([]);
      setConversations([]);
      setFriendRequests([]);
      setFriends([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [groupsResponse, conversationsResponse, friendRequestsResponse, friendsResponse] = await Promise.all([
        api.get<{ groups: Group[] }>("/group"),
        api.get<{ conversations: Conversation[] }>("/conversation/dm"),
        api.get<{ friendRequests: FriendRequest[] }>("/user/friend-requests"),
        api.get<{ friendList: FriendListEntry[] }>(`/user/friends/${user.id}`),
      ]);

      setGroups(groupsResponse.data.groups ?? []);
      setConversations(conversationsResponse.data.conversations ?? []);
      setFriendRequests(friendRequestsResponse.data.friendRequests ?? []);
      setFriends(friendsResponse.data.friendList ?? []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error ?? error.message);
      } else {
        setError("Something went wrong while loading your social spaces.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshSocial();
  }, [isAuthenticated, user?.id]);

  const createGroup = async (payload: CreateGroupPayload) => {
    try {
      const response = await api.post<{ group: Group }>("/group", payload);
      await refreshSocial();
      return response.data.group;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error ?? error.message);
      }

      throw error;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await api.put(`/user/friend-requests/${requestId}/accept`);
      await refreshSocial();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error ?? error.message);
      }

      throw error;
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      await api.delete(`/user/friend-requests/${requestId}`);
      await refreshSocial();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error ?? error.message);
      }

      throw error;
    }
  };

  const value = useMemo(
    () => ({
      groups,
      conversations,
      friendRequests,
      friends,
      isLoading,
      error,
      refreshSocial,
      createGroup,
      acceptFriendRequest,
      rejectFriendRequest,
    }),
    [conversations, error, friendRequests, friends, groups, isLoading],
  );

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
};

export const useSocial = () => {
  const context = useContext(SocialContext);

  if (!context) {
    throw new Error("useSocial must be used within a SocialProvider");
  }

  return context;
};
