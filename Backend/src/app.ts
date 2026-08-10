import cookieParser from "cookie-parser";
import cors from "cors";
import expess from "express";
import morgan from "morgan";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import authRouter from "./routes/auth.route.js";
import { config } from "./types/config.js";

const app = expess();
app.use(expess.json());
app.use(expess.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));

app.use(passport.initialize());
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile as Express.User);
    }
  )
);

app.use("/api/auth", authRouter);

export default app;
