ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "direction" varchar(20) NOT NULL DEFAULT 'outbound';
ALTER TABLE "files" ALTER COLUMN "expires_at" DROP NOT NULL;
