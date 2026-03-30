type OpenDartCompanyResponse = {
  status?: string;
  message?: string;
  corp_code?: string;
  corp_name?: string;
  stock_name?: string;
  jurir_no?: string;
  bizr_no?: string;
};

type PatentSearchInput = {
  corpCode: string;
  pageNo: number;
  numOfRows: number;
};

type ApplicantMapping = {
  applicantNumber: string;
  applicantName: string | null;
  corporationNumber: string | null;
  businessRegistrationNumber: string | null;
};

type PatentItem = {
  indexNo: string | null;
  inventionTitle: string | null;
  applicantName: string | null;
  applicationNumber: string | null;
  applicationDate: string | null;
  registerNumber: string | null;
  registerDate: string | null;
  publicationNumber: string | null;
  publicationDate: string | null;
  openNumber: string | null;
  openDate: string | null;
  registerStatus: string | null;
  ipcNumber: string | null;
  astrtCont: string | null;
};

export type CompanyPatentSearchResult = {
  corpCode: string;
  company: {
    corpName: string | null;
    stockName: string | null;
    jurirNo: string | null;
    bizrNo: string | null;
  };
  applicant: ApplicantMapping;
  pagination: {
    pageNo: number;
    numOfRows: number;
    totalCount: number | null;
  };
  items: PatentItem[];
  source: {
    fetchedAt: string;
    opendartStatus: string;
    kiprisResultCode: string | null;
    kiprisResultMsg: string | null;
  };
};

const OPENDART_COMPANY_BASE_URL =
  process.env.OPENDART_COMPANY_BASE_URL ??
  "https://opendart.fss.or.kr/api/company.json";
const KIPRIS_APPLICANT_API_URL =
  process.env.KIPRIS_APPLICANT_API_URL ??
  "https://plus.kipris.or.kr/kipo-api/kipi/CorpBsApplicantService/corpBsApplicantInfoV2";
const KIPRIS_PATENT_SEARCH_API_URL =
  process.env.KIPRIS_PATENT_SEARCH_API_URL ??
  "https://plus.kipris.or.kr/kipo-api/kipi/patUtiModInfoSearchSevice/getAdvancedSearch";

function xmlUnescape(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function firstTagValue(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = xml.match(regex);
  if (!match) return null;
  return xmlUnescape(match[1].trim());
}

function allTagBlocks(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  const result: string[] = [];
  let match = regex.exec(xml);
  while (match) {
    result.push(match[1]);
    match = regex.exec(xml);
  }
  return result;
}

function normalizeCorporationNumber(jurirNo?: string): string | null {
  if (!jurirNo) return null;
  const digitsOnly = jurirNo.replace(/\D/g, "");
  if (digitsOnly.length !== 13) return null;
  return `${digitsOnly.slice(0, 6)}-${digitsOnly.slice(6)}`;
}

async function fetchCompanyFromOpenDart(corpCode: string): Promise<OpenDartCompanyResponse> {
  const apiKey = process.env.OPENDART_API_KEY ?? process.env.DART_API_KEY;
  if (!apiKey) {
    throw new Error("OPENDART_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const params = new URLSearchParams({
    crtfc_key: apiKey,
    corp_code: corpCode,
  });

  const response = await fetch(`${OPENDART_COMPANY_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`OpenDART 회사개황 HTTP 오류: ${response.status}`);
  }

  const payload = (await response.json()) as OpenDartCompanyResponse;
  const status = payload.status ?? "UNKNOWN";
  const message = payload.message ?? "UNKNOWN_MESSAGE";
  if (status !== "000") {
    throw new Error(`OpenDART 회사개황 오류(${status}): ${message}`);
  }

  return payload;
}

async function fetchApplicantMapping(corporationNumber: string): Promise<ApplicantMapping> {
  const kiprisApiKey = process.env.KIPRIS_API_KEY;
  if (!kiprisApiKey) {
    throw new Error("KIPRIS_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const params = new URLSearchParams({
    CorporationNumber: corporationNumber,
    ServiceKey: kiprisApiKey,
  });

  const response = await fetch(`${KIPRIS_APPLICANT_API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`KIPRIS 출원인 매핑 HTTP 오류: ${response.status}`);
  }

  const xml = await response.text();
  const resultCode = firstTagValue(xml, "resultCode");
  const resultMsg = firstTagValue(xml, "resultMsg");
  const successYN = firstTagValue(xml, "successYN");
  const isSuccess =
    successYN === "Y" ||
    resultCode === "00" ||
    resultCode === "000" ||
    resultCode === "0";

  if (!isSuccess) {
    throw new Error(
      `KIPRIS 출원인 매핑 오류(${resultCode ?? "UNKNOWN"}): ${resultMsg ?? "UNKNOWN_MESSAGE"}`,
    );
  }

  const block = allTagBlocks(xml, "corpBsApplicantInfo")[0];
  if (!block) {
    throw new Error("KIPRIS 출원인 매핑 결과가 없습니다.");
  }

  const applicantNumber = firstTagValue(block, "ApplicantNumber");
  if (!applicantNumber) {
    throw new Error("KIPRIS 응답에 ApplicantNumber가 없습니다.");
  }

  return {
    applicantNumber,
    applicantName: firstTagValue(block, "ApplicantName"),
    corporationNumber: firstTagValue(block, "CorporationNumber"),
    businessRegistrationNumber: firstTagValue(block, "BusinessRegistrationNumber"),
  };
}

async function fetchPatentListByApplicant(
  applicant: string,
  pageNo: number,
  numOfRows: number,
): Promise<{
  items: PatentItem[];
  totalCount: number | null;
  resultCode: string | null;
  resultMsg: string | null;
}> {
  const kiprisApiKey = process.env.KIPRIS_API_KEY;
  if (!kiprisApiKey) {
    throw new Error("KIPRIS_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const params = new URLSearchParams({
    applicant,
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
    ServiceKey: kiprisApiKey,
  });

  const response = await fetch(`${KIPRIS_PATENT_SEARCH_API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`KIPRIS 특허조회 HTTP 오류: ${response.status}`);
  }

  const xml = await response.text();
  const resultCode = firstTagValue(xml, "resultCode");
  const resultMsg = firstTagValue(xml, "resultMsg");
  const successYN = firstTagValue(xml, "successYN");
  const isSuccess =
    successYN === "Y" ||
    resultCode === "00" ||
    resultCode === "000" ||
    resultCode === "0";

  if (!isSuccess) {
    throw new Error(
      `KIPRIS 특허조회 오류(${resultCode ?? "UNKNOWN"}): ${resultMsg ?? "UNKNOWN_MESSAGE"}`,
    );
  }

  const itemBlocks = allTagBlocks(xml, "item");
  const items: PatentItem[] = itemBlocks.map((block) => ({
    indexNo: firstTagValue(block, "indexNo"),
    inventionTitle: firstTagValue(block, "inventionTitle"),
    applicantName: firstTagValue(block, "applicantName"),
    applicationNumber: firstTagValue(block, "applicationNumber"),
    applicationDate: firstTagValue(block, "applicationDate"),
    registerNumber: firstTagValue(block, "registerNumber"),
    registerDate: firstTagValue(block, "registerDate"),
    publicationNumber: firstTagValue(block, "publicationNumber"),
    publicationDate: firstTagValue(block, "publicationDate"),
    openNumber: firstTagValue(block, "openNumber"),
    openDate: firstTagValue(block, "openDate"),
    registerStatus: firstTagValue(block, "registerStatus"),
    ipcNumber: firstTagValue(block, "ipcNumber"),
    astrtCont: firstTagValue(block, "astrtCont"),
  }));

  const totalCountRaw = firstTagValue(xml, "totalCount");
  const totalCount = totalCountRaw !== null && /^\d+$/.test(totalCountRaw) ? Number(totalCountRaw) : null;

  return { items, totalCount, resultCode, resultMsg };
}

export async function fetchCompanyPatentsByCorpCode(
  input: PatentSearchInput,
): Promise<CompanyPatentSearchResult> {
  const company = await fetchCompanyFromOpenDart(input.corpCode);
  const corporationNumber = normalizeCorporationNumber(company.jurir_no);
  if (!corporationNumber) {
    throw new Error("OpenDART에서 법인번호(jurir_no)를 확인할 수 없습니다.");
  }

  const applicant = await fetchApplicantMapping(corporationNumber);
  const patentSearch = await fetchPatentListByApplicant(
    applicant.applicantNumber,
    input.pageNo,
    input.numOfRows,
  );

  return {
    corpCode: input.corpCode,
    company: {
      corpName: company.corp_name ?? null,
      stockName: company.stock_name ?? null,
      jurirNo: company.jurir_no ?? null,
      bizrNo: company.bizr_no ?? null,
    },
    applicant,
    pagination: {
      pageNo: input.pageNo,
      numOfRows: input.numOfRows,
      totalCount: patentSearch.totalCount,
    },
    items: patentSearch.items,
    source: {
      fetchedAt: new Date().toISOString(),
      opendartStatus: company.status ?? "000",
      kiprisResultCode: patentSearch.resultCode,
      kiprisResultMsg: patentSearch.resultMsg,
    },
  };
}
