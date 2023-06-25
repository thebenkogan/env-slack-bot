// below logic from https://medium.com/@jackoddy/verifying-slack-signatures-using-web-crypto-subtlecrypto-in-vercels-edge-runtime-45c1a1d2b33b

export async function validateSlackRequest(
  requestBody: string,
  headers: Headers
) {
  const timestamp = headers.get("x-slack-request-timestamp");
  const slackSignature = headers.get("x-slack-signature")!;
  const baseString = "v0:" + timestamp + ":" + requestBody;

  const enc = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(process.env.SLACK_SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  return crypto.subtle.verify(
    "HMAC",
    key,
    hexToBuffer(slackSignature.substring(3)),
    enc.encode(baseString)
  );
}

function hexToBuffer(hex: string) {
  const matches = hex.match(/[\da-f]{2}/gi) ?? []; // grab hex pairs
  const { buffer } = new Uint8Array(matches.map((h) => parseInt(h, 16)));
  return buffer;
}
