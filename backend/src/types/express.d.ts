import type { User } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            hello: string;
            skibidi: string;
            user?: Omit<User, "password">;
        }
    }
}

export {};