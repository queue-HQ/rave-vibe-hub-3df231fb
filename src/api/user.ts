import api from "@/lib/axios";

export const getUserProfile = async () => {
  const res = await api.get("/userProfile");
  return res.data;
};
