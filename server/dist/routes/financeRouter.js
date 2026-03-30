"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const financeControllers_1 = require("../controllers/financeControllers");
const router = express_1.default.Router();
router.get("/single", financeControllers_1.getSingleCompanyFinancialStatus);
exports.default = router;
//# sourceMappingURL=financeRouter.js.map