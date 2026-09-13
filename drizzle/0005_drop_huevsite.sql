-- Quitar huevsite.io (2/2): borra las columnas y el setting.
-- Corre DESPUÉS de deployar el código que ya no las lee. Idempotente.
--
-- Va todo en un solo bloque DO porque scripts/migrate.js usa sql.query(), que
-- pasa por el protocolo parametrizado de Postgres: una sentencia top-level por
-- llamada. Cuatro sentencias sueltas acá fallarían.
DO $$
BEGIN
  ALTER TABLE members DROP COLUMN IF EXISTS huevsite_username;
  ALTER TABLE members DROP COLUMN IF EXISTS huevsite_approved;
  ALTER TABLE members DROP COLUMN IF EXISTS huevsite_featured;

  DELETE FROM app_settings WHERE key = 'huevsite_url';
END $$;
