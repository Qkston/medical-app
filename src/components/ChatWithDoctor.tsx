import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, Button, Typography, List, ListItem, Paper } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import PatientCard from "./PatientCard";

interface Message {
  sender: string;
  message: string;
  timestamp?: string;
}

interface User {
  cognitoId: string;
  doctorEmail: string | null;
  email: string;
  id: string;
  role: "patient" | "doctor";
}

const ChatWithDoctor: React.FC = () => {
  const { patientEmail } = useParams<{ patientEmail: string }>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [receiverEmail, setReceiverEmail] = useState<string>("");

  useEffect(() => {
    const userRecord = localStorage.getItem("user");
    if (!userRecord) return;

    const user = JSON.parse(userRecord);
    setUser(user);
    setReceiverEmail(user.role === "doctor" ? patientEmail : user.doctorEmail || "");

    const ws = new WebSocket(
      `wss://qf54sqdth8.execute-api.eu-north-1.amazonaws.com/staging?userType=${user.role}&email=${encodeURIComponent(user.email)}`
    );
    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = event => setMessages(prev => [...prev, JSON.parse(event.data)]);
    ws.onerror = error => console.error("WebSocket error:", error);
    ws.onclose = event => console.log("WebSocket closed:", event.reason);
    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`https://ulhd97krhl.execute-api.eu-north-1.amazonaws.com/medical-app-staging/get-messages`, {
          params: { userEmail: user!.email, companionEmail: receiverEmail },
        });

        setMessages(
          response.data.messages.map((msg: Message) => ({
            ...msg,
            timestamp: moment(msg.timestamp).toISOString(),
          }))
        );
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    if (receiverEmail && user?.email) fetchChatHistory();
  }, [receiverEmail, user?.email]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: "sendMessage",
          message,
          recipientEmail: receiverEmail,
        })
      );
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !user) return;
    const timestamp = new Date().toISOString();
    const newMessage: Message = { sender: user.email, message: message, timestamp };
    sendMessage(message);
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessage("");
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const sendCallLink = async () => {
    const callLink = `${window.location.origin}/video-call?patientEmail=${patientEmail}`;
    try {
      await fetch("https://k0ieme2qx9.execute-api.eu-north-1.amazonaws.com/medical-app-staging/send-videocall-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientEmail, callLink }),
      });
      console.log("Посилання на відеодзвінок надіслано");
    } catch (error) {
      console.error("Помилка надсилання посилання:", error);
    }
  };

  const handleStartVideoCall = () => {
    navigate(`/video-call?patientEmail=${patientEmail}`);
    sendCallLink();
  };

  return (
    <Box sx={{ padding: 2 }}>
      {user?.role === "doctor" && (
        <Button variant="outlined" color="primary" sx={{ marginBottom: 2 }} onClick={() => navigate("/dashboard")}>
          Повернутись на дашборд
        </Button>
      )}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ width: "60%" }}>
          <Typography variant="h6" color="primary" sx={{ marginBottom: 2 }}>
            {user?.role === "doctor" ? `Чат з пацієнтом: ${patientEmail}` : "Чат з вашим доктором"}
          </Typography>
          {user?.role === "doctor" && (
            <Button variant="contained" color="secondary" sx={{ marginBottom: 2 }} onClick={handleStartVideoCall}>
              Почати відеодзвінок
            </Button>
          )}
          <Box
            sx={{
              height: "400px",
              overflowY: "auto",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: 2,
              marginBottom: 2,
              backgroundColor: "#f5f5f5",
            }}>
            <List>
              {messages
                .sort((a, b) => moment(a.timestamp).diff(b.timestamp))
                .map((msg, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: msg.sender === user?.email ? "flex-end" : "flex-start",
                      marginBottom: "10px",
                    }}>
                    <Paper
                      sx={{
                        padding: "10px",
                        borderRadius: "10px",
                        maxWidth: "70%",
                        backgroundColor: msg.sender === user?.email ? "#bffcbd" : "#9effea",
                      }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: msg.sender === user?.email ? "right" : "left",
                          marginBottom: "5px",
                          color: "#6c757d",
                        }}>
                        {moment(msg.timestamp).format("MMMM DD, HH:mm:ss")}
                      </Typography>
                      <Typography variant="body2">{msg.message}</Typography>
                    </Paper>
                  </ListItem>
                ))}
              <div ref={messagesEndRef} />
            </List>
          </Box>
          <Box sx={{ display: "flex" }}>
            <TextField
              fullWidth
              variant="outlined"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишіть повідомлення..."
            />
            <Button onClick={handleSendMessage} variant="contained" color="primary" sx={{ marginLeft: 2 }}>
              Відправити
            </Button>
          </Box>
        </Box>
        <PatientCard
          patientEmail={user?.role === "doctor" && patientEmail ? patientEmail : user?.email || ""}
          doctorEmail={user?.role === "doctor" ? user.email : user?.doctorEmail || ""}
        />
      </Box>
    </Box>
  );
};

export default ChatWithDoctor;
