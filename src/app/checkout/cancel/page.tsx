import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-28 text-center">
      <p className="label text-ink-faint">Checkout canceled</p>
      <h1 className="font-display mt-4 text-4xl">Nothing was charged.</h1>
      <p className="mt-4 text-lg text-ink-soft">Your cart is still here, exactly as you left it.</p>
      <Link
        href="/cart"
        className="label mt-10 inline-block text-ink underline decoration-border-strong underline-offset-4"
      >
        Back to cart
      </Link>
    </div>
  );
}
