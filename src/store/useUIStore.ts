import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebarCollapsed: () =>
    set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
}));
