import express from "express";
import connectDB from "./config/db.js";
import { registerUser, loginUser } from "./controllers/userAuthController.js";
import cors from "cors";
import router from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import todoRouter from "./routes/todo-routes.js";
// import { UAParser } from "ua-parser-js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

connectDB();

app.use("/user", router);
app.use("/api/todos", todoRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
