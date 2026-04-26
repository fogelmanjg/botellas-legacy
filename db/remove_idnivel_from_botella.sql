BEGIN;

-- Drop foreign key constraint if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints tc WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_name='botella' AND tc.constraint_name='botella_idnivel_fkey') THEN
    ALTER TABLE public.botella DROP CONSTRAINT botella_idnivel_fkey;
  END IF;
END$$;

-- Drop column if exists
ALTER TABLE public.botella DROP COLUMN IF EXISTS idnivel;

COMMIT;
