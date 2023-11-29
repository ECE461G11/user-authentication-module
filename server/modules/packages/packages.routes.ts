import express from "express";
import { createPackage, getPackages } from "./packages.controller";
import {
  createPackageValidation,
  // getPackagesValidation,
} from "./packages.validator";
import { validate, verifyHeaders } from "../../middleware/validate";
const router = express.Router();

router.post(
  "/package",
  verifyHeaders({ requireContentType: true }),
  validate(createPackageValidation),
  createPackage,
);

router.post(
  "/packages",
  verifyHeaders({ requireContentType: true, requireToken: true }),
  // validate(getPackagesValidation),
  getPackages,
);

export default router;
