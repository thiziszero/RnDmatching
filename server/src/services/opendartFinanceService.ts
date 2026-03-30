type OpenDartFinanceInput = {
  corpCode: string;
  bsnsYear: string;
  reprtCode: string;
  fsDiv: "CFS" | "OFS";
};

type OpenDartCompanyResponse = {
  status?: string;
  message?: string;
  corp_code?: string;
  corp_name?: string;
  corp_name_eng?: string;
  stock_name?: string;
  stock_code?: string;
  corp_cls?: string;
};

type OpenDartFinanceItem = {
  account_nm?: string;
  account_id?: string;
  thstrm_amount?: string;
};

type OpenDartFinanceResponse = {
  status?: string;
  message?: string;
  list?: OpenDartFinanceItem[];
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

const OPENDART_BASE_URL =
  process.env.OPENDART_BASE_URL ??
  "https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json";
const OPENDART_COMPANY_BASE_URL =
  process.env.OPENDART_COMPANY_BASE_URL ??
  "https://opendart.fss.or.kr/api/company.json";

function parseAmount(value?: string): number | null {
  if (!value) return null;
  const normalized = value.replace(/[,\s]/g, "").replace(/[^\d\-]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function findAmountByPriority(
  items: OpenDartFinanceItem[],
  accountIdCandidates: string[],
  accountNameCandidates: string[],
): number | null {
  for (const accountId of accountIdCandidates) {
    const found = items.find((item) => item.account_id === accountId);
    const amount = parseAmount(found?.thstrm_amount);
    if (amount !== null) return amount;
  }

  for (const accountName of accountNameCandidates) {
    const found = items.find((item) => item.account_nm === accountName);
    const amount = parseAmount(found?.thstrm_amount);
    if (amount !== null) return amount;
  }

  return null;
}

function ratio(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function buildFinancialMetrics(items: OpenDartFinanceItem[]): FinancialMetricSet {
  const assets = findAmountByPriority(
    items,
    ["ifrs-full_Assets"],
    ["자산총계"],
  );
  const liabilities = findAmountByPriority(
    items,
    ["ifrs-full_Liabilities"],
    ["부채총계"],
  );
  const equity = findAmountByPriority(
    items,
    ["ifrs-full_Equity"],
    ["자본총계"],
  );
  const revenue = findAmountByPriority(
    items,
    ["ifrs-full_Revenue"],
    ["매출액", "수익(매출액)", "영업수익"],
  );
  const operatingIncome = findAmountByPriority(
    items,
    ["dart_OperatingIncomeLoss", "ifrs-full_OperatingProfitLoss"],
    ["영업이익", "영업손익"],
  );
  const netIncome = findAmountByPriority(
    items,
    ["ifrs-full_ProfitLoss"],
    ["당기순이익", "당기순손익"],
  );
  const currentAssets = findAmountByPriority(
    items,
    ["ifrs-full_CurrentAssets"],
    ["유동자산"],
  );
  const currentLiabilities = findAmountByPriority(
    items,
    ["ifrs-full_CurrentLiabilities"],
    ["유동부채"],
  );

  return {
    assets,
    liabilities,
    equity,
    revenue,
    operatingIncome,
    netIncome,
    currentAssets,
    currentLiabilities,
    debtRatio: ratio(liabilities, equity),
    currentRatio: ratio(currentAssets, currentLiabilities),
    operatingMargin: ratio(operatingIncome, revenue),
    netMargin: ratio(netIncome, revenue),
    roe: ratio(netIncome, equity),
    roa: ratio(netIncome, assets),
  };
}

export async function fetchSingleCompanyFinancialStatus(
  input: OpenDartFinanceInput,
): Promise<SingleCompanyFinancialStatus> {
  const apiKey = process.env.OPENDART_API_KEY ?? process.env.DART_API_KEY;

  if (!apiKey) {
    throw new Error("OPENDART_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const financeParams = new URLSearchParams({
    crtfc_key: apiKey,
    corp_code: input.corpCode,
    bsns_year: input.bsnsYear,
    reprt_code: input.reprtCode,
    fs_div: input.fsDiv,
  });
  const companyParams = new URLSearchParams({
    crtfc_key: apiKey,
    corp_code: input.corpCode,
  });

  const [financeResponse, companyResponse] = await Promise.all([
    fetch(`${OPENDART_BASE_URL}?${financeParams.toString()}`),
    fetch(`${OPENDART_COMPANY_BASE_URL}?${companyParams.toString()}`),
  ]);

  if (!financeResponse.ok) {
    throw new Error(`OpenDART 재무 HTTP 오류: ${financeResponse.status}`);
  }
  if (!companyResponse.ok) {
    throw new Error(`OpenDART 회사개황 HTTP 오류: ${companyResponse.status}`);
  }

  const financePayload = (await financeResponse.json()) as OpenDartFinanceResponse;
  const companyPayload = (await companyResponse.json()) as OpenDartCompanyResponse;

  const financeStatus = financePayload.status ?? "UNKNOWN";
  const financeMessage = financePayload.message ?? "UNKNOWN_MESSAGE";
  if (financeStatus !== "000") {
    throw new Error(`OpenDART 재무 오류(${financeStatus}): ${financeMessage}`);
  }

  const companyStatus = companyPayload.status ?? "UNKNOWN";
  const companyMessage = companyPayload.message ?? "UNKNOWN_MESSAGE";
  if (companyStatus !== "000") {
    throw new Error(`OpenDART 회사개황 오류(${companyStatus}): ${companyMessage}`);
  }

  const list = Array.isArray(financePayload.list) ? financePayload.list : [];
  const metrics = buildFinancialMetrics(list);

  return {
    corpCode: input.corpCode,
    company: {
      corpName: companyPayload.corp_name ?? null,
      corpNameEng: companyPayload.corp_name_eng ?? null,
      stockName: companyPayload.stock_name ?? null,
      stockCode: companyPayload.stock_code ?? null,
      corpCls: companyPayload.corp_cls ?? null,
    },
    bsnsYear: input.bsnsYear,
    reprtCode: input.reprtCode,
    fsDiv: input.fsDiv,
    metrics,
    source: {
      status: financeStatus,
      message: financeMessage,
      fetchedAt: new Date().toISOString(),
      rawItemCount: list.length,
    },
  };
}
