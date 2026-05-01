-- Schema completo de la base de datos botellas
-- Orden: sequences → tablas independientes → tablas con FK → índices → OWNED BY

-- ── Sequences ────────────────────────────────────────────────────

CREATE SEQUENCE public.bloqueo_idbloqueo_seq         AS integer;
CREATE SEQUENCE public.juego_idjuego_seq             AS integer;
CREATE SEQUENCE public.estrategia_idestategia_seq    AS integer;
CREATE SEQUENCE public.nivel_idnivel_seq             AS integer;
CREATE SEQUENCE public.grupo_idgrupo_seq             AS integer;
CREATE SEQUENCE public.botella_idbotella_seq         AS integer;
CREATE SEQUENCE public.bloqueogrupo_idbloqueogrupo_seq AS integer;
CREATE SEQUENCE public.migrations_id_seq             AS integer;

-- ── Tablas independientes ─────────────────────────────────────────

CREATE TABLE public.bloqueo (
    idbloqueo   integer      NOT NULL DEFAULT nextval('public.bloqueo_idbloqueo_seq'),
    nombre      varchar(100) NOT NULL,
    bloquea     text,
    desbloquea  text                  DEFAULT 'N',
    tipo        varchar(20),
    entrada     varchar              DEFAULT 'N',
    salida      varchar              DEFAULT 'N',
    vista       varchar              DEFAULT 'N',
    css         varchar              DEFAULT 'S' NOT NULL,
    CONSTRAINT bloqueo_pkey PRIMARY KEY (idbloqueo)
);

CREATE TABLE public.juego (
    idjuego     integer      NOT NULL DEFAULT nextval('public.juego_idjuego_seq'),
    nombre      varchar(200) NOT NULL,
    editor      varchar(200),
    validado    varchar              DEFAULT 'N',
    subidopor   varchar,
    CONSTRAINT juego_pkey PRIMARY KEY (idjuego)
);

CREATE TABLE public.estrategia (
    -- Nota: columna se llama "idestategia" (sin segunda 'r') — nombre original de la DB
    idestategia integer      NOT NULL DEFAULT nextval('public.estrategia_idestategia_seq'),
    nombre      varchar(50)  NOT NULL,
    descripcion text,
    peso        integer              DEFAULT 999 NOT NULL,
    activa      char(1)              DEFAULT 'S' NOT NULL,
    CONSTRAINT estrategia_pkey PRIMARY KEY (idestategia)
);

CREATE TABLE public.migrations (
    id          integer      NOT NULL DEFAULT nextval('public.migrations_id_seq'),
    "timestamp" bigint       NOT NULL,
    name        varchar      NOT NULL,
    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id)
);

-- ── Tablas con FK ─────────────────────────────────────────────────

CREATE TABLE public.nivel (
    idnivel         integer     NOT NULL DEFAULT nextval('public.nivel_idnivel_seq'),
    idjuego         integer     NOT NULL,
    numeronivel     integer     NOT NULL,
    capacidadextra  integer     NOT NULL DEFAULT 0,
    estadohash      varchar(64),
    validado        varchar          DEFAULT 'N',
    subidopor       varchar,
    CONSTRAINT nivel_pkey        PRIMARY KEY (idnivel),
    CONSTRAINT nivel_idjuego_fkey FOREIGN KEY (idjuego) REFERENCES public.juego(idjuego) ON DELETE RESTRICT
);

CREATE TABLE public.grupo (
    idgrupo     integer NOT NULL DEFAULT nextval('public.grupo_idgrupo_seq'),
    idnivel     integer NOT NULL,
    numerogrupo integer NOT NULL,
    entrada     integer NOT NULL,
    CONSTRAINT grupo_pk       PRIMARY KEY (idgrupo),
    CONSTRAINT grupo_nivel_fk FOREIGN KEY (idnivel) REFERENCES public.nivel(idnivel) ON DELETE CASCADE
);

CREATE TABLE public.botella (
    idbotella     integer NOT NULL DEFAULT nextval('public.botella_idbotella_seq'),
    idgrupo       integer NOT NULL,
    numerobotella integer NOT NULL,
    idbloqueo     integer,
    espacio1      char(1),
    espacio2      char(1),
    espacio3      char(1),
    espacio4      char(1),
    color         char(1),
    CONSTRAINT botella_pkey           PRIMARY KEY (idbotella),
    CONSTRAINT botella_grupo_fk       FOREIGN KEY (idgrupo)   REFERENCES public.grupo(idgrupo)     ON DELETE RESTRICT,
    CONSTRAINT botella_idbloqueo_fkey FOREIGN KEY (idbloqueo) REFERENCES public.bloqueo(idbloqueo) ON DELETE SET NULL
);

CREATE TABLE public.bloqueogrupo (
    idbloqueogrupo integer NOT NULL DEFAULT nextval('public.bloqueogrupo_idbloqueogrupo_seq'),
    idgrupo        integer NOT NULL,
    idbloqueo      integer NOT NULL,
    CONSTRAINT bloqueogrupo_pk         PRIMARY KEY (idbloqueogrupo),
    CONSTRAINT bloqueogrupo_grupo_fk   FOREIGN KEY (idgrupo)   REFERENCES public.grupo(idgrupo),
    CONSTRAINT bloqueogrupo_bloqueo_fk FOREIGN KEY (idbloqueo) REFERENCES public.bloqueo(idbloqueo)
);

CREATE TABLE public.solucion (
    idnivel      integer   NOT NULL,
    pasos        jsonb,
    fechacalculo timestamp NOT NULL DEFAULT now(),
    estado       char(1)   NOT NULL DEFAULT 'P',
    CONSTRAINT solucion_pkey        PRIMARY KEY (idnivel),
    CONSTRAINT solucion_idnivel_fkey FOREIGN KEY (idnivel) REFERENCES public.nivel(idnivel) ON DELETE CASCADE
);

-- ── Índices ───────────────────────────────────────────────────────

CREATE UNIQUE INDEX nivel_idjuego_numeronivel_uidx ON public.nivel(idjuego, numeronivel);

-- ── Sequences OWNED BY ────────────────────────────────────────────

ALTER SEQUENCE public.bloqueo_idbloqueo_seq              OWNED BY public.bloqueo.idbloqueo;
ALTER SEQUENCE public.juego_idjuego_seq                  OWNED BY public.juego.idjuego;
ALTER SEQUENCE public.estrategia_idestategia_seq         OWNED BY public.estrategia.idestategia;
ALTER SEQUENCE public.nivel_idnivel_seq                  OWNED BY public.nivel.idnivel;
ALTER SEQUENCE public.grupo_idgrupo_seq                  OWNED BY public.grupo.idgrupo;
ALTER SEQUENCE public.botella_idbotella_seq              OWNED BY public.botella.idbotella;
ALTER SEQUENCE public.bloqueogrupo_idbloqueogrupo_seq    OWNED BY public.bloqueogrupo.idbloqueogrupo;
ALTER SEQUENCE public.migrations_id_seq                  OWNED BY public.migrations.id;
