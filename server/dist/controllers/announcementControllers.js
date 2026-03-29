"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getList = void 0;
const DEFAULT_BASE_URL = "http://apis.data.go.kr/1721000/msitannouncementinfo/businessAnnouncMentList";
function toArray(value) {
    if (value == null)
        return [];
    return Array.isArray(value) ? value : [value];
}
const getList = async (req, res) => {
    try {
        const BASE_URL = process.env.RnD_API_URL || DEFAULT_BASE_URL;
        const SERVICE_KEY = process.env.RnD_SERVICE_KEY;
        const page = Number(req.query.page ?? 1);
        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "(getList_page) page는 1 이상의 정수여야합니다."
            });
        }
        if (!SERVICE_KEY) {
            return res.status(500).json({
                success: false,
                data: null,
                message: "(getList_SERVICE_KEY) 서비스 키가 설정되지 않았습니다."
            });
        }
        const params = new URLSearchParams({
            serviceKey: SERVICE_KEY,
            numOfRows: "10",
            pageNo: String(page),
            returnType: "json",
        });
        const response = await fetch(`${BASE_URL}?${params.toString()}`);
        if (!response.ok) {
            return res.status(500).json({
                success: false,
                data: null,
                message: "(getList_API_ERROR) 외부 API 응답 형식이 올바르지 않습니다."
            });
        }
        const json = (await response.json());
        const responseData = json?.response;
        const header = Array.isArray(responseData)
            ? responseData.find((entry) => entry?.header)?.header
            : responseData?.header;
        const body = Array.isArray(responseData)
            ? responseData.find((entry) => entry?.body)?.body
            : responseData?.body;
        if (!header) {
            return res.status(500).json({
                success: false,
                data: null,
                message: "(getList_API_ERROR) 외부 API 응답 형식이 올바르지 않습니다."
            });
        }
        if (header.resultCode != "00") {
            return res.status(502).json({
                success: false,
                data: null,
                message: `(getList_API_ERROR) 공공데이터 API 오류 (${header.resultCode}): ${header.resultMsg}`
            });
        }
        const rawItems = toArray(body?.items?.item ?? body?.items);
        const items = rawItems.map((entry) => {
            const item = entry?.item ?? entry;
            const fileContainers = toArray(item.files);
            const files = fileContainers.flatMap((fileContainer) => toArray(fileContainer?.file));
            return {
                ...item,
                files: { file: files },
            };
        });
        return res.json({
            success: true,
            data: {
                pageNo: Number(body?.pageNo ?? page),
                numOfRows: Number(body?.numOfRows ?? 10),
                totalCount: Number(body?.totalCount ?? 0),
                items,
            },
            message: "(getList_SUCCESS) 공공데이터 API 호출 성공",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            data: null,
            message: "(getList_UNEXPECTED_ERROR) CATCH ERROR",
        });
    }
};
exports.getList = getList;
//# sourceMappingURL=announcementControllers.js.map