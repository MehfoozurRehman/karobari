import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "karobari.shop";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const url = req.nextUrl;

  const isPlatformHost =
    host === ROOT_DOMAIN ||
    host === `www.${ROOT_DOMAIN}` ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".vercel.app") ||
    host.endsWith(".localhost");

  if (!isPlatformHost || (host.endsWith(".localhost") && host !== "localhost")) {
    let tenant: string;
    if (host.endsWith(`.${ROOT_DOMAIN}`)) {
      tenant = host.slice(0, -(ROOT_DOMAIN.length + 1));
    } else if (host.endsWith(".localhost")) {
      tenant = host.slice(0, -".localhost".length);
    } else {
      tenant = host;
    }
    if (tenant && tenant !== "www") {
      return NextResponse.rewrite(
        new URL(`/s/${tenant}${url.pathname}${url.search}`, req.url),
      );
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
