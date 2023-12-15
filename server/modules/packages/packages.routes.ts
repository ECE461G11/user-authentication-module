import express from "express";
import {
  createPackage,
  getPackagesByQuery,
  resetRegistry,
  getPackageRating,
  getAllPackages,
  getPackageByID,
  updateVersionByID,
  getPackagesByRegEx,
} from "./packages.controller";
import {
  createPackageValidation,
  getPackagesValidation,
  getPackageRatingValidation,
  getAllPackagesValidation,
  getPackageValidation,
  getPackageByRegexpValidation,
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
  getPackagesByQuery,
);

router.get(
  "/get-all-packages",
  verifyHeaders({ requireToken: true }),
  validate(getAllPackagesValidation),
  getAllPackages,
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
  getPackageByID,
);

router.put(
  "/package/:id",
  verifyHeaders({ requireContentType: true }),
  validate(getPackageValidation),
  updateVersionByID,
);

router.post(
  "/package/byRegEx",
  verifyHeaders({ requireContentType: true, requireToken: true }),
  validate(getPackageByRegexpValidation),
  getPackagesByRegEx,
);


router.delete("/reset", verifyHeaders({ requireToken: true }), resetRegistry);

export default router;
