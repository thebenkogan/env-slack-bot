import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

type EnvHash = {
  user: string | null;
  description: string | null;
};

export async function createEnv(name: string) {
  return await redis.hset(name, { user: null, description: null });
}

export async function getEnvInfo(env: string): Promise<EnvHash | null> {
  return await redis.hgetall(env);
}

export async function useEnv(
  env: string,
  user: string,
  description: string | null
) {
  return await redis.hset(env, { user, description });
}

export async function freeEnv(env: string) {
  return await redis.hset(env, { user: null });
}

export async function listEnvs(): Promise<[string, EnvHash][]> {
  const envs = await redis.keys("*");
  const hashes = await Promise.all(
    envs.map((env) => redis.hgetall<EnvHash>(env))
  );
  return envs.map((env, i) => [env, hashes[i]!]);
}

export async function deleteEnv(env: string) {
  return await redis.del(env);
}
