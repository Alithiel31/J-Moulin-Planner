import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'admin' | 'teamlead' | 'teammate';
  iat?: number;
  exp?: number;
}

export const token = {
  sign: (payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn = '7d') => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, config.jwtSecret, { expiresIn: expiresIn as any });
  },

  verify: (token: string): JWTPayload => {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  },

  decode: (token: string) => {
    return jwt.decode(token) as JWTPayload | null;
  },
};
