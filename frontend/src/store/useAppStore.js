import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * FIX for the auth loop (Dashboard ↔ Login bounce):
 *
 * Zustand `persist` rehydrates from localStorage asynchronously.
 * On the very first React render, isAuthenticated = false (store not
 * yet loaded), so PrivateRoute redirects to /login. A few ms later
 * hydration completes, isAuthenticated = true, and the app bounces
 * back to /dashboard — creating an infinite redirect loop.
 *
 * Solution: track `_hasHydrated`. The <HydrationGate> in App.jsx
 * renders a loading spinner until this flag flips to true, so NO
 * routing decision is made until the store is fully loaded.
 */

export const useAppStore = create(
  persist(
    (set) => ({
      // Auth
      user: null,
      token: null,
      isAuthenticated: false,

      // UI
      language: 'en',
      chatbotLanguage: 'en',
      sidebarCollapsed: false,
      autoSpeak: true,
      activeSpeakingId: null,

      // Liked responses
      likedResponses: [],


      // Hydration flag (never persisted to localStorage)
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),

      // Auth actions
      login: (user, token) => {
        localStorage.setItem('ag_token', token);
        set({ user, token, isAuthenticated: true, language: user.default_language || 'en' });
      },
      logout: () => {
        localStorage.removeItem('ag_token');
        set({ user: null, token: null, isAuthenticated: false, language: 'en' });
      },
      setUser: (user) => set({ user }),

      // UI actions
      setLanguage: (lang) => set({ language: lang }),
      setChatbotLanguage: (lang) => set({ chatbotLanguage: lang }),
      toggleSidebar: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
      setAutoSpeak: (val) => set({ autoSpeak: val }),
      setActiveSpeakingId: (val) => set({ activeSpeakingId: val }),

      // Liked responses actions
      addLikedResponse: (resp) => set((state) => {
        if (state.likedResponses.some(r => r.id === resp.id)) return {};
        return { likedResponses: [...state.likedResponses, resp] };
      }),
      removeLikedResponse: (id) => set((state) => ({
        likedResponses: state.likedResponses.filter(r => r.id !== id)
      })),
    }),
    {
      name: 'agroguardian-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        language: state.language,
        chatbotLanguage: state.chatbotLanguage,
        sidebarCollapsed: state.sidebarCollapsed,
        likedResponses: state.likedResponses,
        // _hasHydrated intentionally excluded — never persisted
      }),
      onRehydrateStorage: () => (state) => {
        // Called once after localStorage hydration is complete
        if (state) state.setHasHydrated(true);
      },
    }
  )
);

// ─── Non-persisted analysis results store ────────────────────────────
import { create as createStore } from 'zustand';

export const useAnalysisStore = createStore((set) => ({
  diseaseResult: null, diseaseLoading: false, diseaseError: null,
  setDiseaseResult: (r) => set({ diseaseResult: r }),
  setDiseaseLoading: (l) => set({ diseaseLoading: l }),
  setDiseaseError: (e) => set({ diseaseError: e }),
  clearDisease: () => set({ diseaseResult: null, diseaseError: null }),

  pestResult: null, pestLoading: false, pestError: null,
  setPestResult: (r) => set({ pestResult: r }),
  setPestLoading: (l) => set({ pestLoading: l }),
  setPestError: (e) => set({ pestError: e }),
  clearPest: () => set({ pestResult: null, pestError: null }),

  yieldResult: null, yieldLoading: false, yieldError: null,
  setYieldResult: (r) => set({ yieldResult: r }),
  setYieldLoading: (l) => set({ yieldLoading: l }),
  setYieldError: (e) => set({ yieldError: e }),
  clearYield: () => set({ yieldResult: null, yieldError: null }),
}));
