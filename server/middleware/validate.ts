import ApiError from "../helpers/ApiError";
import pick from "../helpers/pick";
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { UserDB } from "../models/userModel";
import jwt, { JwtPayload } from "jsonwebtoken";

export const validate = (schema: any) => (req: any, res: any, next: any) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" } })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((details: any) => details.message)
      .join(", ");
    res.status(400).json({ message: errorMessage });
    return next(new ApiError(400, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

interface HeaderOptions {
  requireContentType?: boolean;
  requireToken?: boolean;
}

export const verifyHeaders = (options: HeaderOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (
      options.requireContentType &&
      req.headers["content-type"] !== "application/json"
    ) {
      return next(new ApiError(400, "Invalid or missing Content-Type header"));
    }

    if (options.requireToken) {
      const token = req.headers["x-authorization"];
      if (!token || Array.isArray(token)) {
        return next(new ApiError(401, "Invalid token format"));
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!,
        ) as JwtPayload;
        if (typeof decoded === "object" && "username" in decoded) {
          const username = decoded.username;
          const existingUser = await UserDB.findOne({ username: username });
          if (existingUser) {
            return next();
          } else {
            res.status(401).json({ message: "User not found" });
            return;
          }
        } else {
          res.status(401).json({ message: "Invalid token structure" });
          return;
        }
      } catch (error) {
        return next(new ApiError(401, "Invalid or expired token"));
      }
    } else {
      next();
    }
  };
};
