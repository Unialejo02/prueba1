# PRD: Expansión del Sistema de Administración NOVVA VALLE

## Problem Statement

El sistema actual tiene un formulario de líder básico (solo nombre, usuario, contraseña, zona), la página principal carga todos los registros de golpe sin control, el perfil de staff no permite navegar a los líderes asignados, y el apartado de credenciales no tiene buscador. A medida que crezca el número de líderes y registros, el sistema será inmanejable.

## Solution

Expandir el formulario de líder con datos personales completos, cambiar la página principal a una vista agrupada por persona bajo demanda, agregar navegación desde staff a perfiles de líderes, y agregar buscador en credenciales.

## User Stories

### Sección 1: Formulario del Líder

1. Como administrador, quiero registrar un líder con primer nombre, segundo nombre (opcional), primer apellido y segundo apellido (opcional) en campos separados, para tener datos precisos de cada persona.
2. Como administrador, quiero que el sistema genere automáticamente el nombre de usuario al ingresar los nombres y apellidos, para evitar errores manuales.
3. Como administrador, quiero que el usuario generado sea `primernombre.primerapellido` en minúsculas sin acentos (ej: `diana.gomez`), para tener usuarios consistentes.
4. Como administrador, quiero que si ese usuario ya exista, el sistema intente `segundonombre.primerapellido` (si tiene segundo nombre), para evitar duplicados automáticamente.
5. Como administrador, quiero que si ambas opciones existen, el sistema agregue un número secuencial (`diana.gomez1`, `diana.gomez2`, etc.), para garantizar unicidad.
6. Como administrador, quiero que la contraseña se genere automáticamente con un formato seguro y memorable (ej: `Valle729!`), para no depender de contraseñas débiles inventadas manualmente.
7. Como administrador, quiero registrar la ciudad de residencia del líder como texto libre, para tener su ubicación.
8. Como administrador, quiero registrar la dirección de residencia del líder como texto libre, para tener su dirección completa.
9. Como administrador, quiero registrar la fecha de nacimiento del líder con un date picker, para saber su edad.
10. Como administrador, quiero seleccionar el estado del líder de una lista desplegable (Pendiente, PSE contratado, PSE en proceso, Contratado-privado, Estudiante, Nombrado, Amigos), para clasificar su situación laboral.
11. Como administrador, quiero registrar la profesión del líder como texto libre, para conocer su ocupación.
12. Como administrador, quiero seleccionar el nivel educativo del líder (Bachiller, Técnico, Tecnólogo, Pregrado, Posgrado), para saber su formación.
13. Como administrador, quiero que al seleccionar "Bachiller" no aparezca ningún campo adicional de estudios, porque no aplica.
14. Como administrador, quiero que al seleccionar "Técnico" aparezca un campo preguntando "¿Cuál es su título técnico?", para registrar su título.
15. Como administrador, quiero que al seleccionar "Tecnólogo" aparezca un campo preguntando "¿Cuál es su título tecnológico?", para registrar su título.
16. Como administrador, quiero que al seleccionar "Pregrado" aparezca un campo preguntando "¿Cuál es su título de pregrado?", para registrar su título.
17. Como administrador, quiero que al seleccionar "Posgrado" aparezcan dos campos: "¿Cuál es su título de posgrado?" y "¿Cuál fue su título de pregrado?", para registrar ambos títulos.
18. Como administrador, quiero ver un campo opcional "Observaciones / Estudios adicionales" (texto grande) para todos los niveles excepto Bachiller, con texto de ayuda "Si tiene otros estudios o certificaciones, puede describirlos aquí (opcional)", para capturar certificaciones o estudios extra.
19. Como administrador, quiero subir la hoja de vida del líder en formato PDF (máximo 5MB), para tener su documento adjunto.
20. Como administrador, quiero que los campos existentes (zona/sector, tipo de credencial, staff asignado) se mantengan igual que antes, para no perder funcionalidad.
21. Como administrador, quiero que el campo de documento (tipo + número) se agregue al formulario del líder, para identificarlo correctamente.
22. Como administrador, quiero que los líderes ya existentes tengan los campos nuevos vacíos y pueda completarlos manualmente al editar, para migrar sin perder datos.

### Sección 2: Página Principal (Registros)

23. Como administrador, quiero que al entrar a la página principal NO se carguen registros automáticamente, para evitar una lista infinita con muchos datos.
24. Como administrador, quiero ver una tarjeta por persona con su total de registros al entrar a la sección Registros, para tener una vista resumida.
25. Como administrador, quiero hacer clic en una tarjeta de persona para desplegar todos sus registros detallados, para ver la información completa bajo demanda.
26. Como administrador, quiero que el filtro desplegable diga "Todos" en vez de "Todos los líderes", para reflejar que incluye a todos.
27. Como administrador, quiero que el filtro "Todos" muestre tanto líderes como miembros del staff, para ver el total real de personas registradas.
28. Como administrador, quiero que al seleccionar "Todos" el conteo refleje el total real de registros de todas las personas del sistema.

### Sección 3: Apartado de Staff

29. Como administrador, quiero ver un botón "Ver perfil" junto a cada líder en la lista de líderes a cargo de un staff, para navegar a su perfil.
30. Como administrador, quiero que al hacer clic en "Ver perfil" se abra la sección Registros con ese líder pre-filtrado, para ver todos sus registros como si lo buscara directamente.
31. Como administrador y staff, quiero que esta opción de "Ver perfil" desde staff esté disponible para los roles admin y staff, para que ambos puedan supervisar los registros de los líderes asignados.

### Sección 4: Credenciales

32. Como administrador, quiero un buscador en el apartado de credenciales para buscar líderes/staff por nombre o número de documento, para encontrarlos rápidamente cuando haya muchos.

## Implementation Decisions

### Modelo de datos del Líder (expandido)

El modelo actual del líder se expande con nuevos campos. Los campos existentes (`id`, `zona`, `tipo`, `staffAsignado`, `role`, `fecha`) se mantienen sin cambios.

**Campos nuevos:**
- `primerNombre` (string, obligatorio) — Primer nombre
- `segundoNombre` (string, opcional) — Segundo nombre
- `primerApellido` (string, obligatorio) — Primer apellido
- `segundoApellido` (string, opcional) — Segundo apellido
- `nombre` (string) — Se mantiene para compatibilidad, se genera automáticamente como combinación de los 4 campos
- `tipoDoc` (string) — Tipo de documento (CC, TI, CE, PA)
- `doc` (string) — Número de documento
- `ciudad` (string) — Ciudad de residencia
- `direccion` (string) — Dirección de residencia
- `fechaNacimiento` (string) — Fecha de nacimiento (formato date)
- `estado` (string) — Estado laboral: Pendiente, PSE contratado, PSE en proceso, Contratado-privado, Estudiante, Nombrado, Amigos
- `profesion` (string) — Profesión
- `nivelEducativo` (string) — Bachiller, Técnico, Tecnólogo, Pregrado, Posgrado
- `tituloNivel` (string) — Título del nivel seleccionado (no aplica para Bachiller)
- `tituloPregrado` (string) — Título de pregrado previo (solo si nivelEducativo = Posgrado)
- `observacionesEstudios` (string, opcional) — Observaciones/estudios adicionales (no aplica para Bachiller)
- `hojaVida` (object, opcional) — Archivo PDF con la misma estructura que certificados: `{ name, size, base64, url }`
- `user` (string) — Generado automáticamente, sin acentos, minúscula
- `pass` (string) — Generada automáticamente con formato `[Palabra][3 dígitos][símbolo]`

### Generación automática de usuario

Algoritmo:
1. Normalizar nombres: quitar acentos y caracteres especiales, convertir a minúscula
2. Intentar `primernombre.primerapellido`
3. Si existe Y tiene segundo nombre: intentar `segundonombre.primerapellido`
4. Si también existe o no tiene segundo nombre: `primernombre.primerapellido1`, incrementando hasta encontrar uno libre

### Generación automática de contraseña

Formato: `[Palabra aleatoria][3 dígitos aleatorios][símbolo especial]` (ej: `Valle729!`). El admin puede ver y compartir la contraseña generada.

### Formulario de Credenciales (expandido)

El modal de Credenciales se amplía con secciones visuales:
- **Sección Datos Personales**: nombres separados, documento, fecha nacimiento
- **Sección Ubicación**: ciudad, dirección, zona/sector
- **Sección Formación Académica**: nivel educativo con campos condicionales, observaciones, profesión
- **Sección Laboral**: estado (dropdown)
- **Sección Acceso**: tipo credencial, staff asignado
- **Sección Adjuntos**: hoja de vida (PDF, máx 5MB)

Los campos de usuario y contraseña se llenan automáticamente pero son visibles/editables.

### Página principal - Vista agrupada por persona

Al entrar a la sección Registros:
- No se cargan registros automáticamente
- Se muestran tarjetas agrupadas por persona (líderes + staff)
- Cada tarjeta muestra: nombre, tipo, total registros, confirmados, con certificado
- Al hacer clic se despliegan los registros detallados de esa persona
- El filtro dropdown incluye líderes y staff individualmente
- La opción "Todos" muestra todas las tarjetas agrupadas

### Navegación Staff → Perfil de Líder

- En la lista de líderes a cargo de un staff, cada líder tiene un botón "Ver perfil"
- Al hacer clic: se navega al tab Registros y se pre-selecciona ese líder en el filtro
- Solo visible para el rol admin

### Buscador en Credenciales

- Barra de búsqueda en la parte superior del panel de Credenciales
- Filtra las tarjetas de credenciales por nombre o número de documento
- Búsqueda en tiempo real mientras se escribe

### Subida de hoja de vida

- Mismo mecanismo que certificados: base64 en localStorage + sync a Google Drive
- Solo formato PDF
- Máximo 5MB
- Se almacena en el campo `hojaVida` del líder

## Testing Decisions

- No hay tests automatizados en el proyecto actual (es una app frontend pura con localStorage)
- Testing será manual, verificando cada user story en el navegador
- Probar especialmente: generación de usuario con duplicados, lógica condicional de nivel educativo, subida de PDF, navegación staff→líder, buscador en credenciales

## Out of Scope

- El líder no ve ni edita su propio perfil (solo el admin)
- No se migran automáticamente los líderes existentes (campos nuevos quedan vacíos)
- No se agrega paginación en la vista agrupada (se evaluará cuando un líder tenga 500+ registros)
- No se cambian los campos del formulario de contactos/registros (esos quedan igual)
- No se cambian las vistas del líder ni del staff (solo cambios en admin)

## Further Notes

- Todos los líderes existentes son de prueba y se pueden completar manualmente
- Los nombres de usuario se manejan sin acentos ni caracteres especiales (normalize NFD)
- Segundo nombre y segundo apellido son opcionales
- El campo "nombre" completo se mantiene para compatibilidad hacia atrás
