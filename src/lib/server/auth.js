import jwt from 'jsonwebtoken';
import { hash, verify } from 'argon2';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '7d';

export async function hashPassword(password) {
  return await hash(password, {
    type: 2, // argon2id
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}

export async function verifyPassword(password, hash) {
  try {
    return await verify(hash, password);
  } catch {
    return false;
  }
}

export function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
