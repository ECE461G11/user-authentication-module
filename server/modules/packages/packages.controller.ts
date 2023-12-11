import { Request, Response, NextFunction } from "express";
import {
  IPackages,
  IPackageQuery,
  IPackageRating,
  PackagesDB,
} from "../../models/packagesModel";
import axios from "axios";
import {
  uploadToS3,
  clearS3Bucket,
} from "../../middleware/s3_Package_Functions";
import {
  getBusFactor,
  getCorrectness,
  getRampUp,
  getResponsive,
  getLicense,
  getGoodPinningPractice,
  getPullRequest,
} from "./ratings.controller";

export const getPackagesRating = async (
  repoUrl: string,
): Promise<IPackageRating> => {
  const BusFactor = await getBusFactor(repoUrl);
  const Correctness = await getCorrectness(repoUrl);
  const RampUp = await getRampUp(repoUrl);
  const ResponsiveMaintainer = await getResponsive(repoUrl);
  const LicenseScore = await getLicense(repoUrl);
  const GoodPinningPractice = await getGoodPinningPractice(repoUrl);
  const PullRequest = await getPullRequest(repoUrl);
  console.log("GoodPinningPractice", GoodPinningPractice);
  console.log("PullRequest", PullRequest);
  const NetScore =
    LicenseScore * 0.05 +
    ResponsiveMaintainer * 0.3 +
    BusFactor * 0.4 +
    Correctness * 0.125 +
    RampUp * 0.125;

  const packageRating: IPackageRating = {
    BusFactor,
    Correctness,
    RampUp,
    ResponsiveMaintainer,
    LicenseScore,
    GoodPinningPractice,
    PullRequest,
    NetScore,
  };

  return packageRating;
};

export const createPackage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { metadata, data } = req.body;
    const debloat = req.query.debloat;
    console.log("debloat", debloat);

    if (!metadata || !data) {
      res.status(400).json({ message: "No metadata or data provided" });
      return;
    }

    const hasContent = data.Content !== undefined && data.Content !== "";
    const hasURL = data.URL !== undefined && data.URL !== "";

    if ((hasContent && hasURL) || (!hasContent && !hasURL)) {
      res
        .status(400)
        .json({ message: "Either Content or URL must be set, but not both." });
      return;
    }

    const existingPackage = await PackagesDB.findOne({
      "metadata.ID": metadata.ID,
    });

    if (existingPackage) {
      if (metadata.Version !== existingPackage.metadata.Version) {
        existingPackage.metadata.Version = metadata.Version;
      } else {
        res.status(400).json({ message: "Package already exists" });
        return;
      }
    }

    if (hasContent) {
      const content = data.Content;
      let buffer = Buffer.from(content, "base64");
      if (debloat === "true") {
        const upload = await uploadToS3(buffer, metadata);
        console.log("upload", upload);
      }
    } else if (hasURL) {
      const ratings = await getPackagesRating(data.URL);
      console.log("Ratings", ratings);
      if (
        ratings.BusFactor >= 0.5 &&
        ratings.RampUp >= 0.5 &&
        ratings.Correctness >= 0.5 &&
        ratings.LicenseScore >= 0.5 &&
        ratings.ResponsiveMaintainer >= 0.5 &&
        ratings.NetScore >= 0.5
      ) {
        const response = await axios.get(data.URL, {
          responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data, "base64");
        if (debloat === "true") {
          const upload = await uploadToS3(buffer, metadata);
          console.log("upload", upload);
        }
      } else {
        res.status(400).json({ message: "Package does not meet the criteria" });
        return;
      }
    }

    const newPackage: IPackages = new PackagesDB({
      metadata,
      data,
    });
    await newPackage.save();
    res
      .status(201)
      .json({ metadata, message: "Package data created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};

export const getPackagesByQuery = async (
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

export const resetRegistry = async (res: Response): Promise<void> => {
  try {
    await PackagesDB.collection.drop();
    await clearS3Bucket();

    res.status(200).json({ message: "Registry is reset." });
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

export const getAllPackages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const packages = await PackagesDB.find({}).skip(offset).limit(10);

    res.header("offset", String(offset + packages.length));
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const getPackageRating = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "No package ID provided" });
      return;
    }

    const existingPackage = await PackagesDB.findOne({
      "metadata.ID": id,
    });

    if (!existingPackage) {
      res.status(404).json({ message: "Package does not exist" });
      return;
    }
    res.status(200).json(existingPackage.metrics);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const getPackageByID = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "No package ID provided" });
      return;
    }

    const existingPackage = await PackagesDB.findOne({
      "metadata.ID": id,
    });

    if (!existingPackage) {
      res.status(404).json({ message: "Package does not exist" });
      return;
    }
    //const key = `${existingPackage.metadata.ID}-${existingPackage.metadata.Name}-${existingPackage.metadata.Version}.zip`;
    
    res.status(200).json(existingPackage);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export const updateVersionByID = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { metadata, data } = req.body;

    if (!id) {
      res.status(400).json({ message: "No package ID provided" });
      return;
    }

    if (!metadata || !data) {
      res.status(400).json({ message: "No metadata or data provided" });
      return;
    }

    const existingPackage = await PackagesDB.findOne({
      "metadata.ID": id,
    });

    if (!existingPackage) {
      res.status(404).json({ message: "Package does not exist" });
      return;
    }

    existingPackage.metadata = metadata;
    existingPackage.data = data;
    await existingPackage.save();

    res.status(200).json({ message: "Package updated successfully" });
    //next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}