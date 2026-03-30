import type { Request, Response } from "express";
import { fetchCompanyPatentsByCorpCode } from "../services/kiprisPatentService";

function toPositiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export const getCompanyPatents = async (req: Request, res: Response) => {
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

    const data = await fetchCompanyPatentsByCorpCode({
      corpCode,
      pageNo,
      numOfRows,
    });

    return res.json({
      success: true,
      data,
      message: "기업 특허 조회 성공",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "기업 특허 조회 중 오류가 발생했습니다.",
    });
  }
};
