import { httpRouter } from "convex/server";
import { handleWebhookVerify, handleIncomingMessage } from "./whatsapp";

const router = httpRouter();

router.route({
  path: "/whatsapp",
  method: "GET",
  handler: handleWebhookVerify,
});

router.route({
  path: "/whatsapp",
  method: "POST",
  handler: handleIncomingMessage,
});

export default router;
