import {
  createEnv,
  deleteEnv,
  freeEnv,
  getEnvInfo,
  listEnvs,
  useEnv,
} from "@/utils/redis";
import { formatSay } from "@/utils/response";

export async function handleCreate(params: URLSearchParams) {
  const env = params.get("text")?.split(" ")[0];
  if (!env) {
    return formatSay("Please provide a name.\nFor example: `/env-create dev`.");
  }

  const envInfo = await getEnvInfo(env);
  if (envInfo) {
    return formatSay(`\`${env}\` already exists.`);
  }

  await createEnv(env);
  return formatSay(`Created environment: \`${env}\`.`);
}

export async function handleDelete(params: URLSearchParams) {
  const env = params.get("text")?.split(" ")[0];
  if (!env) {
    return formatSay("Please provide a name.\nFor example: `/env-delete dev`.");
  }

  const envInfo = await getEnvInfo(env);
  if (!envInfo) {
    return formatSay("No environment found with that name.");
  }

  await deleteEnv(env);
  return formatSay(`Deleted environment: \`${env}\`.`);
}

export async function handleUse(params: URLSearchParams) {
  const splitText = params.get("text")!.split(" ");
  const env = splitText[0];
  const description = splitText.slice(1).join(" ") || null;
  if (!env) {
    return formatSay(
      "Please provide a name and optionally a description.\nFor example: `/env-use dev super cool thing`."
    );
  }

  const envInfo = await getEnvInfo(env);
  if (!envInfo) {
    return formatSay(
      `No environment found with that name.\nCreate it with \`/env-create ${env}\`.`
    );
  }

  const { user: existingUser, description: existingDescription } = envInfo;
  if (existingUser) {
    return formatSay(
      `\`${env}\` is in use by <@${existingUser}>.${
        existingDescription
          ? `\nThey are currently working on: ${existingDescription}.`
          : ""
      }`
    );
  }

  const userId = params.get("user_id")!;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  await useEnv(env, userId, description);
  return formatSay(`<@${userId}> is now using \`${env}\`!`);
}

export async function handleFree(params: URLSearchParams) {
  const env = params.get("text")?.split(" ")[0];
  if (!env) {
    return formatSay("Please provide a name.\nFor example: `/env-free dev`.");
  }

  const envInfo = await getEnvInfo(env);
  if (!envInfo) {
    return formatSay(
      `No environment found with that name.\nCreate it with \`/env-create ${env}\`.`
    );
  }

  const { user: existingUser } = envInfo;
  if (!existingUser) {
    return formatSay(
      `\`${env}\` is not currently in use.\nUse it with \`/env-use ${env}\`.`
    );
  }

  const userId = params.get("user_id")!;
  if (existingUser !== userId) {
    return formatSay(
      `\`${env}\` is currently in use by <@${existingUser}>. Please contact them.`
    );
  }

  await freeEnv(env);
  return formatSay(`\`${env}\` is now free!`);
}

export async function handleList(params: URLSearchParams) {
  const envs = await listEnvs();
  const messages = envs.map(([env, { user, description }]) => {
    if (!user) {
      return `\`${env}\` is free.`;
    }
    return `\`${env}\` is in use by \`<@${user}>\`.${
      description ? `\nThey are currently working on: ${description}.` : ""
    }`;
  });
  return formatSay(messages.join("\n\n"));
}
