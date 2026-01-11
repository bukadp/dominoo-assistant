// src/pages/popup/PopupChat.tsx
import React, { useState, useRef, useEffect } from "react";
import { Box, TextField, IconButton, Typography, Paper, CircularProgress, Alert } from "@mui/material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { webLLMManager } from "../../features/model-management/lib/webllm-manager";
import { useModelManager } from "../../features/model-management/hooks/useModelManager";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const PopupChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get model status from hook
  const { isEnabled: isModelReady } = useModelManager();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || !isModelReady) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);
    setIsTyping(true);

    try {
      // Call WebLLM for response
      const response = await webLLMManager.chat(userMessage.content);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Model Not Ready Warning */}
      {!isModelReady && (
        <Alert severity="warning" sx={{ m: 2, mb: 0 }}>
          AI model not loaded. Please go to Settings → LLM Setup to install a model.
        </Alert>
      )}

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
              gap: 2,
            }}
          >
            <SmartToyOutlinedIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            <Typography variant="body2" textAlign="center">
              Start a conversation with your AI assistant
            </Typography>
            <Typography variant="caption" color="text.disabled" textAlign="center">
              {isModelReady ? "Ask me anything!" : "Please install a model first"}
            </Typography>
          </Box>
        ) : (
          messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "flex-start",
                flexDirection: message.role === "user" ? "row-reverse" : "row",
              }}
            >
              {/* Avatar */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: message.role === "user" ? "primary.main" : "grey.300",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {message.role === "user" ? (
                  <PersonOutlineOutlinedIcon sx={{ fontSize: 18, color: "white" }} />
                ) : (
                  <SmartToyOutlinedIcon sx={{ fontSize: 18, color: "text.primary" }} />
                )}
              </Box>

              {/* Message Bubble */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  maxWidth: "75%",
                  bgcolor: message.role === "user" ? "primary.main" : "grey.100",
                  color: message.role === "user" ? "white" : "text.primary",
                  borderRadius: 2,
                  border: 1,
                  borderColor: message.role === "user" ? "primary.main" : "divider",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {message.content}
                </Typography>
              </Paper>
            </Box>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
            }}
          >
            {/* Avatar */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "grey.300",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <SmartToyOutlinedIcon sx={{ fontSize: 18, color: "text.primary" }} />
            </Box>

            {/* Typing Bubble */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: "grey.100",
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                display: "flex",
                gap: 0.5,
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "text.secondary",
                  animation: "typing 1.4s ease-in-out infinite",
                  animationDelay: "0s",
                  "@keyframes typing": {
                    "0%, 60%, 100%": { opacity: 0.3 },
                    "30%": { opacity: 1 },
                  },
                }}
              />
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "text.secondary",
                  animation: "typing 1.4s ease-in-out infinite",
                  animationDelay: "0.2s",
                  "@keyframes typing": {
                    "0%, 60%, 100%": { opacity: 0.3 },
                    "30%": { opacity: 1 },
                  },
                }}
              />
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "text.secondary",
                  animation: "typing 1.4s ease-in-out infinite",
                  animationDelay: "0.4s",
                  "@keyframes typing": {
                    "0%, 60%, 100%": { opacity: 0.3 },
                    "30%": { opacity: 1 },
                  },
                }}
              />
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
          {/* Left button placeholder (hidden for now) */}
          <Box sx={{ width: 36, flexShrink: 0, visibility: "hidden" }}>
            {/* Future: Add context button here */}
          </Box>

          {/* Text Input */}
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isModelReady ? "Type your message..." : "Please install a model first..."}
            disabled={isSending || !isModelReady}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.default",
              },
              "& .MuiInputBase-input": {
                fontSize: "0.9rem",
              },
            }}
          />

          {/* Send Button */}
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending || !isModelReady}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              width: 36,
              height: 36,
              flexShrink: 0,
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.8)",
              },
              "&:disabled": {
                bgcolor: "grey.300",
                color: "grey.500",
              },
            }}
          >
            {isSending ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SendOutlinedIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default PopupChat;