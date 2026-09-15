export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 py-12 sm:py-16">
      <div className="h-3 w-24 rounded-full bg-border" />
      <div className="mt-8 grid gap-12 sm:grid-cols-2 sm:gap-16">
        <div className="aspect-[4/5] rounded-sm bg-accent-soft" />
        <div>
          <div className="h-3 w-20 rounded-full bg-border" />
          <div className="mt-4 h-10 w-3/4 rounded-sm bg-border" />
          <div className="mt-5 h-3 w-16 rounded-full bg-border" />
          <div className="mt-6 h-4 w-full rounded-sm bg-border" />
          <div className="mt-2 h-4 w-2/3 rounded-sm bg-border" />
          <div className="mt-8 h-14 w-full max-w-xs rounded-sm bg-border" />
        </div>
      </div>
    </div>
  );
}
