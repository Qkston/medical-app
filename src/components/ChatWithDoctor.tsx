import React, { useState } from "react";
import { Box, TextField, Button, Typography, List, ListItem, ListItemText } from "@mui/material";

const ChatWithDoctor: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, message]);
      setMessage("");
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" color="primary">
        Чат з вашим доктором
      </Typography>
      <Box sx={{ height: "400px", overflowY: "auto", border: "1px solid #e0e0e0", marginTop: 2, padding: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText primary={msg} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ display: "flex", marginTop: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <Button onClick={handleSendMessage} variant="contained" color="primary" sx={{ marginLeft: 2 }}>
          Відправити
        </Button>
      </Box>
    </Box>
  );
};

export default ChatWithDoctor;
