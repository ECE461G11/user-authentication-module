import { Request, Response } from "express";
import { IUser, UserDB } from "../../models/userModel";
import { SALT } from "../../helpers/common";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const userRegistration = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      res
        .status(400)
        .json({ message: "Username, password and role are required" });
      return;
    }

    const existingUser = await UserDB.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(parseInt(SALT!));
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: IUser = new UserDB({
      username,
      password: hashedPassword,
      role: role as any,
    });

    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      user: { username: newUser.username, role: newUser.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }

    const existingUser = await UserDB.findOne({ username });
    if (!existingUser) {
      res.status(400).json({ message: "User does not exist" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordCorrect) {
      res
        .status(400)
        .json({ message: "Authentication failed, invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { username: existingUser.username, role: existingUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    );
    res.status(200).json({
      message: "User logged in successfully",
      user: { username: existingUser.username, role: existingUser.role },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
