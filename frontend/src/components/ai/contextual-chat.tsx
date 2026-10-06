import Ionicons from "@react-native-vector-icons/ionicons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/context/auth-context";
import { withJsonHeaders } from "@/services/api";
import type { AIChatResponse } from "@/types/api";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  source?: string;
};

const INITIAL_SUGGESTIONS = [
  "¿Cómo está mi secado?",
  "¿Por qué tiene ese estado?",
  "¿Cuánto tiempo falta?",
  "¿Qué debo hacer?",
];

export function ContextualChat({ processId }: { processId?: number | null }) {
  const { request } = useAuth();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hola, soy el asistente de AgroCoffee AI. Puedo explicarte el estado del secado usando las mediciones reales del proceso.",
    },
  ]);

  const sendMessage = async (suggestedMessage?: string) => {
    const message = (suggestedMessage ?? input).trim();
    if (!message || isSending) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: message },
    ]);
    setInput("");
    setIsSending(true);

    try {
      const response = await request<AIChatResponse>(
        "/ia/chat",
        withJsonHeaders({
          method: "POST",
          body: JSON.stringify({
            mensaje: message,
            id_proceso: processId ?? null,
          }),
        })
      );
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: response.respuesta,
          source: response.contexto.id_medicion
            ? `Proceso #${response.contexto.id_proceso} · Medición #${response.contexto.id_medicion}`
            : `Proceso #${response.contexto.id_proceso}`,
        },
      ]);
      setSuggestions(response.sugerencias);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "No pude consultar el proceso. Intenta nuevamente.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      className={`mb-3 max-w-[88%] rounded-2xl px-4 py-3 ${
        item.role === "user"
          ? "self-end rounded-br-sm bg-agro-green"
          : "self-start rounded-bl-sm bg-agro-surface"
      }`}
    >
      <Text
        className={`font-inter text-sm leading-5 ${
          item.role === "user" ? "text-white" : "text-agro-text"
        }`}
      >
        {item.text}
      </Text>
      {item.source ? (
        <Text className="mt-2 font-inter text-[10px] text-agro-muted">
          Fuente: {item.source}
        </Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-agro-surface"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => String(item.id)}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={
          isSending ? (
            <View className="mb-3 self-start rounded-2xl rounded-bl-sm bg-agro-surface px-5 py-3">
              <ActivityIndicator size="small" color="#2F7D32" />
            </View>
          ) : null
        }
      />

      <View className="border-t border-agro-line bg-agro-surface px-4 pb-3 pt-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              className="mr-2 rounded-full border border-agro-green/30 bg-agro-green-light px-3 py-2 active:opacity-60"
              onPress={() => void sendMessage(suggestion)}
              disabled={isSending}
            >
              <Text className="font-inter-medium text-xs text-agro-green-dark">
                {suggestion}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="mt-3 flex-row items-end rounded-2xl border border-agro-line bg-agro-surface px-3 py-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Pregunta sobre tu proceso..."
            placeholderTextColor="#7B847D"
            multiline
            maxLength={500}
            className="max-h-24 min-h-10 flex-1 py-2 font-inter text-sm text-agro-text"
            editable={!isSending}
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={() => void sendMessage()}
          />
          <Pressable
            className={`ml-2 h-11 w-11 items-center justify-center rounded-full ${
              input.trim() && !isSending ? "bg-agro-green" : "bg-agro-soft"
            }`}
            onPress={() => void sendMessage()}
            disabled={!input.trim() || isSending}
            accessibilityRole="button"
            accessibilityLabel="Enviar pregunta"
          >
            <Ionicons name="send" size={19} color="#FFFFFF" />
          </Pressable>
        </View>

        <View className="mt-2 flex-row items-start">
          <Ionicons name="information-circle-outline" size={14} color="#68736B" />
          <Text className="ml-1 flex-1 font-inter text-[10px] leading-4 text-agro-muted">
            Respuestas explicativas basadas en el modelo y las mediciones IoT.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
