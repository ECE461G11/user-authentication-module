export const MONGO = {
  mongoURI: process.env.MONGO_URI,
};

export enum Actions {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DOWNLOAD = "DOWNLOAD",
  RATE = "RATE",
}

export const JWTKey = {
  jwtSecret: process.env.JWT_SECRET,
};

export const PORT = process.env.PORT;

export const SALT = process.env.HASH_SALT;

export const AWSKeys = {
  region: process.env.ACCESS_KEY,
  accessKey: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  packagesBucket: process.env.PACKAGES_BUCKET,
};
