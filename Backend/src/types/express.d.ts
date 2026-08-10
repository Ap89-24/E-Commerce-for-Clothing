import { IGoogleUser } from "../interfaces/google-user.interface.ts";

declare global {
  namespace Express {
    interface User extends IGoogleUser {}
  }
}

export {};