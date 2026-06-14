"use client";

import {
  Camera,
  Check,
  ChevronDown,
  CircleStop,
  Copy,
  Globe2,
  ImageIcon,
  Landmark,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Maximize2,
  Navigation,
  Pause,
  Play,
  Plus,
  ScanText,
  Send,
  Utensils,
  Volume2,
  Wrench,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import type { AuthUser } from "@/components/TravelAgentApp";
import { createClient } from "@/lib/supabase/client";

type SessionType = "problem" | "sight" | "menu" | "sign" | "driver";

type Conversation = {
  id: string;
  title: string;
  status: "active" | "resolved" | "needs_human" | "archived";
  session_type: SessionType;
  context_snapshot: Record<string, unknown>;
  turn_count: number;
  last_message_preview: string;
  updated_at: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  has_image: boolean;
  used_web_search: boolean;
  created_at: string;
  pending?: boolean;
};

type PlaceResult = {
  place: string;
  city: string;
  displayName: string;
  latitude: number;
  longitude: number;
};

const sessionOptions: Array<{
  id: SessionType;
  label: string;
  detail: string;
  icon: typeof Wrench;
  tone: string;
}> = [
  {
    id: "problem",
    label: "Fix a problem",
    detail: "Internet, payment, ticket, QR, or station trouble.",
    icon: Wrench,
    tone: "bg-[#fff0e9]",
  },
  {
    id: "sight",
    label: "At a sight",
    detail: "Location-aware stories and visual explanations.",
    icon: Landmark,
    tone: "bg-[#f1dfbd]",
  },
  {
    id: "menu",
    label: "Scan a menu",
    detail: "Dishes, spice, allergens, and an ordering card.",
    icon: Utensils,
    tone: "bg-[#dbe2d2]",
  },
  {
    id: "sign",
    label: "Scan a sign",
    detail: "Translate it, understand it, then act.",
    icon: ScanText,
    tone: "bg-[#e8e4db]",
  },
  {
    id: "driver",
    label: "Show a driver",
    detail: "Create a clear Chinese destination card.",
    icon: Navigation,
    tone: "bg-[#dce5e8]",
  },
];

const sessionCopy: Record<
  SessionType,
  { label: string; emptyTitle: string; emptyBody: string; placeholder: string }
> = {
  problem: {
    label: "Problem solving",
    emptyTitle: "What stopped working?",
    emptyBody: "Tell me what happened or add a screenshot. I will give one next action.",
    placeholder: "What happened? What did you try?",
  },
  sight: {
    label: "Location audio guide",
    emptyTitle: "Hear the place around you.",
    emptyBody: "Start the guide to identify your location. New stories are offered as you move.",
    placeholder: "Ask about what you can see...",
  },
  menu: {
    label: "Menu interpreter",
    emptyTitle: "Photograph one menu page.",
    emptyBody: "I will explain dishes, spice, likely allergens, and what fits your trip context.",
    placeholder: "Add a menu photo or ask about a dish...",
  },
  sign: {
    label: "Sign interpreter",
    emptyTitle: "Show me the sign or ticket.",
    emptyBody: "I will translate the important part, explain what it means, and tell you what to do.",
    placeholder: "Add a sign photo or ask what it means...",
  },
  driver: {
    label: "Driver card",
    emptyTitle: "Where do you need to go?",
    emptyBody: "Enter the destination, hotel, station entrance, or pickup point.",
    placeholder: "Destination or exact entrance...",
  },
};

const quickProblems = [
  "My Alipay payment was declined",
  "My eSIM stopped working",
  "I cannot find the train entrance",
];

function distanceMeters(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
) {
  const radius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLatitude = toRadians(second.latitude - first.latitude);
  const deltaLongitude = toRadians(second.longitude - first.longitude);
  const latitude1 = toRadians(first.latitude);
  const latitude2 = toRadians(second.latitude);
  const value =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(deltaLongitude / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export default function AgentChat({
  authConfigured,
  user,
  onGuide,
}: {
  authConfigured: boolean;
  user: AuthUser | null;
  onGuide: () => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(Boolean(authConfigured && user));
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [newStoryReady, setNewStoryReady] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechPaused, setSpeechPaused] = useState(false);
  const [driverCardOpen, setDriverCardOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const skipMessageLoad = useRef<string | null>(null);
  const watchId = useRef<number | null>(null);
  const lastStoryLocation = useRef<{ latitude: number; longitude: number } | null>(null);
  const currentLocation = useRef<{ latitude: number; longitude: number } | null>(null);

  const activeConversation = conversations.find((item) => item.id === activeId);
  const activeType = activeConversation?.session_type ?? null;

  useEffect(() => {
    if (!authConfigured || !user) return;
    const supabase = createClient();
    void supabase
      .from("agent_conversations")
      .select(
        "id, title, status, session_type, context_snapshot, turn_count, last_message_preview, updated_at",
      )
      .neq("status", "archived")
      .order("updated_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (loadError) {
          setError("Session history is not ready yet.");
        } else {
          const rows = (data ?? []) as Conversation[];
          setConversations(rows);
          setActiveId(
            rows.find((row) => row.status === "active")?.id ?? rows[0]?.id ?? null,
          );
        }
        setLoading(false);
      });
  }, [authConfigured, user]);

  useEffect(() => {
    if (!activeId || !authConfigured || !user) return;
    if (skipMessageLoad.current === activeId) {
      skipMessageLoad.current = null;
      return;
    }
    const supabase = createClient();
    void supabase
      .from("agent_messages")
      .select("id, role, content, has_image, used_web_search, created_at")
      .eq("conversation_id", activeId)
      .order("created_at", { ascending: true })
      .then(({ data, error: loadError }) => {
        if (loadError) setError("Could not load this session.");
        setMessages((data ?? []) as Message[]);
        setLoading(false);
      });
  }, [activeId, authConfigured, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  async function refreshConversations() {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("agent_conversations")
      .select(
        "id, title, status, session_type, context_snapshot, turn_count, last_message_preview, updated_at",
      )
      .neq("status", "archived")
      .order("updated_at", { ascending: false });
    if (data) setConversations(data as Conversation[]);
  }

  async function createSession(
    type: SessionType,
    contextSnapshot: Record<string, unknown> = {},
  ) {
    if (!user) return null;
    const supabase = createClient();
    const { data, error: createError } = await supabase
      .from("agent_conversations")
      .insert({
        user_id: user.id,
        title: "New session",
        session_type: type,
        context_snapshot: {
          started_at: new Date().toISOString(),
          ...contextSnapshot,
        },
      })
      .select(
        "id, title, status, session_type, context_snapshot, turn_count, last_message_preview, updated_at",
      )
      .single();
    if (createError || !data) {
      setError("Could not start a new session.");
      return null;
    }
    const row = data as Conversation;
    setConversations((current) => [row, ...current]);
    skipMessageLoad.current = row.id;
    setActiveId(row.id);
    setMessages([]);
    setLoading(false);
    setShowHistory(false);
    return row.id;
  }

  function startNewSession() {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setSpeechPaused(false);
    setTracking(false);
    setNewStoryReady(false);
    setLocationStatus("");
    setActiveId(null);
    setMessages([]);
    setMessage("");
    clearImage();
    setShowHistory(false);
    setError("");
  }

  function loadImage(file?: File) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("The image must be under 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    loadImage(event.target.files?.[0]);
  }

  function clearImage() {
    setImage(null);
    setImageName("");
    if (fileInput.current) fileInput.current.value = "";
  }

  async function sendPrompt({
    text,
    imageData = null,
    conversationId = activeId,
    contextUpdate,
  }: {
    text: string;
    imageData?: string | null;
    conversationId?: string | null;
    contextUpdate?: Record<string, unknown>;
  }) {
    if (sending || !conversationId || (!text.trim() && !imageData)) return;
    setError("");
    setSending(true);
    const userText =
      text.trim() || "Please inspect this image and tell me what matters and what to do next.";
    const temporaryUserId = `user-${Date.now()}`;
    const temporaryAssistantId = `assistant-${Date.now()}`;
    setMessages((current) => [
      ...current,
      {
        id: temporaryUserId,
        role: "user",
        content: userText,
        has_image: Boolean(imageData),
        used_web_search: false,
        created_at: new Date().toISOString(),
      },
      {
        id: temporaryAssistantId,
        role: "assistant",
        content: "",
        has_image: false,
        used_web_search: false,
        created_at: new Date().toISOString(),
        pending: true,
      },
    ]);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: userText,
          image: imageData,
          contextUpdate,
        }),
      });
      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "The Agent could not answer.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const eventData = JSON.parse(line) as {
            type: string;
            delta?: string;
            error?: string;
            messageId?: string;
            usedWebSearch?: boolean;
          };
          if (eventData.type === "delta" && eventData.delta) {
            setMessages((current) =>
              current.map((item) =>
                item.id === temporaryAssistantId
                  ? { ...item, content: item.content + eventData.delta }
                  : item,
              ),
            );
          }
          if (eventData.type === "done") {
            setMessages((current) =>
              current.map((item) =>
                item.id === temporaryAssistantId
                  ? {
                      ...item,
                      id: eventData.messageId || item.id,
                      pending: false,
                      used_web_search: Boolean(eventData.usedWebSearch),
                    }
                  : item,
              ),
            );
          }
          if (eventData.type === "error") {
            throw new Error(eventData.error || "The response was interrupted.");
          }
        }
      }
      await refreshConversations();
    } catch (sendError) {
      setMessages((current) =>
        current.filter((item) => item.id !== temporaryAssistantId),
      );
      setError(sendError instanceof Error ? sendError.message : "Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function submitMessage(event: FormEvent) {
    event.preventDefault();
    if (!activeId || (!message.trim() && !image)) return;
    const text = message;
    const imageData = image;
    setMessage("");
    clearImage();
    await sendPrompt({ text, imageData });
  }

  async function identifyPlace(latitude: number, longitude: number) {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
    });
    const response = await fetch(`/api/agent/place?${params}`, { cache: "no-store" });
    if (!response.ok) throw new Error("I could not identify this place.");
    return (await response.json()) as PlaceResult;
  }

  function beginLocationWatch() {
    if (watchId.current !== null || !("geolocation" in navigator)) return;
    watchId.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const next = { latitude: coords.latitude, longitude: coords.longitude };
        currentLocation.current = next;
        if (
          lastStoryLocation.current &&
          distanceMeters(lastStoryLocation.current, next) >= 120
        ) {
          setNewStoryReady(true);
        }
      },
      () => setLocationStatus("Location updates paused. Keep this PWA open and allow location."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 15000 },
    );
    setTracking(true);
  }

  async function requestSightStory(conversationId = activeId) {
    if (!conversationId || !("geolocation" in navigator)) {
      setError("Location is required for the sight guide.");
      return;
    }
    setLocationStatus("Finding the place around you...");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const place = await identifyPlace(coords.latitude, coords.longitude);
          const location = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
          currentLocation.current = location;
          lastStoryLocation.current = location;
          setNewStoryReady(false);
          setLocationStatus(`${place.place}${place.city ? ` · ${place.city}` : ""}`);
          beginLocationWatch();
          await sendPrompt({
            conversationId,
            text: `I am at ${place.displayName}. Give me a vivid 45 to 60 second audio-guide introduction. Start with what I can notice around me now.`,
            contextUpdate: {
              current_place: place.place,
              city: place.city,
              display_name: place.displayName,
              location: {
                latitude: Number(location.latitude.toFixed(3)),
                longitude: Number(location.longitude.toFixed(3)),
              },
              location_updated_at: new Date().toISOString(),
            },
          });
        } catch (placeError) {
          setError(placeError instanceof Error ? placeError.message : "Location failed.");
          setLocationStatus("");
        }
      },
      () => {
        setError("Allow location while using the app to start the audio guide.");
        setLocationStatus("");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  }

  function speakLatest() {
    const text = [...messages]
      .reverse()
      .find((item) => item.role === "assistant" && item.content.trim())?.content;
    if (!text || !("speechSynthesis" in window)) {
      setError("Speech playback is not available in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = navigator.language || "en-US";
    utterance.rate = 0.95;
    utterance.onstart = () => {
      setSpeaking(true);
      setSpeechPaused(false);
    };
    utterance.onend = () => {
      setSpeaking(false);
      setSpeechPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setSpeechPaused(false);
      setError("Audio playback stopped. Tap play to try again.");
    };
    window.speechSynthesis.speak(utterance);
  }

  function toggleSpeech() {
    if (!speaking) {
      speakLatest();
      return;
    }
    if (speechPaused) {
      window.speechSynthesis.resume();
      setSpeechPaused(false);
    } else {
      window.speechSynthesis.pause();
      setSpeechPaused(true);
    }
  }

  function stopSpeech() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setSpeechPaused(false);
  }

  async function endSession() {
    if (!activeId || !user) return;
    const supabase = createClient();
    await supabase
      .from("agent_conversations")
      .update({ status: "resolved", updated_at: new Date().toISOString() })
      .eq("id", activeId)
      .eq("user_id", user.id);
    await refreshConversations();
  }

  if (!authConfigured || !user) {
    return (
      <div className="border border-ink/15 bg-white p-5 text-center">
        <Landmark className="mx-auto h-6 w-6 text-cinnabar" />
        <p className="mt-3 text-sm font-bold">Sign in to start a live travel session</p>
        <p className="mt-2 text-[10px] leading-5 text-ink/45">
          Conversations and session context stay available across devices.
        </p>
      </div>
    );
  }

  const latestAssistant = [...messages]
    .reverse()
    .find((item) => item.role === "assistant" && item.content.trim());
  const copy = activeType ? sessionCopy[activeType] : null;

  return (
    <div className="flex min-h-[calc(100dvh-220px)] flex-col">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={startNewSession}
          className="flex min-h-14 items-center justify-between bg-cinnabar px-4 text-left text-white shadow-[0_8px_24px_rgba(196,61,38,0.24)]"
        >
          <span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-white/65">
              Start fresh
            </span>
            <span className="mt-1 block text-sm font-black">New session</span>
          </span>
          <Plus className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Open session history"
          onClick={() => setShowHistory((current) => !current)}
          className="flex w-14 items-center justify-center border border-ink/15 bg-white"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showHistory ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {showHistory && (
        <div className="mt-2 max-h-52 overflow-y-auto border border-ink/15 bg-white p-2">
          {conversations.length === 0 ? (
            <p className="p-3 text-[10px] text-ink/40">No previous sessions yet.</p>
          ) : (
            conversations.map((conversation) => {
              const option = sessionOptions.find(
                (item) => item.id === conversation.session_type,
              );
              const SessionIcon = option?.icon ?? Wrench;
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    if (activeId !== conversation.id) setLoading(true);
                    setActiveId(conversation.id);
                    setShowHistory(false);
                    stopSpeech();
                  }}
                  className={`mb-1 flex w-full items-center gap-3 p-3 text-left last:mb-0 ${
                    activeId === conversation.id ? "bg-paper" : "hover:bg-paper/60"
                  }`}
                >
                  <SessionIcon className="h-4 w-4 shrink-0 text-cinnabar" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold">
                      {conversation.title}
                    </span>
                    <span className="mt-1 block truncate text-[9px] text-ink/40">
                      {conversation.last_message_preview || option?.label}
                    </span>
                  </span>
                  {conversation.status === "resolved" && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#34735a]" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      {!activeType ? (
        <div className="mt-3 border border-ink/15 bg-white p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">
            Live travel session
          </p>
          <h2 className="mt-2 font-display text-2xl font-black">
            What are you doing right now?
          </h2>
          <p className="mt-2 text-[10px] leading-5 text-ink/45">
            Pick the situation. The same Agent keeps your trip context and conversation.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {sessionOptions.map((option, index) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => void createSession(option.id)}
                  className={`flex min-h-32 flex-col items-start justify-between border border-ink/10 p-4 text-left ${option.tone} ${
                    index === 0 ? "col-span-2 min-h-24" : ""
                  }`}
                >
                  <OptionIcon className="h-5 w-5 text-cinnabar" />
                  <span>
                    <span className="block text-xs font-black">{option.label}</span>
                    <span className="mt-1 block text-[9px] leading-4 text-ink/45">
                      {option.detail}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-3 flex-1 border border-ink/15 bg-white">
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">
                  {copy?.label}
                </p>
                <p className="mt-1 max-w-[230px] truncate text-xs font-bold">
                  {activeConversation?.title}
                </p>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => void endSession()}
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#34735a]"
                >
                  <Check className="h-3.5 w-3.5" />
                  Done
                </button>
              )}
            </div>

            {activeType === "sight" && (
              <div className="border-b border-ink/10 bg-[#f1dfbd] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <LocateFixed className="h-4 w-4 shrink-0 text-cinnabar" />
                    <span className="truncate text-[10px] font-bold">
                      {locationStatus || "Location guide is off"}
                    </span>
                  </span>
                  {tracking && (
                    <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider text-[#34735a]">
                      ● Live
                    </span>
                  )}
                </div>
                {newStoryReady && (
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => void requestSightStory()}
                    className="mt-3 flex w-full items-center justify-between bg-cinnabar p-3 text-[10px] font-bold text-white"
                  >
                    New story nearby
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            <div className="max-h-[45dvh] min-h-64 overflow-y-auto p-4">
              {loading ? (
                <div className="flex h-52 items-center justify-center">
                  <LoaderCircle className="h-5 w-5 animate-spin text-cinnabar" />
                </div>
              ) : messages.length === 0 ? (
                <div>
                  <h3 className="font-display text-2xl font-black leading-tight">
                    {copy?.emptyTitle}
                  </h3>
                  <p className="mt-3 text-[10px] leading-5 text-ink/45">
                    {copy?.emptyBody}
                  </p>

                  {activeType === "problem" && (
                    <div className="mt-5 space-y-2">
                      {quickProblems.map((problem) => (
                        <button
                          key={problem}
                          type="button"
                          onClick={() => setMessage(problem)}
                          className="flex w-full items-center justify-between border border-ink/10 p-3 text-left text-[10px] font-bold"
                        >
                          {problem}
                          <Plus className="h-3.5 w-3.5 text-cinnabar" />
                        </button>
                      ))}
                    </div>
                  )}

                  {activeType === "sight" && (
                    <button
                      type="button"
                      disabled={sending}
                      onClick={() => void requestSightStory()}
                      className="mt-5 flex min-h-14 w-full items-center justify-between bg-ink px-4 text-xs font-bold text-white"
                    >
                      Start audio guide
                      <LocateFixed className="h-4 w-4" />
                    </button>
                  )}

                  {(activeType === "menu" || activeType === "sign") && (
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className="mt-5 flex min-h-14 w-full items-center justify-between bg-ink px-4 text-xs font-bold text-white"
                    >
                      {activeType === "menu" ? "Photograph menu" : "Photograph sign"}
                      <Camera className="h-4 w-4" />
                    </button>
                  )}

                  {activeType === "driver" && (
                    <div className="mt-5 space-y-2">
                      {[
                        "Take me to my hotel",
                        "Take me to the correct train station entrance",
                        "Help me describe a pickup point",
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setMessage(prompt)}
                          className="flex w-full items-center justify-between border border-ink/10 p-3 text-left text-[10px] font-bold"
                        >
                          {prompt}
                          <Navigation className="h-3.5 w-3.5 text-cinnabar" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((item) => (
                    <div
                      key={item.id}
                      className={`max-w-[90%] p-3 ${
                        item.role === "user"
                          ? "ml-auto bg-ink text-white"
                          : "bg-paper text-ink"
                      }`}
                    >
                      {item.has_image && (
                        <span className="mb-2 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider opacity-75">
                          <ImageIcon className="h-3 w-3" />
                          Image analyzed · image not saved
                        </span>
                      )}
                      <p className="whitespace-pre-wrap text-[11px] leading-5">
                        {item.content || (item.pending ? "Thinking..." : "")}
                      </p>
                      {item.used_web_search && (
                        <span className="mt-2 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-cinnabar">
                          <Globe2 className="h-3 w-3" />
                          Web checked after earlier attempts
                        </span>
                      )}
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
              )}
            </div>
          </div>

          {activeType === "sight" && latestAssistant && (
            <div className="mt-2 grid grid-cols-[1fr_44px] gap-2 border border-ink/15 bg-[#dbe2d2] p-2">
              <button
                type="button"
                onClick={toggleSpeech}
                className="flex min-h-11 items-center justify-between bg-white px-3 text-[10px] font-bold"
              >
                <span className="flex items-center gap-2">
                  {speaking && !speechPaused ? (
                    <Pause className="h-4 w-4 text-cinnabar" />
                  ) : (
                    <Play className="h-4 w-4 text-cinnabar" />
                  )}
                  {speaking && !speechPaused
                    ? "Pause guide"
                    : speechPaused
                      ? "Resume guide"
                      : "Play latest guide"}
                </span>
                <span className="text-[8px] uppercase tracking-wider text-ink/40">
                  device voice
                </span>
              </button>
              <button
                type="button"
                aria-label="Stop audio guide"
                onClick={stopSpeech}
                className="flex items-center justify-center border border-ink/15 bg-white"
              >
                <CircleStop className="h-4 w-4" />
              </button>
            </div>
          )}

          {activeType === "driver" && latestAssistant && (
            <button
              type="button"
              onClick={() => setDriverCardOpen(true)}
              className="mt-2 flex min-h-12 w-full items-center justify-between bg-cinnabar px-4 text-xs font-bold text-white"
            >
              Show full-screen driver card
              <Maximize2 className="h-4 w-4" />
            </button>
          )}

          {image && (
            <div className="mt-2 flex items-center justify-between border border-cinnabar/20 bg-[#fff3ed] px-3 py-2">
              <span className="flex min-w-0 items-center gap-2 text-[9px] font-bold">
                <ImageIcon className="h-3.5 w-3.5 shrink-0 text-cinnabar" />
                <span className="truncate">{imageName}</span>
                <span className="shrink-0 font-normal text-ink/35">not saved</span>
              </span>
              <button type="button" aria-label="Remove image" onClick={clearImage}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {error && (
            <p className="mt-2 border border-cinnabar/20 bg-[#fff3ed] p-3 text-[10px] leading-4 text-cinnabar">
              {error}
            </p>
          )}

          <form
            className="mt-2 grid grid-cols-[44px_1fr_44px] border border-ink/15 bg-white"
            onSubmit={submitMessage}
          >
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={handleImage}
            />
            <button
              type="button"
              aria-label="Upload an image"
              onClick={() => fileInput.current?.click()}
              className="flex items-center justify-center border-r border-ink/10 text-cinnabar"
            >
              <Camera className="h-4 w-4" />
            </button>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder={copy?.placeholder}
              className="min-h-12 resize-none bg-transparent px-3 py-3 text-xs outline-none placeholder:text-ink/30"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={sending || (!message.trim() && !image)}
              className="flex items-center justify-center bg-ink text-white disabled:bg-ink/20"
            >
              {sending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={onGuide}
            className="mt-2 flex w-full items-center justify-between bg-[#dbe2d2] p-3 text-left"
          >
            <span className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-[#34735a]" />
              <span>
                <span className="block text-[10px] font-bold">
                  This needs a local person
                </span>
                <span className="mt-0.5 block text-[9px] text-ink/40">
                  Carry this session context into a guide request
                </span>
              </span>
            </span>
            <span className="text-[9px] font-bold text-[#34735a]">Get help</span>
          </button>
        </>
      )}

      {driverCardOpen && latestAssistant && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-ink p-5 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#f1dfbd]">
              Show your driver
            </p>
            <button
              type="button"
              aria-label="Close driver card"
              onClick={() => setDriverCardOpen(false)}
              className="flex h-10 w-10 items-center justify-center border border-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center py-8 text-center">
            <p className="whitespace-pre-wrap font-display text-3xl font-black leading-[1.35]">
              {latestAssistant.content}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(latestAssistant.content)}
            className="flex min-h-14 w-full items-center justify-center gap-2 bg-white text-xs font-bold text-ink"
          >
            <Copy className="h-4 w-4" />
            Copy destination card
          </button>
        </div>
      )}
    </div>
  );
}
