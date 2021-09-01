import create from "zustand";
import { devtools, persist } from "zustand/middleware";

export const store = (set: any) => ({
  username: null,
  setUsername: (username: string | null) => set({ username }),
  role: null,
  setRole: (role: string | null) => set({ role }),
});

const useStore = create(devtools(persist(store, { name: "dataStore" })));

export default useStore;
