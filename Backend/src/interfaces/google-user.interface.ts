// interfaces/google-user.interface.ts
/**
 * @interface IGoogleUser
 * @description Represents the user profile returned by Google OAuth
 * after successful authentication using Passport.js.
 *
 * This interface is used to provide type safety for `req.user`
 * in the Google OAuth callback.
 */
export interface IGoogleUser {
  /**
   * @description Unique Google account ID.
   * Example: "116789654321987654321"
   */
  id: string;

  /**
   * @description Full name of the authenticated Google user.
   * Example: "Aman Patel"
   */
  displayName: string;

  /**
   * @description List of email addresses associated with the Google account.
   * Usually contains only one primary email.
   */
  emails: {
    /**
     * @description User's email address.
     * Example: "aman@gmail.com"
     */
    value: string;

    /**
     * @description Indicates whether Google has verified
     * the email address.
     * Optional because it may not always be returned.
     */
    verified?: boolean;
  }[];

  /**
   * @description List of profile photos provided by Google.
   * Usually contains a single profile picture.
   */
  photos: {
    /**
     * @description URL of the user's profile picture.
     * Example:
     * https://lh3.googleusercontent.com/a/ACg8oc...
     */
    value: string;
  }[];
}