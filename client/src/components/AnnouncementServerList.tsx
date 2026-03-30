import Link from "next/link";
import { AnnouncementListData, AnnouncementResponse } from "@/types/announcements";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";
const REVALIDATE_SECONDS = 300;

function toArray<T>(value?: T | T[] | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function buildPagination(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("ellipsis");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("ellipsis");

  pages.push(totalPages);
  return pages;
}

function getTags(subject?: string): string[] {
  if (!subject) return [];
  return Array.from(
    new Set(
      subject
        .replace(/[^\w가-힣\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length >= 2),
    ),
  ).slice(0, 3);
}

async function getAnnouncementList(page: number): Promise<AnnouncementListData> {
  const response = await fetch(
    `${API_BASE_URL}/api/announcement/list?page=${page}`,
    { next: { revalidate: REVALIDATE_SECONDS } },
  );

  const payload = (await response.json()) as AnnouncementResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload?.message ?? "사업공고 조회에 실패했습니다.");
  }

  return payload.data;
}

type AnnouncementServerListProps = {
  currentPage: number;
};

export default async function AnnouncementServerList({
  currentPage,
}: AnnouncementServerListProps) {
  let list: AnnouncementListData | null = null;
  let errorMessage: string | null = null;

  try {
    list = await getAnnouncementList(currentPage);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-semibold">데이터를 불러오지 못했습니다.</p>
        <p className="mt-1 text-sm">{errorMessage}</p>
      </div>
    );
  }

  if (!list) return null;

  const totalPages = Math.max(1, Math.ceil(list.totalCount / Math.max(1, list.numOfRows)));
  const pageItems = buildPagination(currentPage, totalPages);

  return (
    <section>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">최신 R&D 공고</h2>
          <p className="mt-2 text-slate-500">
            실시간 공고 데이터를 기반으로 맞춤형 과제를 탐색합니다.
          </p>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
          {REVALIDATE_SECONDS}초 주기 갱신
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {toArray(list?.items).map((item, index) => {
          const files = toArray(item.files?.file);
          const tags = getTags(item.subject);

          return (
            <article
              key={`${item.subject ?? "announcement"}-${index}`}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-400 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">
                  {item.deptName ?? "담당부서 미정"}
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  AI 추천
                </span>
              </div>

              <h3 className="line-clamp-2 text-base font-extrabold leading-6 text-slate-800">
                {item.subject ?? "제목 없음"}
              </h3>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span key={`${item.subject}-${tag}`} className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">일반 공고</span>
                )}
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                담당자 {item.managerName ?? "-"} · 연락처 {item.managerTel ?? "-"} · 공고일 {item.pressDt ?? "-"}
              </p>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold text-slate-500">
                  첨부파일 {files.length}건
                </p>
                <div className="mt-3 flex gap-2">
                  {item.viewUrl ? (
                    <a
                      href={item.viewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      상세보기
                    </a>
                  ) : null}
                  {files[0]?.fileUrl ? (
                    <a
                      href={files[0].fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      첨부 다운로드
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {list ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            페이지 <span className="font-bold text-slate-900">{list.pageNo}</span> /{" "}
            <span className="font-bold text-slate-900">{totalPages}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={`/?page=${currentPage - 1}#rd`}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                이전 페이지
              </Link>
            ) : (
              <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-400">
                이전 페이지
              </span>
            )}

            <div className="mx-1 flex flex-wrap items-center gap-1">
              {pageItems.map((item, index) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 py-1 text-sm text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <Link
                    key={`page-${item}`}
                    href={`/?page=${item}#rd`}
                    className={
                      item === currentPage
                        ? "rounded-lg border border-sky-500 bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white"
                        : "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    }
                  >
                    {item}
                  </Link>
                ),
              )}
            </div>

            {currentPage < totalPages ? (
              <Link
                href={`/?page=${currentPage + 1}#rd`}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                다음 페이지
              </Link>
            ) : (
              <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-400">
                다음 페이지
              </span>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
