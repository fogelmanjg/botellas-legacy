-- Datos iniciales obligatorios para que el sistema funcione

INSERT INTO public.bloqueo (idbloqueo, nombre, bloquea, desbloquea, tipo, entrada, salida, vista, css) VALUES
(1, 'LonaColor', 'No muestra las piezas, no permite sacar, no permite agregar piezas.', 'C', 'lona_color',          'N', 'N', 'N', 'S'),
(2, 'Lona',      'No muestra las piezas, no permite sacar, no permite agregar piezas.', 'S', 'lona',                'N', 'N', 'N', 'S'),
(3, 'Barrera',   'no permite sacar piezas',                                             'G', 'barrera',             'S', 'N', 'S', 'S'),
(4, 'Conos',     'no permite sacar piezas, permite agregarlas. inicia vacia o con piezas de un solo color.', 'N', 'traba', 'S', 'N', 'S', 'S'),
(5, 'Color',     'entrada solo del color',                                              'N', 'contorno botella',    'C', 'S', 'S', 'S'),
(6, 'Hielo',     'No muestra las piezas, no permite sacar, no permite agregar piezas.', 'A', 'hielo sobre botella', 'N', 'N', 'N', 'S');

SELECT setval('public.bloqueo_idbloqueo_seq', (SELECT MAX(idbloqueo) FROM public.bloqueo));

INSERT INTO public.estrategia (nombre, descripcion, peso, activa) VALUES
('completar_botella', 'Prioriza movimientos que completan una botella (4 piezas iguales)', 10,  'S'),
('consolidar_color',  'Mueve piezas del mismo color para consolidar en menos botellas',    20,  'S'),
('despejar_tope',     'Libera el tope de una botella para habilitar movimientos útiles',   40,  'S'),
('fuerza_bruta',      'Prueba todos los movimientos válidos sin heurística',               999, 'S');
