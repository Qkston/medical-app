import React, { useState, useEffect } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import {
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonStrikethrough,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditorProvider,
  RichTextField,
} from "mui-tiptap";
import axios from "axios";
import { handlePatientCardLink } from "../../utils/api/awsLinks";

interface PatientCardProps {
  patientEmail: string;
  doctorEmail: string;
}

const PatientCard: React.FC<PatientCardProps> = ({ patientEmail, doctorEmail }) => {
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState<"doctor" | "patient" | null>(null);
  const [content, setContent] = useState("<p>Інформація про пацієнта...</p>");
  const [updatedContent, setUpdatedContent] = useState(content);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userRecord = localStorage.getItem("user");
    if (!userRecord) return;

    const user = JSON.parse(userRecord);
    setUserRole(user.role);
  }, []);

  useEffect(() => {
    if (!patientEmail || !doctorEmail) return;

    const fetchPatientCard = async () => {
      try {
        const response = await axios.get(handlePatientCardLink, {
          params: { patientEmail, doctorEmail },
        });
        setContent(response.data.content || "<p>Інформація про пацієнта...</p>");
      } catch (error) {
        console.error("Error fetching patient card:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientCard();
  }, [patientEmail, doctorEmail]);

  const editor = useEditor(
    {
      extensions: [StarterKit],
      content: content,
      onUpdate: ({ editor }) => setUpdatedContent(editor.getHTML()),
    },
    [content]
  );

  const handleCancel = () => {
    setUpdatedContent(content);
    setOpen(false);
  };

  const handleSave = async () => {
    setContent(updatedContent);
    setOpen(false);

    try {
      await axios.put(handlePatientCardLink, {
        patientEmail,
        doctorEmail,
        content: updatedContent,
      });
      console.log("Patient card saved successfully");
    } catch (error) {
      console.error("Error saving patient card:", error);
    }
  };

  return (
    <Box sx={{ width: "40%", maxHeight: "570px", border: "1px solid #e0e0e0", padding: 2, borderRadius: "8px" }}>
      {userRole === "doctor" && (
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ marginBottom: 2 }}>
          Редагувати картку
        </Button>
      )}
      {isLoading ? (
        <CircularProgress sx={{ display: "flex", justifySelf: "center", alignSelf: "center" }} />
      ) : (
        <Box sx={{ maxHeight: "520px", overflow: "auto" }} dangerouslySetInnerHTML={{ __html: content }} />
      )}
      {open && (
        <Dialog open={open} fullWidth maxWidth="md">
          <DialogTitle>Редагувати картку пацієнта</DialogTitle>
          <DialogContent>
            {editor && (
              <RichTextEditorProvider editor={editor}>
                <RichTextField
                  controls={
                    <MenuControlsContainer>
                      <MenuSelectHeading />
                      <MenuDivider />
                      <MenuButtonBold />
                      <MenuButtonItalic />
                      <MenuButtonBulletedList />
                      <MenuButtonOrderedList />
                      <MenuButtonStrikethrough />
                    </MenuControlsContainer>
                  }
                />
              </RichTextEditorProvider>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} color="secondary">
              Скасувати
            </Button>
            <Button onClick={handleSave} color="primary">
              Зберегти
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PatientCard;
