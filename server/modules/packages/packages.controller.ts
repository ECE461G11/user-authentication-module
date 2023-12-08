import { Request, Response } from "express";
import {
  IPackages,
  IPackageQuery,
  PackagesDB,
} from "../../models/packagesModel";
import axios from "axios";

const convertNpmToGitHub = async (npmUrl: string): Promise<string> => {
  try {
    const packageNameMatch = npmUrl.match(
      /^https:\/\/www\.npmjs\.com\/package\/([a-z0-9\-_]+)/i,
    );

    if (!packageNameMatch || packageNameMatch.length < 2) {
      throw new Error("Invalid npm URL format.");
    }

    const packageName = packageNameMatch[1];
    const npmResponse = await axios.get(
      `https://registry.npmjs.org/${packageName}`,
    );
    const repositoryUrl = npmResponse.data.repository?.url;

    if (!repositoryUrl) {
      throw new Error("No repository URL found in npm package data.");
    }

    const githubUrlMatch = repositoryUrl.match(
      /github\.com\/([a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+)/i,
    );

    if (!githubUrlMatch || githubUrlMatch.length < 1) {
      throw new Error(
        "Invalid GitHub repository URL format in npm package data.",
      );
    }

    return `https://${githubUrlMatch[0]}`;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
};

export const createPackage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { metadata, data } = req.body;
    const debloat = req.query.debloat;
    if (debloat) {
      console.log('debloat', debloat);
    }

    if (!metadata) {
      res.status(400).json({ message: "No metadata provided" });
      return;
    }
    const existingPackage = await PackagesDB.findOne({
      "metadata.ID": metadata.ID,
    });
    console.log("existingPackage", existingPackage);
    if (existingPackage) {
      res.status(403).json({ message: "Package already exists" });
      return;
    }

    const newPackage: IPackages = new PackagesDB({
      metadata,
      data,
    });
    console.log(newPackage);
    await newPackage.save();
    res
      .status(201)
      .json({ metadata, message: "Package data created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const getPackages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!Array.isArray(req.body)) {
      console.error("Request body must be an array");
    }
    const packageQueries = req.body as IPackageQuery;

    const offset = parseInt(req.query.offset as string) || 0;
    const queryFilter = packageQueries.map((query) => ({
      "metadata.Name": query.Name,
      "metadata.Version": query.Version,
    }));

    const packages = await PackagesDB.find({
      $or: queryFilter,
    })
      .skip(offset)
      .limit(10);

    res.header("offset", String(offset + packages.length));
    console.log("packages", packages);
    packages.forEach((item) => {
      console.log("package", item);
    });
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const resetRegistry = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await PackagesDB.collection.drop();

    if (result) {
      res.status(200).json({ message: "Registry is reset." });
      return;
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes("ns not found")) {
      res
        .status(200)
        .json({ message: "Collection does not exist or already dropped." });
      return;
    }
    res.status(500).send("Internal Server Error");
  }
};
