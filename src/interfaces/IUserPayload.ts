export interface IUserPayload {
    id: number;
    role: 'USER' | 'STORE_ADMIN' | 'SUPER_ADMIN';
    email?: string;
  }
  