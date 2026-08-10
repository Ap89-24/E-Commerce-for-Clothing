import { IGoogleUser } from "../interfaces/google-user.interface.ts";
import type { IUser } from "../models/user.model.ts";

/**
 * @description Extend the default Express `User` interface with our
 * custom Google OAuth user profile.
 *
 * Passport.js attaches the authenticated user to `req.user`, but by
 * default Express doesn't know what properties this user contains.
 *
 * By extending `Express.User`, TypeScript recognizes properties like:
 * - id
 * - displayName
 * - emails
 * - photos
 *
 * This allows us to safely access `req.user` throughout the application
 * without repeatedly using type assertions.
 *
 * Example:
 * const { displayName, emails } = req.user;
 */

declare global {
  namespace Express {
    interface User extends IGoogleUser { }
    interface Request {
      currentUser?: IUser;
    }
  }
}

export {};