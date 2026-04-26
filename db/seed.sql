-- Datos iniciales obligatorios para que el sistema funcione
-- Datos iniciales obligatorios para que el sistema funcione

-- La estructura actual de la tabla `bloqueo` creada por las migraciones contiene
-- principalmente: idbloqueo, nombre, bloquea, desbloquea, tipo, agrupa.
-- Insertamos sólo las columnas existentes para evitar errores de compatibilidad.

INSERT INTO public.bloqueo (idbloqueo, nombre, bloquea, desbloquea, tipo, agrupa) VALUES
(1, 'LonaColor', 'No muestra las piezas, no permite sacar, no permite agregar piezas.', 'C', 'lona_color', false),
(2, 'Lona',      'No muestra las piezas, no permite sacar, no permite agregar piezas.', 'S', 'lona', false),
(3, 'Barrera',   'no permite sacar piezas',                                             'G', 'barrera', true),
(4, 'Conos',     'no permite sacar piezas, permite agregarlas. inicia vacia o con piezas de un solo color.', 'N', 'traba', false),
(5, 'Color',     'entrada solo del color',                                              'N', 'contorno botella', false),
(6, 'Hielo',     'No muestra las piezas, no permite sacar, no permite agregar piezas.', 'A', 'hielo sobre botella', false)
ON CONFLICT (idbloqueo) DO NOTHING;

-- Ajustar secuencia para la columna serial (compatible con distintos nombres de secuencia)
SELECT setval(pg_get_serial_sequence('public.bloqueo','idbloqueo'), COALESCE((SELECT MAX(idbloqueo) FROM public.bloqueo), 1), false);

-- Asegurarse de que la tabla `estrategia` exista (algunas migraciones pueden no crearla)
CREATE TABLE IF NOT EXISTS public.estrategia (
	idestategia SERIAL PRIMARY KEY,
	nombre VARCHAR(50) NOT NULL,
	descripcion TEXT,
	peso INTEGER DEFAULT 999 NOT NULL,
	activa CHAR(1) DEFAULT 'S' NOT NULL
);

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM public.estrategia WHERE nombre = 'completar_botella') THEN
		INSERT INTO public.estrategia (nombre, descripcion, peso, activa) VALUES
			('completar_botella', 'Prioriza movimientos que completan una botella (4 piezas iguales)', 10, 'S');
	END IF;
	IF NOT EXISTS (SELECT 1 FROM public.estrategia WHERE nombre = 'consolidar_color') THEN
		INSERT INTO public.estrategia (nombre, descripcion, peso, activa) VALUES
			('consolidar_color', 'Mueve piezas del mismo color para consolidar en menos botellas', 20, 'S');
	END IF;
	IF NOT EXISTS (SELECT 1 FROM public.estrategia WHERE nombre = 'despejar_tope') THEN
		INSERT INTO public.estrategia (nombre, descripcion, peso, activa) VALUES
			('despejar_tope', 'Libera el tope de una botella para habilitar movimientos útiles', 40, 'S');
	END IF;
	IF NOT EXISTS (SELECT 1 FROM public.estrategia WHERE nombre = 'fuerza_bruta') THEN
		INSERT INTO public.estrategia (nombre, descripcion, peso, activa) VALUES
			('fuerza_bruta', 'Prueba todos los movimientos válidos sin heurística', 999, 'S');
	END IF;
END$$;
