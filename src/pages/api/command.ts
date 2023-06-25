import { validateSlackRequest } from "@/utils/validate";
import { NextRequest, NextResponse } from "next/server";
import { handleCreate, handleFree, handleList, handleUse } from "./_handlers";
import { error } from "console";

export const config = {
  runtime: "edge",
  regions: ["iad1"],
};

const handler = async (request: NextRequest) => {
  const body = await request.text();
  const isValid = await validateSlackRequest(body, request.headers);
  if (!isValid) {
    return error("Invalid Slack request", 401);
  }

  const params = new URLSearchParams(body);
  const command = params.get("command");

  switch (command) {
    case "/create":
      return handleCreate(params);
    case "/use":
      return handleUse(params);
    case "/free":
      return handleFree(params);
    case "/list":
      return handleList(params);
    default:
      return error("Invalid command", 400);
  }
};

export default handler;
