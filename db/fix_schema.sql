BEGIN;

CREATE TABLE IF NOT EXISTS public.grupo (
  idgrupo SERIAL PRIMARY KEY,
  idnivel integer NOT NULL REFERENCES public.nivel(idnivel) ON DELETE CASCADE,
  numerogrupo integer NOT NULL,
  entrada integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bloqueogrupo (
  idbloqueogrupo SERIAL PRIMARY KEY,
  idgrupo integer NOT NULL REFERENCES public.grupo(idgrupo),
  idbloqueo integer NOT NULL REFERENCES public.bloqueo(idbloqueo)
);

ALTER TABLE public.bloqueo ADD COLUMN IF NOT EXISTS entrada varchar DEFAULT 'N';
ALTER TABLE public.bloqueo ADD COLUMN IF NOT EXISTS salida varchar DEFAULT 'N';
ALTER TABLE public.bloqueo ADD COLUMN IF NOT EXISTS vista varchar DEFAULT 'N';
ALTER TABLE public.bloqueo ADD COLUMN IF NOT EXISTS css varchar DEFAULT 'S';

ALTER TABLE public.nivel ADD COLUMN IF NOT EXISTS validado varchar DEFAULT 'N';
ALTER TABLE public.nivel ADD COLUMN IF NOT EXISTS subidopor varchar;

ALTER TABLE public.botella ADD COLUMN IF NOT EXISTS idgrupo integer;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='botella_grupo_fk') THEN
    ALTER TABLE public.botella ADD CONSTRAINT botella_grupo_fk FOREIGN KEY (idgrupo) REFERENCES public.grupo(idgrupo) ON DELETE RESTRICT;
  END IF;
END$$;

COMMIT;
