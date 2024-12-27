import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Switch, FormControlLabel, IconButton, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import axios from "axios";
import { handleDoctorSettingsLink } from "../utils/awsLinks";

export interface FeatureSettings {
  videoChatEnabled: boolean;
  patientCardsEnabled: boolean;
}

const SettingsPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<FeatureSettings>({
    videoChatEnabled: true,
    patientCardsEnabled: true,
  });
  const [tempSettings, setTempSettings] = useState(settings);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const userRecord = localStorage.getItem("user");
    if (userRecord) {
      const user = JSON.parse(userRecord);
      if (user.role === "doctor") {
        setUserId(user.id);
        fetchSettings(user.email);
      }
    }
  }, []);

  const fetchSettings = async (email: string) => {
    try {
      const response = await axios.get(handleDoctorSettingsLink, {
        params: { email },
      });
      setSettings(response.data?.settings);
      setTempSettings(response.data?.settings);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(handleDoctorSettingsLink, {
        id: userId,
        settings: tempSettings,
      });
      setSettings(tempSettings);
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setOpen(false);
  };

  const handleSwitchChange = (key: keyof FeatureSettings, value: boolean) => {
    const updatedSettings = { ...tempSettings, [key]: value };
    setTempSettings(updatedSettings);
  };

  return (
    <>
      <Tooltip title="Налаштування">
        <IconButton onClick={() => setOpen(true)}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
        <DialogTitle>Налаштування функціоналу</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={<Switch checked={!!tempSettings.videoChatEnabled} onChange={e => handleSwitchChange("videoChatEnabled", e.target.checked)} />}
            label="Відеочат з пацієнтами"
          />
          <FormControlLabel
            control={
              <Switch checked={!!tempSettings.patientCardsEnabled} onChange={e => handleSwitchChange("patientCardsEnabled", e.target.checked)} />
            }
            label="Ведення карток пацієнтів"
          />
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
    </>
  );
};

export default SettingsPopup;
