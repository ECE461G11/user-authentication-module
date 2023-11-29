exports.MONGO = {
  MONGO_URI: process.env.MONGO_URI,
};

export enum Roles {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

export const SALT = process.env.HASH_SALT;
