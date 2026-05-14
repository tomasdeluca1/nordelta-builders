CREATE TABLE IF NOT EXISTS "members" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(200) NOT NULL,
  "email" varchar(320) NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "must_change_password" boolean DEFAULT true NOT NULL,
  "initials" varchar(8) NOT NULL,
  "role" varchar(60) NOT NULL,
  "job_title" varchar(80),
  "company" varchar(200),
  "company_url" varchar(500),
  "tags" text[] DEFAULT '{}' NOT NULL,
  "color_index" integer DEFAULT 0 NOT NULL,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "members_status_created_idx" ON "members" ("status", "created_at");
