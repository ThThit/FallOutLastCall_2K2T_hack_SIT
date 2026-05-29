import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is missing');

const adapter = new PrismaLibSql({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;