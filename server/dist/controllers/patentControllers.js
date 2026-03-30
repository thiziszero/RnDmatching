"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyPatents = void 0;
const kiprisPatentService_1 = require("../services/kiprisPatentService");
function toPositiveInteger(value, fallback) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0)
        return fallback;
    return parsed;
}
const getCompanyPatents = async (req, res) => {
    try {
        const corpCode = String(req.query.corpCode ?? "").trim();
        const pageNo = toPositiveInteger(req.query.pageNo, 1);
        const numOfRows = Math.min(toPositiveInteger(req.query.numOfRows, 10), 100);
        if (!/^\d{8}$/.test(corpCode)) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "corpCode는 8자리 숫자여야 합니다. (예: 00126380)",
            });
        }
        const data = await (0, kiprisPatentService_1.fetchCompanyPatentsByCorpCode)({
            corpCode,
            pageNo,
            numOfRows,
        });
        return res.json({
            success: true,
            data,
            message: "기업 특허 조회 성공",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            data: null,
            message: error instanceof Error ? error.message : "기업 특허 조회 중 오류가 발생했습니다.",
        });
    }
};
exports.getCompanyPatents = getCompanyPatents;
//# sourceMappingURL=patentControllers.js.map