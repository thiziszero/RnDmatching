type OpenDartFinanceInput = {
    corpCode: string;
    bsnsYear: string;
    reprtCode: string;
    fsDiv: "CFS" | "OFS";
};
type FinancialMetricSet = {
    assets: number | null;
    liabilities: number | null;
    equity: number | null;
    revenue: number | null;
    operatingIncome: number | null;
    netIncome: number | null;
    currentAssets: number | null;
    currentLiabilities: number | null;
    debtRatio: number | null;
    currentRatio: number | null;
    operatingMargin: number | null;
    netMargin: number | null;
    roe: number | null;
    roa: number | null;
};
export type SingleCompanyFinancialStatus = {
    corpCode: string;
    company: {
        corpName: string | null;
        corpNameEng: string | null;
        stockName: string | null;
        stockCode: string | null;
        corpCls: string | null;
    };
    bsnsYear: string;
    reprtCode: string;
    fsDiv: "CFS" | "OFS";
    metrics: FinancialMetricSet;
    source: {
        status: string;
        message: string;
        fetchedAt: string;
        rawItemCount: number;
    };
};
export declare function fetchSingleCompanyFinancialStatus(input: OpenDartFinanceInput): Promise<SingleCompanyFinancialStatus>;
export {};
//# sourceMappingURL=opendartFinanceService.d.ts.map