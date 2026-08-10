// interfaces/google-user.interface.ts

export interface IGoogleUser {
  id: string;
  displayName: string;
  emails: {
    value: string;
    verified?: boolean;
  }[];
  photos: {
    value: string;
  }[];
}