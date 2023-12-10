import mongoose, { Schema, Document } from "mongoose";

interface IPackageMetaData {
  Name: string;
  Version: string;
  ID: string;
}

interface IPackageData {
  Content: string;
  URL: string;
  JSProgram: string;
}

interface IPackageQueryItem {
  Name: string;
  Version: string;
}

export type IPackageQuery = IPackageQueryItem[];

export interface IPackages extends Document {
  metadata: IPackageMetaData;
  data: IPackageData;
}

const packagesSchema = new Schema<IPackages>({
  metadata: {
    Name: { type: String, required: true },
    Version: { type: String, required: false },
    ID: { type: String, required: false },
  },
  data: {
    Content: { type: String, required: false },
    URL: { type: String, required: false },
    JSProgram: { type: String, required: false },
  },
});

export const PackagesDB = mongoose.model<IPackages>("Packages", packagesSchema);
