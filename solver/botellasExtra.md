reglas de la botella extra detalladas.

1) tiene slots vacios, pero no son interdependientes. no usa FILO, sino que cualquier cosa puede entrar en un slot, y salir en cualquier orden
2) la salida de los slots no es voluntaria. si hay un lugar a donde puede ir, va a ir forzosamente a ese lugar. no se puede usar de almacenamiento si puede ir a un slot de una botella.aplican prioridades 3 a 5. 
3) si hay una botella del color, va a ir unicamente a esa botella, no puede ir a otra, aun si coincide el color superior o está vacia.
4) si la botella del color de la pieza en la botella extra tiene una pieza superior de otro color, no puede ir a la botella de su color hasta que este vacia o la pieza que este arriba sea de su color.
5) si una pieza de un color en la botella extra tiene varias opciones elegira en este orden: hay solo 1 o 2 piezas en el fondo de la botella. luego aleatorio.
6) existe una forma de usar la botella extra para cambiar las piezas de una botella, si no está llena la botella: si tienes 2 piezas marrones en una botella, 3 piezas blancas en la botella extra y espacio para las 2 piezas marrones en la botella extra, puedes sacar ambas piezas marrones a la botella extra, y tienes una posibilidad de que entren las piezas blancas. si vuelven a entrar las marrones, puedes repetir hasta que entren las marrones.
7) cuando mueves piezas del mismo color desde una botella a la botella extra, si hay espacio va a moverlas todas. si no hay espacio va a mover solo las que tenga espacio para mover. en caso de que no entren todas, si la prioridad de las piezas de ese color es otra botella distinta a la botella de las que salieron, terminaran automaticamente en la nueva botella. y se podra repetir el proceso con las piezas restantes que terminaran 1 a 1 en la botella destino.

ejemplos practicos:
notacion:
b1:RRBV significa que es la botella 1, con los 4 slots ocupados por los colores RRBV donde el V es el que se saca primero.
extra: xxxxV  significa que la botella extra tiene 5 slots y el 5 esta ocupado por el color V
b1:V > extra1 significa que el color superior de la botella1 va al slot 1 de la botella extra.
b1V:RRBV el color luego del numero de botella y antes de los dos puntos indica que esa botella tiene el bloqueo color, y solo acepta piezas de ese color. 
las letras mayusculas significan color, la x minuscula vacio

ejemplo 1:
b1:RRBV extra:xxxxx
está permitido hacer b1:V > extra:xxVxx o hacer b1:V > extra:Vxxxx

ejemplo 2:
b1:RRBV b2:xxxx
si b1:V > extra:Vxxx entonces automaticamente va a ir desde extra:Vxxx a b2:Vxxx

ejemplo 3:
b1:RRBV b2:xxxx b3V:xxxx
Si b1:V > extra, no puede ir a b2 porque b3 tiene bloqueo de color V, y tiene prioridad.

ejemplo 4:
b1:RRBV b2:xxxx b3V:Rxxx
Si b1:V > extra, V no puede ir a b2 porque b3 tiene bloqueo de color V, y tiene prioridad. pero tampoco puede ir a b3 porque la pieza superior que se muestra es R, y V no puede ir arriba de R. en este caso V queda en botella extra hasta que se quite R de b3.

ejemplo 5:
b1:RRBV b2:VVxx b3:RVxx
si b1:V > extra, V va a ir si o si a b2, porque tiene piezas V en su base, en cambio b3 no tiene V en su base.

ejemplo 5b:
b1:RRBV b2:RVVx b3:RBVx
si b1:V > extra, puede ir aleatoriamente a b2 o b3. siempre puede sacarse nuevamente desde la botella en la que caiga a extra y ver en cual cae. el resultado es el mismo.

ejemplo 6:
b1:RRxx extra:VVVxx
se puede hacer b1:RR > extra. el resultado puede ser b1:RRxx o b1:VVVx
se puede repetir hasta lograr b1:VVVx
solo es necesario que haya suficientes espacios libres en extra.
en el caso de que extra:VVVx no podria hacerse el cambio, porque extra tiene solo 1 espacio libre, y se quiere subir RR que ocupa dos espacios.

ejemplo 7:
b1:VRRx extra:xxxxx
se puede hacer b1:RR > extra, pero no b1:R > extra. hay dos R y hay suficientes espacios libres en extra, por lo tanto se envia todas las piezas R.

ejemplo 7a:
b1:VRRx extra:VVVVx
se puede hacer b1:R > extra, el otro R queda en b1. si hay alguna otra botella donde R pueda ir, va a ir a esa otra botella o volver a b1aparte de b1 aleatoriamente. si vuelve a b1, puede volver a intentarse hasta que vaya a la otra botella. si no hay otro lugar donde pueda ir  R, va a volver automaticamente a b1.


en base a estas reglas se puede simplificar el solver, que ahora está asumiendo que puede mantener las piezas en la botella extra a voluntad, y eso no es asi.