/**
 * React Query client configuration and API request utilities.
 *
 * The app uses an offline-first approach: the server URL is optional.
 * When EXPO_PUBLIC_DOMAIN is set, queries will attempt to fetch from the
 * Express server; otherwise the app runs entirely offline with embedded data.
 */
import { fetch } from "expo/fetch";
import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string | null} The API base URL, or null if offline mode
 */
export function getApiUrl(): string | null {
  const host = process.env.EXPO_PUBLIC_DOMAIN;

  if (!host) {
    return null;
  }

  // Always use http — the Express server does not use SSL
  return `http://${host}`;
}

/** Throw a descriptive error if the HTTP response indicates failure */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const baseUrl = getApiUrl();

      if (!baseUrl) {
        throw new Error("Cannot fetch from server in offline mode");
      }

      const url = new URL(queryKey.join("/") as string, baseUrl);

      const res = await fetch(url.toString(), {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

/**
 * Shared QueryClient with aggressive caching (staleTime: Infinity)
 * since course data rarely changes during a session.
 * Retry is disabled to avoid hanging on offline mode.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
