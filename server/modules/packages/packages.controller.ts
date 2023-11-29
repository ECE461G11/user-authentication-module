import { Request, Response } from "express";
import {
  IPackages,
  IPackageQuery,
  PackagesDB,
} from "../../models/packagesModel";

var test: IPackageQuery = [
  {
    Name: "Loadash",
    Version: "1.2.0",
  },
  {
    Name: "Package",
    Version: "~1.2.0",
  },
  {
    Name: "OtherPackage",
    Version: "^1.2.0",
  },
  {
    Name: "dummyPackage",
    Version: "1.2.0-3.20.1",
  },
];

export const createPackage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { metadata, data } = req.body;

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
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
