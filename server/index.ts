import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./modules/user/user.routes";
import packageRouter from "./modules/packages/packages.routes";
import { MONGO } from "./helpers/common";

const app = express();
app.use(cors());
const port = process.env.PORT || 8000;

app.use(express.json());
app.use("/", userRouter);
app.use("/", packageRouter);

mongoose
  .connect(
    MONGO.mongoURI as string,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any,
  )
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
