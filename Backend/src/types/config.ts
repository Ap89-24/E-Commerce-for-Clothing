import dotenv from "dotenv";
dotenv.config();

/**
 * @description Loads and validates all required environment variables
 * during application startup. If any required configuration is missing,
 * the application throws an error to prevent running with an invalid setup.
 * Exports a strongly typed, immutable configuration object for use
 * throughout the application.
 */

type Config = {
  readonly MONGO_URI: string;
  readonly JWT_SECRET: string;
  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_CLIENT_SECRET: string;
  readonly GOOGLE_CALLBACK_URL: string;
  readonly IMAGEKIT_PRIVATE_KEY: string;
  readonly RAZORPAY_KEY_ID: string;
  readonly RAZORPAY_KEY_SECRET: string;
};

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined in the environment variables");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET is not defined in the environment variables");
}

if (!process.env.GOOGLE_CALLBACK_URL) {
  throw new Error("GOOGLE_CALLBACK_URL is not defined in the environment variables");
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in the environment variables");
}

if (!process.env.RAZORPAY_KEY_ID) {
  throw new Error("RAZORPAY_KEY_ID is not defined in the environment variables");
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("RAZORPAY_KEY_SECRET is not defined in the environment variables");
}

export const config: Config = {
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "",
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || "",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
};
