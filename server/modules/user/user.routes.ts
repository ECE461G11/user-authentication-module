import express from "express";
import { userAuthentication, userRegistration } from "./user.controller";
import { register, authentication } from "./user.validator";
import { validate, verifyHeaders } from "../../middleware/validate";
const router = express.Router();

router.post(
  "/register",
  // verifyHeaders({ requireToken: true, requireAdminAccess: true }),
  validate(register),
  userRegistration,
);
router.put("/authenticate", validate(authentication), userAuthentication);

export default router;
