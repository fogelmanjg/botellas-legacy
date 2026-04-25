-- Schema completo de la base de datos botellas
-- Generado el 2026-04-25 desde la instancia de desarrollo

CREATE TABLE public.bloqueo (
    idbloqueo   integer NOT NULL DEFAULT nextval('public.bloqueo_idbloqueo_seq'),
    nombre      character varying(100) NOT NULL,
    bloquea     text,
    desbloquea  text DEFAULT 'N',
    tipo        character varying(20),
    entrada     character varying DEFAULT 'N',
    salida      character varying DEFAULT 'N',
    vista       character varying DEFAULT 'N',
    css         character varying DEFAULT 'S' NOT NULL,
    CONSTRAINT bloqueo_pkey PRIMARY KEY (idbloqueo)
);
CREATE SEQUENCE public.bloqueo_idbloqueo_seq AS integer OWNED BY public.bloqueo.idbloqueo;

CREATE TABLE public.juego (
    idjuego     integer NOT NULL DEFAULT nextval('public.juego_idjuego_seq'),
    nombre      character varying(200) NOT NULL,
    editor      character varying(200),
    validado    character varying DEFAULT 'N',
    subidopor   character varying,
    CONSTRAINT juego_pkey PRIMARY KEY (idjuego)
);
CREATE SEQUENCE public.juego_idjuego_seq AS integer OWNED BY public.juego.idjuego;

CREATE TABLE public.nivel (
    idnivel         integer NOT NULL DEFAULT nextval('public.nivel_idnivel_seq'),
    idjuego         integer,
    numeronivel     integer NOT NULL,
    capacidadextra  integer DEFAULT 0 NOT NULL,
    estadohash      character varying(64),
    validado        character varying DEFAULT 'N',
    subidopor       character varying,
    CONSTRAINT nivel_pkey PRIMARY KEY (idnivel),
    CONSTRAINT nivel_idjuego_fkey FOREIGN KEY (idjuego) REFERENCES public.juego(idjuego) ON DELETE SET NULL
);
CREATE SEQUENCE public.nivel_idnivel_seq AS integer OWNED BY public.nivel.idnivel;

-- Índice único: dentro del mismo juego, numeronivel no puede repetirse
CREATE UNIQUE INDEX nivel_idjuego_numeronivel_uidx
  ON public.nivel(idjuego, numeronivel)
  WHERE idjuego IS NOT NULL;

CREATE TABLE public.grupo (
    idgrupo     integer NOT NULL DEFAULT nextval('public.grupo_idgrupo_seq'),
    idnivel     integer NOT NULL,
    numerogrupo integer NOT NULL,
    entrada     integer NOT NULL,
    CONSTRAINT grupo_pk PRIMARY KEY (idgrupo),
    CONSTRAINT grupo_nivel_fk FOREIGN KEY (idnivel) REFERENCES public.nivel(idnivel) ON DELETE CASCADE
);
CREATE SEQUENCE public.grupo_idgrupo_seq AS integer OWNED BY public.grupo.idgrupo;

CREATE TABLE public.botella (
    idbotella       integer NOT NULL DEFAULT nextval('public.botella_idbotella_seq'),
    idgrupo         integer NOT NULL,
    numerobotella   integer NOT NULL,
    idbloqueo       integer,
    espacio1        character(1),
    espacio2        character(1),
    espacio3        character(1),
    espacio4        character(1),
    color           character(1),
    CONSTRAINT botella_pkey PRIMARY KEY (idbotella),
    CONSTRAINT botella_grupo_fk    FOREIGN KEY (idgrupo)   REFERENCES public.grupo(idgrupo)   ON DELETE RESTRICT,
    CONSTRAINT botella_idbloqueo_fkey FOREIGN KEY (idbloqueo) REFERENCES public.bloqueo(idbloqueo) ON DELETE SET NULL
);
CREATE SEQUENCE public.botella_idbotella_seq AS integer OWNED BY public.botella.idbotella;

CREATE TABLE public.bloqueogrupo (
    idbloqueogrupo  integer NOT NULL DEFAULT nextval('public.bloqueogrupo_idbloqueogrupo_seq'),
    idgrupo         integer NOT NULL,
    idbloqueo       integer NOT NULL,
    CONSTRAINT bloqueogrupo_pk       PRIMARY KEY (idbloqueogrupo),
    CONSTRAINT bloqueogrupo_grupo_fk  FOREIGN KEY (idgrupo)   REFERENCES public.grupo(idgrupo),
    CONSTRAINT bloqueogrupo_bloqueo_fk FOREIGN KEY (idbloqueo) REFERENCES public.bloqueo(idbloqueo)
);
CREATE SEQUENCE public.bloqueogrupo_idbloqueogrupo_seq OWNED BY public.bloqueogrupo.idbloqueogrupo;

CREATE TABLE public.solucion (
    idnivel         integer NOT NULL,
    pasos           jsonb,
    fechacalculo    timestamp without time zone DEFAULT now() NOT NULL,
    estado          character(1) DEFAULT 'P' NOT NULL,
    CONSTRAINT solucion_pkey PRIMARY KEY (idnivel),
    CONSTRAINT solucion_idnivel_fkey FOREIGN KEY (idnivel) REFERENCES public.nivel(idnivel) ON DELETE CASCADE
);

CREATE TABLE public.estrategia (
    idestategia integer NOT NULL DEFAULT nextval('public.estrategia_idestategia_seq'),
    nombre      character varying(50) NOT NULL,
    descripcion text,
    peso        integer DEFAULT 999 NOT NULL,
    activa      character(1) DEFAULT 'S' NOT NULL,
    CONSTRAINT estrategia_pkey PRIMARY KEY (idestategia)
);
CREATE SEQUENCE public.estrategia_idestategia_seq AS integer OWNED BY public.estrategia.idestategia;

CREATE TABLE public.migrations (
    id          integer NOT NULL DEFAULT nextval('public.migrations_id_seq'),
    "timestamp" bigint NOT NULL,
    name        character varying NOT NULL,
    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id)
);
CREATE SEQUENCE public.migrations_id_seq AS integer OWNED BY public.migrations.id;
