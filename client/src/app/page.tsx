import { Suspense } from "react";
import AnnouncementClientPanel from "@/components/AnnouncementClientPanel";
import AnnouncementListSkeleton from "@/components/AnnouncementListSkeleton";
import AnnouncementServerList from "@/components/AnnouncementServerList";

export const revalidate = 300;

const tickerItems = [
  "과기정통부 AI 원천기술개발 사업 공고 (마감 임박)",
  "산업부 소재·부품·장비 R&D 공고 실시간 반영",
  "중기부 기술혁신개발 과제 신규 등록",
  "해양수산부 해양 신소재 과제 모집 진행중",
];

const industries = [
  { icon: "💡", name: "반도체", count: "50+ 기업", priority: true },
  { icon: "🔋", name: "이차전지", count: "40+ 기업", priority: true },
  { icon: "🧬", name: "바이오/헬스", count: "40+ 기업", priority: true },
  { icon: "🚗", name: "미래모빌리티", count: "30+ 기업", priority: true },
  { icon: "📺", name: "디스플레이", count: "30+ 기업", priority: false },
  { icon: "🤖", name: "AI/SW", count: "10+ 기업", priority: true },
  { icon: "⚙️", name: "기계", count: "30+ 기업", priority: false },
  { icon: "🔩", name: "철강/비철금속", count: "20+ 기업", priority: false },
];

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const parsed = Number(params.page);
  const currentPage = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;

  return (
    <main className="bg-white text-slate-900">

      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-800 text-white">⌁</div>
            <p className="text-lg font-extrabold text-slate-800">
              Connect<span className="text-sky-700">R&D</span>
            </p>
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#industry" className="hover:text-sky-700">기업 검색</a>
            <a href="#rd" className="hover:text-sky-700">R&D 과제</a>
            <a href="#ai" className="hover:text-sky-700">AI 매칭</a>
          </div>
          <button className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white">기업 등록</button>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-20 text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,#60a5fa_0,transparent_35%),radial-gradient(circle_at_80%_40%,#93c5fd_0,transparent_30%)]" />
        <div className="relative mx-auto w-full max-w-6xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-sky-300">
            R&D 매칭 플랫폼 · 시험인증 연결 서비스
          </p>
          <h1 className="text-3xl font-black leading-tight md:text-5xl">
            정부 R&D 공고와 기업 역량을 연결해
            <span className="block text-sky-300">AI가 최적 파트너를 추천합니다</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
            실시간 공고 데이터와 기업 기술 정보를 통합해 컨소시엄 탐색부터 과제 검토까지 빠르게 진행할 수 있습니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700">기업 등록하기</button>
            <a href="#rd" className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/20">최신 공고 보기</a>
            <a href="#industry" className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/20">산업 분야 탐색</a>
          </div>
        </div>
      </section>

      <div className="overflow-hidden bg-slate-800 py-2 text-sm text-sky-200">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={`${item}-${idx}`} className="mx-8 inline-block whitespace-nowrap before:mr-2 before:text-sky-400 before:content-['◆']">
              {item}
            </span>
          ))}
        </div>
      </div>

      <section id="ai" className="border-b border-slate-200 bg-slate-50 px-6 py-7">
        <div className="mx-auto w-full max-w-6xl">
          <AnnouncementClientPanel />
        </div>
      </section>

      <section id="industry" className="px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-extrabold text-slate-800">산업 분야별 기업 DB</h2>
          <p className="mt-2 text-slate-500">핵심 산업군별 기업 현황과 기술 역량 정보를 한눈에 확인하세요.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {industries.map((industry) => (
              <div
                key={industry.name}
                className="relative rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-md"
              >
                {industry.priority ? <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-500" /> : null}
                <div className="text-2xl">{industry.icon}</div>
                <p className="mt-2 text-sm font-bold text-slate-800">{industry.name}</p>
                <p className="text-xs text-slate-500">{industry.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="rd" className="bg-slate-50 px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <Suspense fallback={<AnnouncementListSkeleton />}>
            <AnnouncementServerList currentPage={currentPage} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
