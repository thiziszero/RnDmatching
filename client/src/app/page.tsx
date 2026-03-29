type AnnouncementFile = {
  fileName?: string;
  fileUrl?: string;
};

type Announcement = {
  subject?: string;
  viewUrl?: string;
  deptName?: string;
  managerName?: string;
  managerTel?: string;
  pressDt?: string;
  files?: {
    file?: AnnouncementFile | AnnouncementFile[];
  };
};

type AnnouncementListData = {
  pageNo: number;
  numOfRows: number;
  totalCount: number;
  items: Announcement[];
};

type AnnouncementResponse = {
  success: boolean;
  data: AnnouncementListData;
  message: string;
};

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";

export const dynamic = "force-dynamic";

function toArray<T>(value?: T | T[] | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

async function getAnnouncementList(page: number): Promise<AnnouncementListData> {
  const response = await fetch(
    `${API_BASE_URL}/api/announcement/list?page=${page}`,
    { cache: "no-store" },
  );

  const payload = (await response.json()) as AnnouncementResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload?.message ?? "사업공고 조회에 실패했습니다.");
  }

  return payload.data;
}

export default async function Home() {
  let list: AnnouncementListData | null = null;
  let errorMessage: string | null = null;

  try {
    list = await getAnnouncementList(1);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50 to-indigo-100 px-6 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur md:p-10">
        <header className="mb-8 flex flex-col gap-3">
          <p className="inline-flex w-fit rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
            MSIT Announcement API
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            과기정통부 사업공고 목록
          </h1>
          <p className="text-sm text-slate-600 md:text-base">
            서버 API: <code className="font-mono">{API_BASE_URL}/api/announcement/list?page=1</code>
          </p>
        </header>

        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">데이터를 불러오지 못했습니다.</p>
            <p className="mt-1 text-sm">{errorMessage}</p>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Page</p>
                <p className="mt-1 text-2xl font-semibold">{list?.pageNo ?? "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Rows</p>
                <p className="mt-1 text-2xl font-semibold">{list?.numOfRows ?? "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Total</p>
                <p className="mt-1 text-2xl font-semibold">{list?.totalCount ?? "-"}</p>
              </div>
            </div>

            <ul className="space-y-4">
              {toArray(list?.items).map((item, index) => {
                const files = toArray(item.files?.file);
                return (
                  <li
                    key={`${item.subject ?? "announcement"}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <h2 className="text-lg font-semibold leading-snug text-slate-900">
                      {item.subject ?? "제목 없음"}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span>부서: {item.deptName ?? "-"}</span>
                      <span>담당자: {item.managerName ?? "-"}</span>
                      <span>연락처: {item.managerTel ?? "-"}</span>
                      <span>게시일: {item.pressDt ?? "-"}</span>
                    </div>

                    {item.viewUrl ? (
                      <a
                        className="mt-4 inline-flex text-sm font-medium text-sky-700 underline underline-offset-4"
                        href={item.viewUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        공고 상세 보기
                      </a>
                    ) : null}

                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700">첨부파일</p>
                      {files.length === 0 ? (
                        <p className="mt-1 text-sm text-slate-500">첨부파일 없음</p>
                      ) : (
                        <ul className="mt-2 space-y-1 text-sm">
                          {files.map((file, fileIndex) => (
                            <li key={`${file.fileUrl ?? file.fileName ?? "file"}-${fileIndex}`}>
                              {file.fileUrl ? (
                                <a
                                  className="text-indigo-700 underline underline-offset-4"
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {file.fileName ?? "파일 다운로드"}
                                </a>
                              ) : (
                                <span className="text-slate-600">{file.fileName ?? "이름 없는 파일"}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
