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
export declare function fetchCompanyPatentsByCorpCode(input: PatentSearchInput): Promise<CompanyPatentSearchResult>;
export {};
//# sourceMappingURL=kiprisPatentService.d.ts.map