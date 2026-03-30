import AnnouncementListSkeleton from "@/components/AnnouncementListSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50 to-indigo-100 px-6 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur md:p-10">
        <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
          R&D 공고 조회 페이지
        </h1>
        <AnnouncementListSkeleton />
      </section>
    </main>
  );
}
