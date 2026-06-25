export type AppUserRole = "admin" | "hr" | "manager" | "employee";

export interface User {
  id: string;
  email: string;
  role: AppUserRole;
  created_at: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: AppUserRole;
}