import { UserRole } from "@prisma/client";

export interface IUserPayload {
  id: number;
  email: string;
  role: UserRole;
  isVerified: boolean;
}


declare global {
  namespace Express {
    interface User extends IUserPayload {}
  }
}