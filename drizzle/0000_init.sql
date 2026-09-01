CREATE TABLE IF NOT EXISTS "clients" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" varchar(100) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "password_hash" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "files" (
  "id" serial PRIMARY KEY NOT NULL,
  "client_id" integer NOT NULL REFERENCES "clients"("id") ON DELETE cascade,
  "blob_url" text NOT NULL,
  "pathname" text NOT NULL,
  "filename" varchar(500) NOT NULL,
  "size" integer NOT NULL,
  "mime_type" varchar(255),
  "direction" varchar(20) NOT NULL DEFAULT 'outbound',
  "expires_at" timestamp with time zone,
  "uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
  "download_count" integer DEFAULT 0 NOT NULL,
  "is_zip" boolean DEFAULT false NOT NULL
);

CREATE INDEX IF NOT EXISTS "files_client_id_idx" ON "files" ("client_id");
CREATE INDEX IF NOT EXISTS "files_expires_at_idx" ON "files" ("expires_at");
