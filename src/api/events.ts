import api from "@/lib/axios";

// export interface EventItem {
//   id: number | string;
//   title: string;
//   slug?: string;
//   date?: string;
//   start_date?: string;
//   end_date?: string;
//   time?: string;
//   location?: string;
//   venue?: string;
//   attendees?: number;
//   attending_peoples?: number;
//   status?: string;
//   image?: string;
//   feature_image?: string;
//   featured_image?: string;
//   thumbnail?: string;
//   description?: string;
//   price?: string | number;
//   lineups?: any[];
//   [key: string]: unknown;
// }

export const getEvents = async (): Promise<any> => {
  const response = await api.get("/events");
  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};
