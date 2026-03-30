"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCompanyPatentsByCorpCode = fetchCompanyPatentsByCorpCode;
const OPENDART_COMPANY_BASE_URL = process.env.OPENDART_COMPANY_BASE_URL ??
    "https://opendart.fss.or.kr/api/company.json";
const KIPRIS_APPLICANT_API_URL = process.env.KIPRIS_APPLICANT_API_URL ??
    "https://plus.kipris.or.kr/kipo-api/kipi/CorpBsApplicantService/corpBsApplicantInfoV2";
const KIPRIS_PATENT_SEARCH_API_URL = process.env.KIPRIS_PATENT_SEARCH_API_URL ??
    "https://plus.kipris.or.kr/kipo-api/kipi/patUtiModInfoSearchSevice/getAdvancedSearch";
function xmlUnescape(value) {
    return value
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}
function firstTagValue(xml, tagName) {
    const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i");
    const match = xml.match(regex);
    if (!match)
        return null;
    return xmlUnescape(match[1].trim());
}
function allTagBlocks(xml, tagName) {
    const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "gi");
    const result = [];
    let match = regex.exec(xml);
    while (match) {
        result.push(match[1]);
        match = regex.exec(xml);
    }
    return result;
}
function normalizeCorporationNumber(jurirNo) {
    if (!jurirNo)
        return null;
    const digitsOnly = jurirNo.replace(/\D/g, "");
    if (digitsOnly.length !== 13)
        return null;
    return `${digitsOnly.slice(0, 6)}-${digitsOnly.slice(6)}`;
}
async function fetchCompanyFromOpenDart(corpCode) {
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
    const payload = (await response.json());
    const status = payload.status ?? "UNKNOWN";
    const message = payload.message ?? "UNKNOWN_MESSAGE";
    if (status !== "000") {
        throw new Error(`OpenDART 회사개황 오류(${status}): ${message}`);
    }
    return payload;
}
async function fetchApplicantMapping(corporationNumber) {
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
    const isSuccess = successYN === "Y" ||
        resultCode === "00" ||
        resultCode === "000" ||
        resultCode === "0";
    if (!isSuccess) {
        throw new Error(`KIPRIS 출원인 매핑 오류(${resultCode ?? "UNKNOWN"}): ${resultMsg ?? "UNKNOWN_MESSAGE"}`);
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
async function fetchPatentListByApplicant(applicant, pageNo, numOfRows) {
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
    const isSuccess = successYN === "Y" ||
        resultCode === "00" ||
        resultCode === "000" ||
        resultCode === "0";
    if (!isSuccess) {
        throw new Error(`KIPRIS 특허조회 오류(${resultCode ?? "UNKNOWN"}): ${resultMsg ?? "UNKNOWN_MESSAGE"}`);
    }
    const itemBlocks = allTagBlocks(xml, "item");
    const items = itemBlocks.map((block) => ({
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
async function fetchCompanyPatentsByCorpCode(input) {
    const company = await fetchCompanyFromOpenDart(input.corpCode);
    const corporationNumber = normalizeCorporationNumber(company.jurir_no);
    if (!corporationNumber) {
        throw new Error("OpenDART에서 법인번호(jurir_no)를 확인할 수 없습니다.");
    }
    const applicant = await fetchApplicantMapping(corporationNumber);
    const patentSearch = await fetchPatentListByApplicant(applicant.applicantNumber, input.pageNo, input.numOfRows);
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
//# sourceMappingURL=kiprisPatentService.js.map