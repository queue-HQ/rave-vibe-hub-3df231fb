import api from "../lib/axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginPayload) => {
  const res = await api.post("/userLogin", data);
  return res.data;
};
