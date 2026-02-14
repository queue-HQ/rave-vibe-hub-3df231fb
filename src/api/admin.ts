import api from "@/lib/axios";

export const getAdminOverview = async (params: { range?: number } = {}) => {
  const res = await api.get("/admin/overview", { params });
  return res.data;
};

export interface EventQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface PostQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}

export const getAdminEvents = async (params: EventQueryParams = {}) => {
  const res = await api.get("/admin/events", { params });
  return res.data;
};

export const createAdminEvent = async (data: Record<string, unknown>) => {
  const res = await api.post("/admin/events", data);
  return res.data;
};

export const getAdminEventDetail = async (id: number) => {
  const res = await api.get(`/admin/events/${id}`);
  return res.data;
};

export const updateAdminEvent = async (id: number, data: Record<string, unknown>) => {
  const res = await api.patch(`/admin/events/${id}`, data);
  return res.data;
};

export const deleteAdminEvent = async (id: number) => {
  const res = await api.delete(`/admin/events/${id}`);
  return res.data;
};

export const bulkDeleteAdminEvents = async (ids: number[]) => {
  const res = await api.post("/admin/events/bulk-delete", { ids });
  return res.data;
};

export const getAdminPosts = async (params: PostQueryParams = {}) => {
  const res = await api.get("/admin/posts", { params });
  return res.data;
};

export const createAdminPost = async (data: Record<string, unknown>) => {
  const res = await api.post("/admin/posts", data);
  return res.data;
};

export const getAdminPostDetail = async (id: number) => {
  const res = await api.get(`/admin/posts/${id}`);
  return res.data;
};

export const updateAdminPost = async (id: number, data: Record<string, unknown>) => {
  const res = await api.patch(`/admin/posts/${id}`, data);
  return res.data;
};

export const deleteAdminPost = async (id: number) => {
  const res = await api.delete(`/admin/posts/${id}`);
  return res.data;
};

export interface PublicUploadResponse {
  success: boolean;
  url?: string;
  message?: string;
}

export const uploadPublicFile = async (file: File): Promise<PublicUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/public-file-upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export interface BookingQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  event?: string;
  event_name?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  gender?: string;
  limit?: number;
}

export const getAdminBookings = async (params: BookingQueryParams = {}) => {
  const res = await api.get("/admin/bookings", { params });
  return res.data;
};

export const exportAdminBookings = async (params: BookingQueryParams = {}) => {
  const res = await api.get("/admin/bookings/export", {
    params,
    responseType: "blob",
  });
  return res.data as Blob;
};

export const updateAdminBookingStatus = async (id: number, status: string) => {
  const res = await api.patch(`/admin/bookings/${id}`, { status });
  return res.data;
};

export const deleteAdminBooking = async (id: number) => {
  const res = await api.delete(`/admin/bookings/${id}`);
  return res.data;
};

export const bulkDeleteAdminBookings = async (ids: number[]) => {
  const res = await api.post("/admin/bookings/bulk-delete", { ids });
  return res.data;
};

export const getAdminUsers = async (params: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  gender?: string;
  event_type?: string;
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

export const getAdminMedia = async (params: { page?: number; per_page?: number; search?: string; type?: string } = {}) => {
  const res = await api.get("/admin/media", { params });
  return res.data;
};

export const deleteAdminMedia = async (id: number) => {
  const res = await api.delete(`/admin/media/${id}`);
  return res.data;
};

export const bulkDeleteAdminMedia = async (ids: number[]) => {
  const res = await api.post("/admin/media/bulk-delete", { ids });
  return res.data;
};

export interface PartnerQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export const getAdminPartners = async (params: PartnerQueryParams = {}) => {
  const res = await api.get("/admin/partners", { params });
  return res.data;
};

export type CreatePartnerPayload = {
  full_name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  password: string;
  confirm_password: string;
};

export const createAdminPartner = async (data: CreatePartnerPayload) => {
  const res = await api.post("/admin/partners", data);
  return res.data;
};
