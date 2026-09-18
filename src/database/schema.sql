CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
    CREATE TYPE "users_role_enum" AS ENUM ('admin', 'attendant');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "users" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"       varchar(150) NOT NULL,
  "email"      varchar(150) NOT NULL UNIQUE,
  "password"   varchar NOT NULL, 
  "role"       "users_role_enum" NOT NULL DEFAULT 'attendant',
  "created_at" timestamp NOT NULL DEFAULT now()
);