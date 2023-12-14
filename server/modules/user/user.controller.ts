import { Request, Response } from "express";
import { IUser, IAuthenticationRequest, UserDB } from "../../models/userModel";
import { SALT, JWTKey } from "../../helpers/common";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const userAuthentication = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { User, Secret } = req.body as IAuthenticationRequest;
    if (!User || !Secret) {
      res.status(400).json({
        message:
          "There is missing field(s) in the AuthenticationRequest or it is formed improperly.",
      });
      return;
    }

    const existingUser = await UserDB.findOne({ "User.name": User.name });
    if (!existingUser) {
      res.status(401).json({ message: "The user or password is invalid." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      Secret.password,
      existingUser.Secret.password,
    );
    if (!isPasswordValid) {
      res.status(401).json({ message: "The user or password is invalid." });
      return;
    }

    const token = jwt.sign(
      {
        sub: existingUser._id,
        name: existingUser.User.name,
        isAdmin: existingUser.User.isAdmin,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * (10 * 60),
      },
      JWTKey.jwtSecret as string,
    );

    res.status(200).json('"bearer ' + token + '"');
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const userRegistration = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { User, Secret } = req.body as IAuthenticationRequest;

    if (!User || !Secret || !User.name || !Secret.password) {
      res.status(400).json({
        message: "Missing fields in the registration request.",
      });
      return;
    }

    const existingUser = await UserDB.findOne({ "User.name": User.name });
    if (existingUser) {
      res.status(409).json({ message: "User already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(parseInt(SALT as string));
    const hashedPassword = await bcrypt.hash(Secret.password, salt);

    const newUser = new UserDB({
      User,
      Secret: { password: hashedPassword },
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
