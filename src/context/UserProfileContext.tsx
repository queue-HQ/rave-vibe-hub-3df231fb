import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserProfile } from "@/api/user";
import { logout } from "@/lib/logout";

interface UserProfile {
  display_name?: string;
  username?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface UserProfileContextValue {
  user: UserProfile | null;
  role: string | null;
  isAdmin: boolean;
  isSubscriber: boolean;
  isLoading: boolean;
  error: string | null;
  hasTriedFetching: boolean;
  refetch: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined
);

export const UserProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedFetching, setHasTriedFetching] = useState(false);
  const lastFetchAtRef = useRef(0);
  const inflightRef = useRef<Promise<void> | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const redirectToLogin = useCallback(() => {
    const from = `${location.pathname}${location.search}${location.hash}`;
    navigate("/login", { replace: true, state: { from } });
  }, [location.pathname, location.search, location.hash, navigate]);

  const fetchProfile = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setUser(null);
      setIsLoading(false);
      setHasTriedFetching(true);
      return;
    }

    const now = Date.now();
    const minIntervalMs = 30_000;
    if (inflightRef.current) {
      return inflightRef.current;
    }
    if (lastFetchAtRef.current && now - lastFetchAtRef.current < minIntervalMs) {
      setHasTriedFetching(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    lastFetchAtRef.current = now;

    const task = (async () => {
      try {
        const res = await getUserProfile();

        if (res?.success && res.user) {
          setUser(res.user);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(res.user));
          }
        } else {
          setUser(null);
          setError(res?.message ?? "Session expired");
          logout();
          redirectToLogin();
        }
      } catch (err) {
        setUser(null);
        setError("Unable to load profile");
        logout();
        redirectToLogin();
      } finally {
        inflightRef.current = null;
        setIsLoading(false);
        setHasTriedFetching(true);
      }
    })();

    inflightRef.current = task;
    return task;
  }, [redirectToLogin]);

  useEffect(() => {
    if (!hasTriedFetching) {
      fetchProfile();
    }
  }, [fetchProfile, hasTriedFetching]);

  const role = useMemo(() => {
    if (!user?.role) return null;
    return String(user.role).split(',')[0]?.trim() || null;
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      role,
      isAdmin: role === 'administrator',
      isSubscriber: role === 'subscriber',
      isLoading,
      error,
      hasTriedFetching,
      refetch: fetchProfile,
    }),
    [user, role, isLoading, error, hasTriedFetching, fetchProfile]
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);

  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }

  return context;
};
