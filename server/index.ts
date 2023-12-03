import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./modules/user/user.routes";
import packageRouter from "./modules/packages/packages.routes";

dotenv.config();
const app = express();
app.use(cors());
const port = process.env.PORT || 8000;

app.use(express.json());
app.use("/api/user", userRouter);
app.use("/", packageRouter);

mongoose
  .connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any)
  .then(() => {
    console.log("MongoDB connected!");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
