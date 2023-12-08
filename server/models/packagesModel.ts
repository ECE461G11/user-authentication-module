import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./userModel";
import { Actions } from "../helpers/common";

interface IPackageMetadata {
  Name: string;
  Version: string;
  ID: string;
}

interface IPackageData {
  Content: string;
  URL: string;
  JSProgram: string;
}

export interface IPackageHistoryEntry {
  User: IUser;
  Date: string;
  PackageMetadata: IPackageMetadata;
  Action: Actions;
}

export interface IPackageRating {
  RampUp: number;
  Correctness: number;
  BusFactor: number;
  ResponsiveMaintainer: number;
  LicenseScore: number;
  GoodPinningPractice: number;
  PullRequest: number;
  NetScore: number;
}

interface IPackageQueryItem {
  Name: string;
  Version: string;
}

export type IPackageQuery = IPackageQueryItem[];

export interface IPackages extends Document {
  metadata: IPackageMetadata;
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
