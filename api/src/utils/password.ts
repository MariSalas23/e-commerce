// api/src/utils/password.ts
import argon2 from "argon2";

const ARGON2_OPS = {
  // 👇 Usar la constante desde el default export (CJS)
  type: (argon2 as any).argon2id,
  timeCost: Number(process.env.ARGON2_TIME_COST || 3),
  memoryCost: Number(process.env.ARGON2_MEMORY_COST || 65536), // 64 MiB
  parallelism: Number(process.env.ARGON2_PARALLELISM || 1),
};

export async function hashPassword(plain: string) {
  return argon2.hash(plain, ARGON2_OPS);
}

export async function verifyPassword(plain: string, hashed: string) {
  return argon2.verify(hashed, plain, ARGON2_OPS);
}