"use client";

export function DisableDraftMode() {
  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 z-50 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-lg"
    >
      Exit preview
    </a>
  );
}
