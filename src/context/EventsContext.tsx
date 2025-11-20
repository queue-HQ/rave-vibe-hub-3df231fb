import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getEvents, type EventItem } from "@/api/events";
import slugify from "@/lib/slugify";

interface EventsContextValue {
  events: EventItem[];
  isLoading: boolean;
  error: string | null;
  hasTriedFetching: boolean;
  refetch: () => Promise<void>;
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

export const EventsProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedFetching, setHasTriedFetching] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getEvents();
      const normalized = data.map((event) => {
        const fallbackSlug = event.title ? slugify(String(event.title)) : String(event.id);

        return {
          ...event,
          slug: event.slug ?? fallbackSlug,
        } as EventItem;
      });

      setEvents(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load events");
    } finally {
      setHasTriedFetching(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasTriedFetching) {
      fetchEvents();
    }
  }, [fetchEvents, hasTriedFetching]);

  const value = useMemo(
    () => ({
      events,
      isLoading,
      error,
      hasTriedFetching,
      refetch: fetchEvents,
    }),
    [events, isLoading, error, hasTriedFetching, fetchEvents]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEvents = () => {
  const context = useContext(EventsContext);

  if (!context) {
    throw new Error("useEvents must be used within EventsProvider");
  }

  return context;
};
