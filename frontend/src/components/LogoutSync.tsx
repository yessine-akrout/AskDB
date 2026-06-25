'use client';

import { useEffect } from 'react';

export default function LogoutSync() {
  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get('logout') === '1') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      url.searchParams.delete('logout');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  return null;
}