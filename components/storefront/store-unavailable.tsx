export function StoreUnavailable({ name }: { name?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f6] p-6 text-center">
      <p className="text-5xl">🕐</p>
      <h1 className="mt-4 text-2xl font-extrabold text-stone-900">
        {name ? `${name} is temporarily unavailable` : "Store not found"}
      </h1>
      <p className="mt-2 max-w-md text-sm text-stone-500">
        {name
          ? "Yeh dukaan filhaal band hai. Thori dair baad dobara koshish karein."
          : "Is address par koi store mojood nahi. Address check karein."}
      </p>
    </div>
  );
}
