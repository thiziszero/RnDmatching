import type { Request, Response } from "express";
import { fetchSingleCompanyFinancialStatus } from "../services/opendartFinanceService";

const VALID_REPRT_CODES = new Set(["11011", "11012", "11013", "11014"]);

function defaultBusinessYear(): string {
  return String(new Date().getFullYear() - 1);
}

export const getSingleCompanyFinancialStatus = async (req: Request, res: Response) => {
  try {
    const corpCode = String(req.query.corpCode ?? "").trim();
    const bsnsYear = String(req.query.bsnsYear ?? defaultBusinessYear()).trim();
    const reprtCode = String(req.query.reprtCode ?? "11011").trim();
    const fsDivRaw = String(req.query.fsDiv ?? "CFS").trim().toUpperCase();
    const fsDiv = fsDivRaw === "OFS" ? "OFS" : "CFS";

    if (!/^\d{8}$/.test(corpCode)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "corpCode는 8자리 숫자여야 합니다. (예: 00123456)",
      });
    }

    if (!/^\d{4}$/.test(bsnsYear)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "bsnsYear는 4자리 연도여야 합니다. (예: 2024)",
      });
    }

    if (!VALID_REPRT_CODES.has(reprtCode)) {
      return res.status(400).json({
        success: false,
        data: null,
        message:
          "reprtCode는 11011(사업), 11012(반기), 11013(1분기), 11014(3분기) 중 하나여야 합니다.",
      });
    }

    const data = await fetchSingleCompanyFinancialStatus({
      corpCode,
      bsnsYear,
      reprtCode,
      fsDiv,
    });

    return res.json({
      success: true,
      data,
      message: "단일 기업 재무 상태 조회 성공",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      data: null,
      message:
        error instanceof Error ? error.message : "단일 기업 재무 상태 조회 중 오류가 발생했습니다.",
    });
  }
};

