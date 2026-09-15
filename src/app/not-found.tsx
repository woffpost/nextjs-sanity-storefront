import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-28 text-center">
      <p className="label text-ink-faint">404</p>
      <h1 className="font-display mt-4 text-4xl">Nothing here.</h1>
      <p className="mt-4 text-lg text-ink-soft">
        This piece isn&apos;t in the catalog — or never was.
      </p>
      <Link
        href="/"
        className="label mt-10 inline-block text-ink underline decoration-border-strong underline-offset-4"
      >
        Back to the catalog
      </Link>
    </div>
  );
}
