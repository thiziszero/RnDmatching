"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patentControllers_1 = require("../controllers/patentControllers");
const router = express_1.default.Router();
router.get("/company", patentControllers_1.getCompanyPatents);
exports.default = router;
//# sourceMappingURL=patentRouter.js.map