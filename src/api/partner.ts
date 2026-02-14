import api from "@/lib/axios";

export const getPartnerOverview = async (params: { range?: number } = {}) => {
  const res = await api.get("/partner/overview", { params });
  return res.data;
};

export interface PartnerEventQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}

export const getPartnerEvents = async (params: PartnerEventQueryParams = {}) => {
  const res = await api.get("/partner/events", { params });
  return res.data;
};

export interface PartnerBookingQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  event?: string;
  event_name?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export const getPartnerBookings = async (params: PartnerBookingQueryParams = {}) => {
  const res = await api.get("/partner/bookings", { params });
  return res.data;
};

export const updatePartnerBookingStatus = async (bookingId: number, status: string) => {
  const res = await api.patch(`/partner/bookings/${bookingId}`, { status });
  return res.data;
};
