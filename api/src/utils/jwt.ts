// api/src/utils/jwt.ts
import jwt from "jsonwebtoken";

// Secret tipado explícitamente
const JWT_SECRET: jwt.Secret = (process.env.JWT_SECRET ?? "dev") as jwt.Secret;

const SIGN_OPTS: jwt.SignOptions = { algorithm: "HS256" };
const VERIFY_OPTS: jwt.VerifyOptions = { algorithms: ["HS256"] };

export function signJwt(
  payload: Record<string, any>,
  expiresIn: jwt.SignOptions["expiresIn"] = "30d"
): string {
  return jwt.sign(payload, JWT_SECRET, { ...SIGN_OPTS, expiresIn });
}

export function verifyJwt<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET, VERIFY_OPTS) as T;
  } catch {
    return null;
  }
}