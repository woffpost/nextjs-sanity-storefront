import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg">Storefront</p>
          <p className="mt-1 max-w-sm text-sm text-ink-soft">
            An open-source commerce demo — Next.js, Sanity, and Stripe, built to be read.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-ink-soft">
          <Link href="/studio" className="transition hover:text-ink">
            Studio
          </Link>
          <a
            href="https://github.com/woffpost/nextjs-sanity-storefront"
            className="transition hover:text-ink"
          >
            Source
          </a>
        </div>
      </div>
    </footer>
  );
}
