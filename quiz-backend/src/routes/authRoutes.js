import express from "express";
import { azureLogin } from "../controllers/azureAuthController.js";
import { verifyAzureToken } from "../middleware/azureAuth.js";

const router = express.Router();

router.post("/azure", verifyAzureToken, azureLogin);

export default router;
