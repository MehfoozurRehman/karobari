import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  if (!appId) {
    throw new Error("NEXT_PUBLIC_META_APP_ID not configured");
  }

  const redirectUri = `${new URL(request.url).origin}/api/whatsapp/oauth/callback`;
  const state = crypto.randomUUID();

  return new Response(null, {
    status: 307,
    headers: {
      Location: `https://www.facebook.com/v23.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=code&state=${state}&scope=business_management,whatsapp_business_messaging,whatsapp_business_management`,
      "Set-Cookie": `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  });
}
