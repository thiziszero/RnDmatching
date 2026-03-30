import express from "express";
import { getCompanyPatents } from "../controllers/patentControllers";

const router = express.Router();

router.get("/company", getCompanyPatents);

export default router;
