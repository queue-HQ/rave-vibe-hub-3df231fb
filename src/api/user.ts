import api from "@/lib/axios";

export const getUserProfile = async () => {
  const res = await api.get("/userProfile");
  return res.data;
};


export const getBookings = async () => {
  const res = await api.get("/my-bookings");
  return res.data;
};

export const getTicketByPassId = async (passId: string) => {
  const res = await api.get(`/ticket/${passId}`);
  return res.data;
};

export const getQrDetails = async (qrId: string) => {
  const res = await api.get("/getQrDetails", {
    params: { id: qrId },
  });
  return res.data;
};
