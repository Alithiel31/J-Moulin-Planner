import { hash, verify } from 'argon2';

export const password = {
  hash: async (plainPassword: string) => {
    return await hash(plainPassword, {
      type: 2,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  },

  verify: async (hashedPassword: string, plainPassword: string) => {
    return await verify(hashedPassword, plainPassword);
  },
};
