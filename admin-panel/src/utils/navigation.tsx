import { IRoute } from '@/types/navigation';

export const isWindowAvailable = () => typeof window !== 'undefined';

export const getActiveRoute = (routes: IRoute[], pathname: string): string => {
  const activeRoute = routes.find((route) =>
    pathname?.includes(route.layout + route.path),
  );
  return activeRoute?.name || 'Dashboard';
};

export const getActiveNavbar = (
  routes: IRoute[],
  pathname: string,
): boolean => {
  const activeRoute = routes.find((route) =>
    pathname?.includes(route.layout + route.path),
  );
  return activeRoute?.secondary || false;
};