"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const announcementControllers_1 = require("../controllers/announcementControllers");
router.get('/list', announcementControllers_1.getList);
exports.default = router;
//# sourceMappingURL=announcementRouter.js.map