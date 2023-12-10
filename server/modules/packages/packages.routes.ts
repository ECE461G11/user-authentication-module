import express from "express";
import {
  createPackage,
  getPackages,
  resetRegistry,
  getPackageRating,
  getPackage,
  updateVersion,
} from "./packages.controller";
import {
  createPackageValidation,
  getPackagesValidation,
  getPackageRatingValidation,
  getPackageValidation,
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
  validate(getPackagesValidation),
  getPackages,
);

router.get(
  "/package/:id/rate",
  verifyHeaders({ requireToken: true }),
  validate(getPackageRatingValidation),
  getPackageRating,
);

/* /package/{id}:
get:
  parameters:
  - name: id
    description: ID of package to fetch
    schema:
      $ref: '#/components/schemas/PackageID'
    in: path
    required: true */

router.get(
  "/package/:id",
  verifyHeaders({ requireToken: true }),
  validate(getPackageValidation),
  getPackage,
);

router.put(
  "/package/:id",
  verifyHeaders({ requireContentType: true }),
  validate(getPackageValidation),
  updateVersion,
)


router.delete("/reset", verifyHeaders({ requireToken: true }), resetRegistry);

export default router;
