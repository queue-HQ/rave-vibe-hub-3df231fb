import axios from "axios";
import api from "../lib/axios";
import { baseUrl } from "../lib/apiURL";


export const registerUser = async (data: any) => {
  const res = await api.post("/userRegister", data);
  return res.data;
};


export const userStatus = async (username: string) => {
  const res = await api.get("/userStatus", {
    params: { username },
  });
  return res.data;
};

export const registerUserOTP = async (data: any) => {
  const res = await api.post("/verify-otp", data);
  return res.data;
};

export const setPassword = async (data: any) => {
  const res = await api.post("/set-password", data);
  return res.data;
};


export const setupProfile = async (data: any) => {
  const res = await api.post("/setup-profile", data);
  return res.data;
};


export const loginUser = async (data: any) => {
  const res = await api.post("/userLogin", data);
  return res.data;
};

export const eventBooking = async (data: any) => {
  const res = await api.post("/event-booking", data);
  return res.data;
};


export const sendContactForm = async (data: any) => {
  const res = await axios.post(`${baseUrl}/wp-json/contact/v1/send`, data);
  return res.data;
};

export const requestPasswordReset = async (email: string) => {
  const res = await api.post("/forgot-password", { email });
  return res.data;
};

type ResetPasswordPayload = {
  email: string;
  code: string;
  password: string;
  confirm_password: string;
};

export const resetPassword = async (data: ResetPasswordPayload) => {
  const res = await api.post("/reset-password", data);
  return res.data;
};
