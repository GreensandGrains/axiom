import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator?: string;
  avatar?: string;
  email?: string;
  isAdmin?: boolean;
  coins?: number;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user: user as User | null,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}

export function loginWithDiscord(rememberMe: boolean = false) {
  // Redirect to Discord OAuth with remember me parameter
  const rememberParam = rememberMe ? '?remember=true' : '';
  window.location.href = `/api/auth/discord${rememberParam}`;
}

export function logout() {
  // Redirect to logout endpoint
  window.location.href = "/api/auth/logout";
}

