import { NextResponse } from "next/server";

export function error(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function say(text: string) {
  return NextResponse.json({
    response_type: "in_channel",
    text,
  });
}

export function formatSay(text: string) {
  return NextResponse.json({
    response_type: "in_channel",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text,
        },
      },
    ],
  });
}
