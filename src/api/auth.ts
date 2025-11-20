import api from "../lib/axios";


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
