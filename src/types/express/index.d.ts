import { IUserPayload } from '../../interfaces/IUserPayload';

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}
