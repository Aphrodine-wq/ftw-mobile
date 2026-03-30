import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import type { AuthUser } from "@src/types";
import { loginApi, registerApi, meApi } from "@src/api/auth";

// SecureStore adapter for Zustand persist
const secureStorage = {
  getItem: async (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (attrs: {
    email: string;
    password: string;
    name: string;
    role: "homeowner" | "contractor" | "subcontractor";
    location?: string;
  }) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { token, user } = await loginApi(email, password);
          set({ token, user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
          throw new Error("Invalid email or password");
        }
      },

      register: async (attrs) => {
        set({ isLoading: true });
        try {
          const { token, user } = await registerApi(attrs);
          set({ token, user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
          throw new Error("Registration failed");
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      hydrate: async () => {
        const { token } = get();
        if (!token) {
          set({ isHydrated: true });
          return;
        }

        try {
          // Race the API call against a 3-second timeout
          const result = await Promise.race([
            meApi(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
          ]);
          set({ user: result.user, isAuthenticated: true, isHydrated: true });
        } catch {
          // Token expired, invalid, or backend unreachable — clear auth
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isHydrated: true,
          });
        }
      },

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: "ftw-auth",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
