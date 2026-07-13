"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function HeaderAuth() {
  return (
    <>
      <Show when="signed-out">
        <Link href="/sign-in" className="hidden sm:block">
          <Button
            variant="ghost"
            className="rounded-full px-5 font-semibold text-stone-700"
          >
            Sign In
          </Button>
        </Link>
      </Show>
      <Show when="signed-in">
        <Link href="/dashboard" className="hidden sm:block">
          <Button
            variant="ghost"
            className="rounded-full px-5 font-semibold text-emerald-700"
          >
            Dashboard
          </Button>
        </Link>
        <UserButton />
      </Show>
    </>
  );
}
