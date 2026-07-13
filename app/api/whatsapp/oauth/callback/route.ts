import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const GRAPH_BASE = "https://graph.facebook.com/v23.0";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const dash = (params: string) =>
    Response.redirect(`${origin}/dashboard/whatsapp?${params}`);

  const { userId, getToken } = await auth();
  if (!userId) {
    return Response.redirect(`${origin}/sign-in`);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const cookieState = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("oauth_state="))
    ?.split("=")[1];

  if (oauthError) {
    return dash(`error=${encodeURIComponent(oauthError)}`);
  }

  if (!code || !state || state !== cookieState) {
    return dash(`error=${encodeURIComponent("Invalid state or missing code")}`);
  }

  try {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!appId || !appSecret || !convexUrl) {
      throw new Error(
        "Missing configuration: META_APP_ID, META_APP_SECRET, or CONVEX_URL",
      );
    }

    const redirectUri = `${origin}/api/whatsapp/oauth/callback`;

    const tokenRes = await fetch(
      `${GRAPH_BASE}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${encodeURIComponent(
        code,
      )}&redirect_uri=${encodeURIComponent(redirectUri)}`,
    );
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new Error(tokenJson?.error?.message ?? "Token exchange failed");
    }
    const accessToken: string = tokenJson.access_token;

    const meRes = await fetch(`${GRAPH_BASE}/me?fields=id`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meJson = await meRes.json();
    const facebookUserId = meJson.id;

    const wabaRes = await fetch(
      `${GRAPH_BASE}/${facebookUserId}/owned_whatsapp_business_accounts`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const wabaJson = await wabaRes.json();
    if (!wabaJson.data || wabaJson.data.length === 0) {
      throw new Error("No WhatsApp Business Account found");
    }
    const wabaId = wabaJson.data[0].id;

    const phoneRes = await fetch(
      `${GRAPH_BASE}/${wabaId}/phone_numbers?limit=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const phoneJson = await phoneRes.json();
    if (!phoneJson.data || phoneJson.data.length === 0) {
      throw new Error("No phone numbers found in WhatsApp Business Account");
    }
    const phoneNumberId = phoneJson.data[0].id;

    await fetch(`${GRAPH_BASE}/${wabaId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const registerRes = await fetch(`${GRAPH_BASE}/${phoneNumberId}/register`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", pin }),
    });
    if (!registerRes.ok) {
      const body = await registerRes.text();
      if (!body.includes("already")) {
        throw new Error(`Number registration failed: ${body}`);
      }
    }

    const infoRes = await fetch(
      `${GRAPH_BASE}/${phoneNumberId}?fields=display_phone_number`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const info = await infoRes.json();
    const displayPhoneNumber: string = info.display_phone_number ?? "unknown";

    const convexToken = await getToken({ template: "convex" });
    if (!convexToken) {
      throw new Error("Could not get Convex auth token");
    }
    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(convexToken);
    await convex.mutation(api.whatsapp.connect.saveBusinessAccount, {
      wabaId,
      phoneNumberId,
      displayPhoneNumber,
      accessToken,
      pin,
    });

    return dash(`connected=${encodeURIComponent(displayPhoneNumber)}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return dash(`error=${encodeURIComponent(msg)}`);
  }
}
