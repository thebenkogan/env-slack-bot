import { validateSlackRequest } from "@/utils/validate";
import { NextRequest } from "next/server";
import {
  handleCreate,
  handleDelete,
  handleFree,
  handleList,
  handleUse,
} from "../../utils/handlers";
import { error } from "@/utils/response";

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
    case "/env-create":
      return handleCreate(params);
    case "/env-use":
      return handleUse(params);
    case "/env-free":
      return handleFree(params);
    case "/env-list":
      return handleList(params);
    case "/env-delete":
      return handleDelete(params);
    default:
      return error("Invalid command", 400);
  }
};

export default handler;
