import api from "@/lib/axios";

export const getAdminOverview = async (params: { range?: number } = {}) => {
  const res = await api.get("/admin/overview", { params });
  return res.data;
};

export const getAdminEvents = async (params: { page?: number; per_page?: number } = {}) => {
  const res = await api.get("/admin/events", { params });
  return res.data;
};

export const createAdminEvent = async (data: Record<string, unknown>) => {
  const res = await api.post("/admin/events", data);
  return res.data;
};

export const getAdminBookings = async (params: { limit?: number } = {}) => {
  const res = await api.get("/admin/bookings", { params });
  return res.data;
};

export const updateAdminBookingStatus = async (id: number, status: string) => {
  const res = await api.patch(`/admin/bookings/${id}`, { status });
  return res.data;
};

export const getAdminUsers = async (params: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
} = {}) => {
  const res = await api.get("/admin/users", { params });
  return res.data;
};

export const createAdminUser = async (data: Record<string, unknown>) => {
  const res = await api.post("/admin/users", data);
  return res.data;
};

export const getAdminUserDetail = async (id: number) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

export const updateAdminUser = async (id: number, data: Record<string, unknown>) => {
  const res = await api.patch(`/admin/users/${id}`, data);
  return res.data;
};

export const getAdminMedia = async (params: { page?: number; per_page?: number } = {}) => {
  const res = await api.get("/admin/media", { params });
  return res.data;
};
