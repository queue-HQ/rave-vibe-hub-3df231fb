import api from "@/lib/axios";

export interface PostItem {
  id: number | string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  thumbnail?: string;
  date?: string;
  author?: string;
  categories?: string[] | { id: number | string; name: string; slug?: string }[];
  tags?: string[] | { id: number | string; name: string; slug?: string }[];
  [key: string]: unknown;
}

export const getPosts = async (): Promise<PostItem[]> => {
  const response = await api.get("/posts");
  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.posts)) {
    return payload.posts;
  }

  if (Array.isArray(payload?.data?.posts)) {
    return payload.data.posts;
  }

  return [];
};
