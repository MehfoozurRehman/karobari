import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-[#f4f2ec] py-12 text-sm text-stone-500">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 sm:flex-row sm:px-6">
        <p>© 2026 Karobari. Designed for small businesses in Pakistan.</p>
        <div className="flex gap-7">
          <Link href="/contact" className="hover:text-stone-800">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-stone-800">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-stone-800">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
