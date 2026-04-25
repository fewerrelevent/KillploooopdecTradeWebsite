/**
 * functions/proxy.js
 * Cloudflare Pages Function — proxies your Google Sheet CSV to avoid CORS issues.
 * Accessible at: https://your-site.pages.dev/proxy?url=YOUR_SHEET_URL
 */

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return new Response("Missing ?url= parameter", { status: 400 });
  }

  // Only allow Google Sheets URLs for safety
  if (!target.startsWith("https://docs.google.com/spreadsheets/")) {
    return new Response("Only Google Sheets URLs are allowed", { status: 403 });
  }

  try {
    const response = await fetch(target);
    const text = await response.text();

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return new Response("Fetch failed: " + err.message, { status: 500 });
  }
}
