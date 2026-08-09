import cookieParser from "cookie-parser";
import expess from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";
import cors from "cors";


const app = expess();
app.use(expess.json());
app.use(expess.urlencoded({ extended: true }));
// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   })
// );
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth" , authRouter);

export default app;
