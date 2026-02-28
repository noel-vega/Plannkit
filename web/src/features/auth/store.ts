import { create } from 'zustand'
import type { Me } from './types';

type AuthStore = {
  accessToken: string;
  me: Me
}

export const useAuth = create<AuthStore>(() => ({
  accessToken: "",
  me: {
    isPrivate: false,
    id: Infinity,
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    avatar: null
  }
}))
