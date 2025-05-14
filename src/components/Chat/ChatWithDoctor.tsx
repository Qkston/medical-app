import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, Button, Typography, List, ListItem, Paper, Backdrop, CircularProgress, IconButton, Chip, Avatar, Dialog, DialogContent } from "@mui/material";
import { AttachFile as AttachFileIcon, Send as SendIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import PatientCard from "./PatientCard";
import { chatWebsocketLink, doctorSettingsLink, getMessagesLink } from "../../utils/api/awsLinks";
import { FeatureSettings } from "../Settings/SettingsPopup";

interface Message {
  sender: string;
  message?: string;
  timestamp?: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  attachments?: { fileName: string; fileType: string; fileSize: number; previewURL: string }[];
}

interface User {
  cognitoId: string;
  doctorEmail: string | null;
  email: string;
  id: string;
  role: "patient" | "doctor";
}

// Attachment type to hold file and its preview URL
interface Attachment { file: File; previewURL: string; }

const ChatWithDoctor: React.FC = () => {
  const { patientEmail } = useParams<{ patientEmail: string }>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [receiverEmail, setReceiverEmail] = useState<string>("");
  const [settings, setSettings] = useState<FeatureSettings | null>();
  const [selectedFiles, setSelectedFiles] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>("");

	const openImagePreview = (src: string) => { setPreviewSrc(src); setIsPreviewOpen(true); };
  const closeImagePreview = () => { setIsPreviewOpen(false); setPreviewSrc(""); };

  useEffect(() => {
    const userRecord = localStorage.getItem("user");
    if (!userRecord) return;

    const user = JSON.parse(userRecord);
    setUser(user);
    setReceiverEmail(user.role === "doctor" ? patientEmail : user.doctorEmail || "");

    const ws = new WebSocket(chatWebsocketLink(user.role, user.email));
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
    const fetchSettings = async () => {
      const response = await axios.get(doctorSettingsLink, {
        params: { email: user?.role === "doctor" ? user.email : user?.doctorEmail },
      });
      setSettings(response.data?.settings);
    };

    if (user) fetchSettings();
  }, [user]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(getMessagesLink, {
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

  useEffect(() => {
    return () => {
      selectedFiles.forEach(att => URL.revokeObjectURL(att.previewURL));
    };
  }, []);

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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const maxSize = 10 * 1024 * 1024; // 10MB
      const maxCount = 5;
      let errorMsg = "";
      const validAttachments: Attachment[] = [];
      for (const file of filesArray) {
        if (selectedFiles.length + validAttachments.length >= maxCount) {
          errorMsg = "Максимальна кількість файлів — 5";
          break;
        }
        if (file.size > maxSize) {
          errorMsg = "Файл перевищує максимально дозволений розмір 10МБ";
          continue;
        }
        validAttachments.push({ file, previewURL: URL.createObjectURL(file) });
      }
      setFileError(errorMsg);
      if (validAttachments.length) setSelectedFiles(prev => [...prev, ...validAttachments]);
      e.target.value = "";
    }
  };

  const handleSend = async () => {
    if (selectedFiles.length > 0) {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        setFileError("Не вдалося відправити файл. Спробуйте ще раз");
        return;
      }
      const timestamp = new Date().toISOString();
      const hasText = message.trim() !== "";
      // Push combined message with text + attachments
      if (hasText) {
        setMessages(prev => [
          ...prev,
          {
            sender: user?.email,
            message: message,
            timestamp,
            attachments: selectedFiles.map(att => ({
              fileName: att.file.name,
              fileType: att.file.type,
              fileSize: att.file.size,
              previewURL: att.previewURL,
            })),
          } as Message,
        ]);
      }
      // Send each file and optionally push attachments-only if no text
      for (const att of selectedFiles) {
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject("Помилка читання файлу");
            reader.readAsDataURL(att.file);
          });
          socket.send(
            JSON.stringify({
              action: "sendFile",
              fileName: att.file.name,
              fileType: att.file.type,
              fileSize: att.file.size,
              fileData: dataUrl,
              recipientEmail: receiverEmail,
            })
          );
          if (!hasText && user?.email) {
            // attachments-only bubble
            const newMsg: Message = {
              sender: user.email,
              fileName: att.file.name,
              fileType: att.file.type,
              fileData: dataUrl,
              timestamp,
            };
            setMessages(prev => [...prev, newMsg]);
          }
        } catch (err) {
          setFileError("Не вдалося відправити файл. Спробуйте ще раз");
        }
      }
      // Send text message if present
      if (hasText) sendMessage(message);
      // Cleanup
      setMessage("");
      selectedFiles.forEach(att => URL.revokeObjectURL(att.previewURL));
      setSelectedFiles([]);
      setFileError("");
    } else {
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      {user?.role === "doctor" && (
        <Button variant="outlined" color="primary" sx={{ marginBottom: 2 }} onClick={() => navigate("/dashboard")}>
          Повернутись на дашборд
        </Button>
      )}
      {!socket || (user?.role === "doctor" && !settings) ? (
        <Backdrop sx={theme => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })} open={!socket || !settings}>
          <CircularProgress />
        </Backdrop>
      ) : (
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ width: settings?.patientCardsEnabled ? "60%" : "100%" }}>
            <Typography variant="h6" color="primary" sx={{ marginBottom: 2 }}>
              {user?.role === "doctor" ? `Чат з пацієнтом: ${patientEmail}` : "Чат з вашим доктором"}
            </Typography>
            {user?.role === "doctor" && (
              <Button
                variant="contained"
                color="secondary"
                sx={{ marginBottom: 2 }}
                disabled={!settings?.videoChatEnabled}
                title={
                  !settings?.videoChatEnabled
                    ? "Ви вимкнули цей функціонал для заощадження трафіку. Увімкніть цей параметр в налаштуваннях, щоб користуватись цим функціоналом."
                    : ""
                }
                onClick={() => navigate(`/video-call/${patientEmail}`)}>
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
                        {msg.attachments ? (
                          <> 
                            {msg.message && <Typography variant="body2" sx={{ marginBottom: 1 }}>{msg.message}</Typography>}
                            {msg.attachments.map((att, i) => (
                              att.fileType.startsWith("image/") ? (
                                <Box
                                  key={i}
                                  component="img"
                                  src={att.previewURL}
                                  alt={att.fileName}
                                  sx={{ maxWidth: "200px", maxHeight: "200px", cursor: "pointer", mb: 1 }}
                                  onClick={() => openImagePreview(att.previewURL)}
                                />
                              ) : (
                                <Box key={i} sx={{ mb: 1 }}>
                                  <a href={att.previewURL} download={att.fileName} style={{ textDecoration: "none", color: "#1976d2" }}>
                                    {att.fileName}
                                  </a>
                                </Box>
                              )
                            ))}
                          </>
                        ) : msg.fileData && msg.fileType ? (
                          msg.fileType.startsWith("image/") ? (
                            <Box
                              component="img"
                              src={msg.fileData}
                              alt={msg.fileName}
                              sx={{ maxWidth: "200px", maxHeight: "200px", cursor: "pointer" }}
                              onClick={() => openImagePreview(msg.fileData!)}
                            />
                          ) : (
                            <Box>
                              <a href={msg.fileData} download={msg.fileName} style={{ textDecoration: "none", color: "#1976d2" }}>
                                {msg.fileName}
                              </a>
                            </Box>
                          )
                        ) : (
                          <Typography variant="body2">{msg.message}</Typography>
                        )}
                      </Paper>
                    </ListItem>
                  ))}
                <div ref={messagesEndRef} />
              </List>
            </Box>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  gap: 1,
                }}>
                <IconButton color="primary" onClick={handleAttachClick}>
                  <AttachFileIcon />
                </IconButton>
                <input
                  type="file"
                  hidden
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,image/*,.docx"
                />
                <TextField
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Напишіть повідомлення..."
                  variant="outlined"
                  size="small"
                  sx={{
                    flexGrow: 1,
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!message.trim() && selectedFiles.length === 0}>
                  <SendIcon />
                </IconButton>
              </Box>
              {(selectedFiles.length > 0 || fileError) && (
                <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  {selectedFiles.map((att, idx) => (
                    <Chip
                      key={idx}
                      clickable={att.file.type.startsWith("image/")}
                      onClick={att.file.type.startsWith("image/") ? () => openImagePreview(att.previewURL) : undefined}
                      avatar={att.file.type.startsWith("image/") ? <Avatar src={att.previewURL} /> : undefined}
                      icon={!att.file.type.startsWith("image/") ? <AttachFileIcon /> : undefined}
                      label={att.file.name}
                      onDelete={() => { URL.revokeObjectURL(att.previewURL); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)); setFileError(""); }}
                      variant="outlined"
                      sx={{ maxWidth: "200px" }}
                    />
                  ))}
                  {fileError && (
                    <Typography color="error" variant="caption">
                      {fileError}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          {settings?.patientCardsEnabled && (
            <PatientCard
              patientEmail={user?.role === "doctor" && patientEmail ? patientEmail : user?.email || ""}
              doctorEmail={user?.role === "doctor" ? user.email : user?.doctorEmail || ""}
            />
          )}
        </Box>
      )}
      {/* Image preview dialog */}
      <Dialog open={isPreviewOpen} onClose={closeImagePreview} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 0, backgroundColor: 'black' }}>
          <Box
            component="img"
            src={previewSrc}
            alt="Preview"
            sx={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ChatWithDoctor;
