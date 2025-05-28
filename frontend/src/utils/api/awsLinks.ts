export const saveDoctorLink = "https://zqqep83bba.execute-api.eu-north-1.amazonaws.com/medical-app-staging/save-user";
export const doctorSettingsLink = "https://eylhcitap2.execute-api.eu-north-1.amazonaws.com/medical-app-staging/doctor-settings";
export const getDoctorPatients = (doctorId: string) =>
  `https://89b3040o74.execute-api.eu-north-1.amazonaws.com/medical-app-staging/get-patients?doctorId=${doctorId}`;
export const archivePatientLink = "https://6rcb2y40u2.execute-api.eu-north-1.amazonaws.com/medical-app-staging/archive-patient";
export const savePatientLink = "https://fvis7cwi09.execute-api.eu-north-1.amazonaws.com/medical-app-staging/save-patient";
export const handleDoctorSettingsLink = "https://eylhcitap2.execute-api.eu-north-1.amazonaws.com/medical-app-staging/doctor-settings";

export const sendInviteLink = "https://p6qixdltrb.execute-api.eu-north-1.amazonaws.com/medical-app-staging/send-invite";
export const sendVideocallInviteLink = "https://k0ieme2qx9.execute-api.eu-north-1.amazonaws.com/medical-app-staging/send-videocall-invite";

export const handlePatientCardLink = "https://600uuqxerh.execute-api.eu-north-1.amazonaws.com/medical-app-staging/patient-card";
export const getMessagesLink = "https://ulhd97krhl.execute-api.eu-north-1.amazonaws.com/medical-app-staging/get-messages";
export const getUserRole = (email: string) =>
  `https://5cbbxrp1m3.execute-api.eu-north-1.amazonaws.com/medical-app-staging/get-user-role?email=${email}`;
export const chatWebsocketLink = (role: string, email: string) =>
  `wss://qf54sqdth8.execute-api.eu-north-1.amazonaws.com/staging?userType=${role}&email=${encodeURIComponent(email)}`;
