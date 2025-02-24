import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

export default async function globalSetup() {
    dotenv.config({ path: path.resolve(__dirname, '.env.test') });

    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}