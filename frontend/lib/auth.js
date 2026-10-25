import { tokenStore } from '@/lib/api';

export function signOut() {
  tokenStore.clear();
  window.location.assign('/login');
}