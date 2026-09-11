-- Quitar huevsite.io (1/2): preservar los handles como URL en website_url.
-- Aditiva e idempotente: no borra nada. Corre ANTES de deployar el código nuevo.
-- El guard permite re-ejecutarla después de que 0005 borre la columna.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'members' AND column_name = 'huevsite_username'
  ) THEN
    UPDATE members
       SET website_url = 'https://huevsite.io/' || huevsite_username
     WHERE huevsite_username IS NOT NULL
       AND COALESCE(website_url, '') = '';
  END IF;
END $$;
