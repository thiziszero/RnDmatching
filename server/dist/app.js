"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const announcementRouter_1 = __importDefault(require("./routes/announcementRouter"));
const financeRouter_1 = __importDefault(require("./routes/financeRouter"));
const patentRouter_1 = __importDefault(require("./routes/patentRouter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// 미들웨어
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173"],
}));
app.use(express_1.default.json());
app.use('/api/announcement', announcementRouter_1.default);
app.use('/api/finance', financeRouter_1.default);
app.use('/api/patent', patentRouter_1.default);
// 서버 시작
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map