const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().min(1),
  DB_PASS: z.string().default(""),
  DB_NAME: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("24h"),
  // API_KEY must be at minimum 32 characters; generate with:
  //   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  API_KEY: z.string().min(32),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  BCRYPT_ROUNDS: z.coerce.number().min(10).default(10),
  BACKUP_DIR: z.string().default("backups"),
  BACKUP_RETENTION_DAYS: z.coerce.number().default(30),
  TZ: z.string().default("Asia/Jakarta"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

module.exports = {
  env: parsed.data,
};
