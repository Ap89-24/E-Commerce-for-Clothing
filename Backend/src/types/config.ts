import dotenv from "dotenv";
dotenv.config();

type Config = {
  readonly MONGO_URI: string;
};

export const config: Config = {
  MONGO_URI: process.env.MONGO_URI || "",
};