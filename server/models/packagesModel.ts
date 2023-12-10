import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./userModel";
import { Actions } from "../helpers/common";

export interface IPackageMetadata {
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
  metrics: IPackageRating;
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
  metrics: {
    RampUp: { type: Number, required: false },
    Correctness: { type: Number, required: false },
    BusFactor: { type: Number, required: false },
    ResponsiveMaintainer: { type: Number, required: false },
    LicenseScore: { type: Number, required: false },
    GoodPinningPractice: { type: Number, required: false },
    PullRequest: { type: Number, required: false },
    NetScore: { type: Number, required: false },
  },
});

export const PackagesDB = mongoose.model<IPackages>("Packages", packagesSchema);
