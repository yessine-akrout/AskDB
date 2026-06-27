'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

type SqlResponse = {
  question?: string;
  sql?: string;
  result?: {
    columns?: string[];
    rows?: (string | number | null)[][];
    row_count?: number;
  };
  row_count?: number;
  status?: string;
  error?: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responseData?: SqlResponse | null;
  outputCode?: string;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

type ChatContextType = {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  activeConversationId: string | null;
  setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  handleNewChat: () => void;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const storageKey = user?.email
    ? `text_to_sql_conversations_${user.email}`
    : null;

  useEffect(() => {
    if (!storageKey) {
      setConversations([]);
      setActiveConversationId(null);
      return;
    }

    const savedConversations = localStorage.getItem(storageKey);

    if (savedConversations) {
      try {
        const parsed: Conversation[] = JSON.parse(savedConversations);
        setConversations(parsed);

        if (parsed.length > 0) {
          setActiveConversationId(parsed[0].id);
        } else {
          setActiveConversationId(null);
        }
      } catch (error) {
        console.error('Failed to parse saved conversations:', error);
        setConversations([]);
        setActiveConversationId(null);
      }
    } else {
      setConversations([]);
      setActiveConversationId(null);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(conversations));
  }, [conversations, storageKey]);

  const handleNewChat = () => {
    const now = new Date().toLocaleString();

    const newConversation: Conversation = {
      id: createId(),
      title: 'New conversation',
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setSearchQuery('');
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const value = useMemo(
    () => ({
      conversations,
      filteredConversations,
      searchQuery,
      setSearchQuery,
      activeConversationId,
      setActiveConversationId,
      handleNewChat,
      setConversations,
    }),
    [conversations, filteredConversations, searchQuery, activeConversationId],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChatContext must be used inside ChatProvider');
  }

  return context;
}