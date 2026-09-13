-- Quitar huevsite.io (2/2): preserva por las dudas y recién ahí borra las
-- columnas y el setting. Es segura por sí sola: aunque 0004 nunca se haya
-- corrido, esta migración preserva primero (mismo UPDATE idempotente de
-- 0004) y dropea después, en la misma transacción. El orden entre 0004 y
-- 0005 deja de importar.
-- drizzle/0004 sigue siendo útil corrida antes del deploy: así el código
-- nuevo ve los website_url migrados desde el minuto cero, en vez de esperar
-- a este paso irreversible.
--
-- Va todo en un solo bloque DO porque scripts/migrate.js usa sql.query(), que
-- pasa por el protocolo parametrizado de Postgres: una sentencia top-level por
-- llamada. Sentencias sueltas acá fallarían.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'members' AND column_name = 'huevsite_username'
  ) THEN
    UPDATE members
       SET website_url = 'https://huevsite.io/' || huevsite_username
     WHERE huevsite_username IS NOT NULL
       AND COALESCE(website_url, '') = '';
  END IF;

  ALTER TABLE members DROP COLUMN IF EXISTS huevsite_username;
  ALTER TABLE members DROP COLUMN IF EXISTS huevsite_approved;
  ALTER TABLE members DROP COLUMN IF EXISTS huevsite_featured;

  DELETE FROM app_settings WHERE key = 'huevsite_url';
END $$;
