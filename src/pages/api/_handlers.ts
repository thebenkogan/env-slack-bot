import {
  createEnv,
  freeEnv,
  getEnvInfo,
  listEnvs,
  useEnv,
} from "@/utils/redis";
import { say, formatSay } from "@/utils/response";

export async function handleCreate(params: URLSearchParams) {
  const env = params.get("text")?.split(" ")[0];
  if (!env) {
    return say("Please provide a name. For example: /create dev");
  }
  await createEnv(env);
  return say("Created environment: " + env);
}

export async function handleUse(params: URLSearchParams) {
  const splitText = params.get("text")!.split(" ");
  const env = splitText[0];
  const description = splitText.slice(1).join(" ") || null;
  if (!env) {
    return say(
      "Please provide a name and optionally a description. For example: /use dev super cool feature"
    );
  }

  const envInfo = await getEnvInfo(env);
  if (!envInfo) {
    return say(
      `No environment found with that name. Create it with /create ${env}`
    );
  }

  const { user: existingUser, description: existingDescription } = envInfo;
  if (existingUser) {
    return formatSay(
      `${env} is currently in use by <@${existingUser}>. ${
        existingDescription
          ? "They are currently working on: " + existingDescription
          : ""
      }`
    );
  }

  const userId = params.get("user_id")!;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  await useEnv(env, userId, description);
  return formatSay(`<@${userId}> is now using ${env}!`);
}

export async function handleFree(params: URLSearchParams) {
  const env = params.get("text")?.split(" ")[0];
  if (!env) {
    return say("Please provide a name. For example: /free dev");
  }

  const envInfo = await getEnvInfo(env);
  if (!envInfo) {
    return say(
      `No environment found with that name. Create it with /create ${env}`
    );
  }

  const { user: existingUser } = envInfo;
  if (!existingUser) {
    return say(`${env} is not currently in use. Use it with /use ${env}`);
  }

  const userId = params.get("user_id")!;
  if (existingUser !== userId) {
    return formatSay(
      `${env} is currently in use by <@${existingUser}>. Please contact them.`
    );
  }

  await freeEnv(env);
  return say(`${env} is now free!`);
}

export async function handleList(params: URLSearchParams) {
  const envs = await listEnvs();
  const messages = envs.map(([env, { user, description }]) => {
    if (!user) {
      return `${env} is free`;
    }
    return `${env} is in use by <@${user}>. ${
      description ? `They are currently working on: ${description}.` : ""
    }`;
  });
  return formatSay(messages.join("\n"));
}
