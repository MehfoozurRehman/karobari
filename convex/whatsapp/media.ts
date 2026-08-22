import type { ActionCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

const GRAPH_BASE = 'https://graph.facebook.com/v23.0';

export async function storeInboundMedia(ctx: ActionCtx, args: { mediaId: string; accessToken: string }): Promise<Id<'_storage'> | null> {
  try {
    const metaRes = await fetch(`${GRAPH_BASE}/${args.mediaId}`, {
      headers: { Authorization: `Bearer ${args.accessToken}` },
    });
    if (!metaRes.ok) return null;
    const meta = await metaRes.json();
    const fileRes = await fetch(meta.url, {
      headers: { Authorization: `Bearer ${args.accessToken}` },
    });
    if (!fileRes.ok) return null;
    const blob = await fileRes.blob();
    return await ctx.storage.store(blob);
  } catch {
    return null;
  }
}

export async function transcribeInboundAudio(args: { mediaId: string; accessToken: string }): Promise<string | null> {
  try {
    const metaRes = await fetch(`${GRAPH_BASE}/${args.mediaId}`, {
      headers: { Authorization: `Bearer ${args.accessToken}` },
    });
    if (!metaRes.ok) return null;
    const meta = await metaRes.json();
    const fileRes = await fetch(meta.url, {
      headers: { Authorization: `Bearer ${args.accessToken}` },
    });
    if (!fileRes.ok) return null;
    const blob = await fileRes.blob();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const formData = new FormData();
    formData.append('file', blob, 'audio.ogg');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ur');
    formData.append('prompt', 'Pakistani business, Roman Urdu, Urdu, food orders, clothing, products, prices, bill, delivery address, phone number.');

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!whisperRes.ok) {
      console.error('Whisper transcription error:', await whisperRes.text());
      return null;
    }

    const whisperData = await whisperRes.json();
    return whisperData.text || null;
  } catch (err) {
    console.error('Failed to transcribe audio:', err);
    return null;
  }
}

