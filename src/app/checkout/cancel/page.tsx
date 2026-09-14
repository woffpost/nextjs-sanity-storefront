import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout canceled</h1>
      <p className="mt-3 text-neutral-600">Nothing was charged. Your cart is still here.</p>
      <Link href="/cart" className="mt-8 inline-block underline underline-offset-4">
        Back to cart
      </Link>
    </div>
  );
}
