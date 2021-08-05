import { UserData } from '../pages';

declare global {
  namespace Express {
    interface User extends UserData {}
  }
}
