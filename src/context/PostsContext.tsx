import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getPosts, type PostItem } from "@/api/posts";
import slugify from "@/lib/slugify";

interface PostsContextValue {
  posts: PostItem[];
  isLoading: boolean;
  error: string | null;
  hasTriedFetching: boolean;
  refetch: () => Promise<void>;
}

const PostsContext = createContext<PostsContextValue | undefined>(undefined);

const PostsProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedFetching, setHasTriedFetching] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPosts();
      const normalized = data.map((post) => {
        const fallbackSlug = post.title ? slugify(String(post.title)) : String(post.id);

        return {
          ...post,
          slug: post.slug ?? fallbackSlug,
        } as PostItem;
      });

      setPosts(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load posts");
    } finally {
      setHasTriedFetching(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasTriedFetching) {
      fetchPosts();
    }
  }, [fetchPosts, hasTriedFetching]);

  const value = useMemo(
    () => ({ posts, isLoading, error, hasTriedFetching, refetch: fetchPosts }),
    [posts, isLoading, error, hasTriedFetching, fetchPosts]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

const usePosts = () => {
  const context = useContext(PostsContext);

  if (!context) {
    throw new Error("usePosts must be used within PostsProvider");
  }

  return context;
};

export { PostsProvider, usePosts };
