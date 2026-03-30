export default function AnnouncementListSkeleton() {
  return (
    <section className="animate-pulse">
      <div className="mb-6 space-y-3">
        <div className="h-7 w-72 rounded bg-slate-200" />
        <div className="h-4 w-96 rounded bg-slate-200" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="h-24 rounded-xl border border-slate-200 bg-slate-100" />
        <div className="h-24 rounded-xl border border-slate-200 bg-slate-100" />
        <div className="h-24 rounded-xl border border-slate-200 bg-slate-100" />
      </div>

      <div className="space-y-4">
        <div className="h-40 rounded-2xl border border-slate-200 bg-slate-100" />
        <div className="h-40 rounded-2xl border border-slate-200 bg-slate-100" />
        <div className="h-40 rounded-2xl border border-slate-200 bg-slate-100" />
      </div>
    </section>
  );
}
