import ApiError from "../helpers/ApiError";
import pick from "../helpers/pick";
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { UserDB } from "../models/userModel";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWTKey } from "../helpers/common";

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
  requireAdminAccess?: boolean;
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
      let header =
        req.headers.authorization || req["headers"]["x-authorization"];
      console.log("Header", header);
      if (!header || Array.isArray(header)) {
        return next(
          new ApiError(
            401,
            "Authorization header is missing or incorrect format",
          ),
        );
      }
      header = header.replace(/["']/g, "");
      console.log("Cleaned header", header");
      const parts = header.split(" ");
      if (parts.length !== 2 || parts[0] !== "bearer") {
        return next(new ApiError(401, "Invalid token format"));
      }
      const token = parts[1];
      console.log("token", token);

      try {
        const decoded = jwt.verify(
          token,
          JWTKey.jwtSecret as string,
        ) as JwtPayload;
        console.log("decoded", decoded);
        if (typeof decoded === "object" && "name" in decoded) {
          const existingUser = await UserDB.findOne({
            "User.name": decoded.name,
          });
          if (existingUser) {
            if (options.requireAdminAccess) {
              const isAdmin = decoded.isAdmin;
              if (isAdmin) {
                return next();
              } else {
                res.status(401).json({
                  message: "User does not have permission for this action",
                });
                return;
              }
            } else {
              return next();
            }
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
