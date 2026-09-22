# Plan: réplica pixel-perfect de la pantalla de Calendario de ClickUp

> **Estado (2026-09-22):** Fases 0-8 implementadas y verificadas con Playwright (screenshots del
> calendario, el popover de creación rápida y el modal de detalle, sin errores de consola). De
> regalo se corrigió un bug funcional preexistente: todo el código usaba
> `if (window.QuickCreate)`/`if (window.DetailPanel)` para invocar los otros módulos, pero los
> módulos se declaran con `const`, que no crea una propiedad en `window` en un script clásico —
> esas condiciones nunca eran verdaderas, así que hacer clic en una tarea o en "+" no abría nada.
> Se cambió a llamada directa (`QuickCreate.open(...)`, `DetailPanel.open(...)`,
> `Calendar.render()`).
>
> **Fase 9 (colores exactos) — hecha por muestreo de píxeles real:** en vez de aproximar colores a
> ojo, se abrieron las 4 capturas originales con Playwright + un canvas HTML (`getImageData`) y se
> extrajo el color dominante de cada región de interés. Resultado aplicado al código:
> - Riel de iconos: negro puro `#0A0A0A` (no navy).
> - Banner morado (Release Planning/Sprint 4): `#E8C8EC` sólido, ya no `rgba(color,0.35)`.
> - Tarjetas verdes (GPS): `#CCE8D8` sólido.
> - Tarjetas amarillo/tostado: `#FCE8B4` sólido.
> - Chip de estado "AGENDA": `#FFC43C` (antes usaba el mismo amarillo de categoría).
> - Item activo del panel de listas: gris neutro `#ECECEC` (no tinte morado).
> - Buscador de la topbar: fondo blanco sólido, no gris de app.
> Las tarjetas del calendario ahora pintan `note.color` como fondo sólido directo (ya no
> alpha-blend), así que ese campo en `store.js` pasó de ser el color saturado de categoría a ser
> directamente el pastel de la tarjeta. Los colores saturados de categoría (puntos en el panel,
> avatares, tabs) no se tocaron — siguen siendo los vívidos originales.
>
> Pendiente si se quiere seguir afinando: comparación pixel a pixel más exhaustiva de elementos
> pequeños (iconos de 12-16px, colores de texto) — el muestreo por región funcionó bien para fondos
> grandes pero fue poco confiable para elementos diminutos (dominancia de color <20% en varias
> pruebas), así que esos quedaron con la mejor aproximación visual en vez de dato medido.

Objetivo del usuario: poder crear tareas dentro de esta app clon que se vean **idénticas** a como
aparecen en ClickUp real, para el workspace "Dpto. Producción Editorial". Este documento es el
resultado de analizar las 4 capturas entregadas (vista de calendario mensual completa, hover de
celda vacía, popover de creación rápida, y panel de detalle de tarea abierto en el navegador) y
compararlas contra el código ya existente en este repo.

## 1. Inventario visual confirmado (qué muestra ClickUp realmente)

### 1.1 Barra superior global (NO existe todavía en el repo)
Una franja de ancho completo que va **por encima** tanto del riel de iconos como del panel de
listas — hoy el repo no tiene esta pieza, el nombre del workspace vive dentro de `.panel__header`.
Contenido real, de izquierda a derecha:
- Logo/avatar del workspace ("D", cuadrado morado con esquinas redondeadas) + nombre
  "Dpto. Producción Editorial" + chevron ▾ + icono de calendario pequeño.
- Centro: input de búsqueda "🔍 Buscar  Ctrl K" + píldora "AI Chats ✨".
- Derecha: icono de llamada/teléfono, icono de bandeja/clip, campana de notificaciones, icono de
  recordatorios (alarma), avatar circular del usuario (iniciales, morado), badge "Brain² ▾".

(El reloj rojo "3:52:13" con punto rojo que aparece en la captura 1 es un overlay de grabación de
pantalla del sistema operativo, **no** es parte de la UI de ClickUp — ignorarlo.)

### 1.2 Riel de iconos (sidebar) — tema oscuro, no claro
El repo actual usa `--cu-sidebar-bg: #F7F8FA` (gris claro). En ClickUp real es **oscuro**
(casi negro con tinte azul/morado), iconos claros. Diferencias concretas:
- Item activo ("Inicio"): fondo blanco redondeado detrás del icono + **texto visible debajo**
  ("Inicio"), en vez del actual `sidebar__label { display: none }` + barrita lateral morada.
  Los demás items no muestran texto, solo icono.
- Lista completa de items real (10 + "Más"): Inicio, Chat, Agenda, IA, Documentos, Paneles,
  Pizarras, Formulario, Clips, Hojas de cálculo — el repo actual solo tiene 8 y le faltan
  Pizarras, Formulario, Clips, Hojas de cálculo; además le sobran "Recursos" y "Favoritos" que no
  aparecen en la captura real.
- Avatar de usuario abajo del todo (iniciales "EL"/"E" según la vista).

### 1.3 Panel de listas (segunda columna)
Estructuralmente ya está bien implementado (`Bandeja de entrada` con badge 99+, `Respuestas`,
`Comentarios asignados`, `Habilidades`, `Reuniones`, `Mis tareas`, `Todas las tareas` activo,
`Más`, sección "AI Chats", sección "Compartidas conmigo" con la lista de 11 categorías con punto
de color, sección "Tareas compartidas" con badge, sección "Canales"). Único ajuste: el
`.panel__header` actual repite el nombre del workspace — en la captura real ese nombre solo vive
en la barra superior global (1.1), así que aquí debería quedar solo la fila de iconos de acción
(buscar/+) o eliminarse ese header duplicado.

### 1.4 Cabecera del área principal (header)
- Fila de pestañas: cada pestaña real lleva **icono de tipo de vista** además del punto de color
  (icono de lista, de chat, de calendario con candado para las privadas 🔒, etc.) — hoy solo se
  pinta el punto de color. Hay más pestañas de las que caben ("4 más...") y un botón "+ Vista".
- Fila de controles: izquierda ya coincide bien (Hoy / mes ▾ / ‹ › / título de mes). Derecha real:
  "▼ 1 filtro", icono de llamada▾, icono de check-circular, icono de personas/compartir, avatar
  "E" morado, icono de lupa, botón primario **"+ Tarea ▾"** (con chevron de dropdown). El repo
  actual tiene iconos distintos (⚙, ✕) que no aparecen en la captura real, y dice "+ Nota" en vez
  de "+ Tarea".
- **Renombrar "Nota"→"Tarea" y "Notas"→"Tareas" en toda la UI** (título "Todas las tareas", botón
  "+ Tarea", etc.) — el objetivo explícito del usuario es que esto cree *tareas* como ClickUp, no
  notas.

### 1.5 Grilla del calendario — la brecha más grande
Comparando la captura contra `calendar.js`/`calendar.css` actuales:

- **El número de día va al PIE de cada fila de semana**, no en un header arriba de cada celda. En
  la captura, el patrón por fila de semana es: `[barras de eventos que abarcan varios días]` →
  `[tarjetas de eventos de un día, apiladas]` → `[tira de números de día al fondo, con un botón
  "+" pequeño junto al número]`. El repo actual pone número + "+" en un header de 28px arriba de
  cada celda.
- Además del "+" junto al número, hay un **segundo affordance de hover**: al pasar el mouse sobre
  una celda vacía aparece un botón "+" centrado verticalmente en la celda con un tooltip oscuro
  "Crear Tarea" flotando encima (ver captura 2). Hoy solo existe el "+" de esquina.
- **Altura de fila variable por contenido**: la semana con más tarjetas apiladas (13–19) es
  visiblemente más alta que la semana con pocas (27–3). El CSS actual usa `.calendar__week {
  flex: 1 }`, que reparte el alto disponible en partes iguales sin importar cuántos "tracks" de
  eventos tenga cada semana — hay que calcular la altura según el track máximo de esa semana.
- **Las tarjetas de evento son de varias líneas, no una barra delgada de una sola línea**. Cada
  tarjeta real trae:
  1. Línea superior pequeña y gris: ruta/breadcrumb de la lista, ej. `Desarrollo de
     Infraestructura > Infraestructura`, `Agenda - GPS > ING. Estefano Proaño`, truncada con "..."
     si no cabe.
  2. Línea en negrita: título de la tarea.
  3. Línea pequeña con icono de reloj 🕐 + rango u duración: `7h 10m`, `8:30am-10:30am · 6h 42m`,
     `10:00am-1:00pm`.
  4. A la derecha: avatar circular del responsable, o **pila de avatares + badge "+N"** cuando hay
     varios asignados (ej. "+5", "+1").
  El repo actual (`calendar__event`) es una barra de 22px con solo punto + emoji + título en una
  línea — hay que rediseñarla completa como tarjeta multilínea.
- **Eventos multi-día tipo "banner"** (Release Planning, Sprint 4): son más altos (~48–56px), con
  fondo lila/morado pálido sólido, mismo contenido de 3 líneas + avatar, y ocupan todas las
  columnas que abarcan como una barra continua (esto sí ya existe conceptualmente en
  `assignTracks`/`segmentEvents`, solo falta el tamaño/contenido correcto).
- **Fondo de color de las tarjetas**: se ve como relleno pastel sólido por categoría (verde claro,
  amarillo/tostado claro, lila claro), no el actual `rgba(color, 0.15)` + borde izquierdo de 3px.
  Ajustar a relleno sólido pastel sin borde de acento visible.

### 1.6 Popover de creación rápida (`quick-create`)
Ya está bastante cerca del real. Diferencias puntuales vistas en la captura 3:
- Hay una pequeña "×" de cierre a la izquierda del texto de categoría ("Guías de ClickUp"), que
  hoy no existe en el HTML/JS.
- El último icono de la barra de herramientas en la captura real es un reloj de arena
  (tiempo estimado), no el icono de basura 🗑️ que usa el código actual.

### 1.7 Panel de detalle de tarea — reconstrucción mayor
La captura 4 muestra que al abrir una tarea **no** es un drawer lateral de 700px como el código
actual (`detail-panel.css`), sino un **modal/página a pantalla casi completa** dividido en dos
columnas:

**Barra superior del modal:**
icono de enlace 🔗 + breadcrumb `Agenda - Gestores / ☑ Shared with me 🔒 +4 ▾` + divisor "↩";
a la derecha: texto "Se creó el sep. 18", badge "Brain² ▾", menú "...", icono de estrella
(favorito), icono de layout/paneles, "✕" cerrar.

**Riel de iconos mini** debajo de la barra superior, dentro del modal (vertical, a la izquierda del
contenido): enlace, comentario, refrescar/subtareas, grid — no existe hoy, es exclusivo de esta
vista.

**Columna izquierda (contenido de la tarea, ~65-70% ancho):**
- Selector de tipo: "● Tarea ▾" (punto de color + palabra + chevron) — distinto del breadcrumb
  actual del código.
- Título grande en negrita, editable, sin recuadro visible de input.
- Fila de sugerencia de IA: "🧩 Pídele a Brain² un presentación, documento o prototipo".
- Grid de 2 columnas de campos:
  - Izquierda: **Estado** (chip "AGENDA ▸" + botón de check), **Fechas**
    (`📅 9/23, 10am → 📅 9/23, 1pm (1d)`), **Duración estimada** ("Vacío"), **Registrar el tiempo**
    (botón "○ Start").
  - Derecha: **Personas asignadas** (pila de avatares + "+6"), **Prioridad** ("Vacío"),
    **Puntos de sprint** ("Vacío"), **Etiquetas** ("Vacío").
  - Enlace "Contraer campos vacíos ✕" debajo del grid.
- Descripción: placeholder "Añade una descripción o escribe con ✨ IA".
- Sección **"Campos ⚠"** (custom fields), colapsable, con muchas filas específicas del proyecto:
  Departamento (dropdown "Editorial"), Actualizaciones de p... (truncado, con ⚠ propio), Archivos
  adjuntos, **Avance** (barra de progreso horizontal 0%), Avance por eje %, Departamento
  Respons..., Fecha de Inicio, Fecha de Publicación (sigue más abajo, fuera de cuadro).

**Columna derecha ("Activity" — no existe hoy en absoluto):**
- Header: "Activity" + icono de lupa + campana con contador ("9") + icono de filtro.
- Feed vacío (scroll).
- Compositor de comentario al fondo: textarea "Escribe un comentario...", fila de ~10 iconos
  pequeños (adjuntar, @, emoji, checklist, imagen, video, etc.) y botón enviar con chevron.

## 2. Modelo de datos a extender (`js/store.js`)

Cada nota/tarea necesita campos nuevos para soportar lo anterior — el modelo actual (`title`,
`description`, `startDate`, `endDate`, `category`, `color`, `status`, `emoji`) se queda corto:

- `breadcrumbPath: string` — ej. `"Desarrollo de Infraestructura > Infraestructura"`, para la
  línea superior de la tarjeta y el breadcrumb del panel de detalle.
- `timeStart` / `timeEnd: string | null` — hora del día en formato `"8:30am"`, para mostrar rango
  horario en vez de (o junto a) la duración.
- `durationLabel: string` — ej. `"7h 10m"`, `"19m"`, `"6h 42m"` (puede derivarse o guardarse
  literal).
- `assignees: Array<{ id, initials, color, avatarUrl? }>` — para el avatar único o la pila con
  overflow "+N".
- `taskType: string` — ej. `"Tarea"`, para el selector "● Tarea ▾" del panel de detalle.
- `customFields: Array<{ key, label, type: 'text'|'dropdown'|'progress'|'date', value }>` — para
  renderizar la sección "Campos" de forma genérica en vez de campos hardcodeados.
- `createdAtLabel: string` — texto ya formateado tipo "sep. 18" para "Se creó el sep. 18".

## 3. Plan de implementación por fases

**Fase 0 — Arreglar lo que ya está roto** (bloqueante, no depende de este plan visual):
`js/calendar.js`, `js/utils.js` y `js/detail-panel.js` tienen código ES6 y ES5 duplicado pegado
uno tras otro (falla `node -c` en los tres, ver `CLAUDE.md`). Hay que limpiar eso antes de tocar
nada más, si no cualquier cambio se construye sobre un archivo que no parsea.

**Fase 1 — Tokens y assets base**
- Añadir variables de color para el tema oscuro del riel de iconos, el color de fondo pastel
  sólido por categoría (derivado de `--cu-cat-N` pero como fondo, no borde), y tipografías/tamaños
  usados en tarjetas multilínea.
- Decidir el set de iconos: usar SVG inline estilo *feather* (stroke 2, 24x24, ya usado en el riel
  actual) para todo icono funcional (reloj, candado, chevron, link, comentario, adjuntar, etc.), y
  reservar emoji solo donde ClickUp mismo usa emoji (el emoji elegido por el usuario para la
  tarea, avatares con iniciales). Mezclar menos emoji que el código actual.

**Fase 2 — Barra superior global** (componente nuevo)
- Nuevo HTML fuera de `.app` (o como primera fila dentro, con `.app` en columna): workspace
  switcher, buscador, badge AI Chats, cluster de iconos derecho, avatar, Brain².
- Nuevo `styles/topbar.css` + lógica mínima en JS (abrir dropdown del workspace no es prioritario
  para el objetivo del usuario; puede quedar como no-funcional visualmente fiel).

**Fase 3 — Riel de iconos oscuro**
- Reescribir `.sidebar` a tema oscuro, agregar los items faltantes (Pizarras, Formulario, Clips,
  Hojas de cálculo), quitar los que no aparecen (Recursos, Favoritos), mostrar label solo en el
  item activo con fondo blanco redondeado detrás del icono.

**Fase 4 — Panel de listas: quitar header duplicado**
- Simplificar `.panel__header` (o eliminarlo) ya que el nombre del workspace pasa a la barra
  superior global.

**Fase 5 — Header principal: iconos de pestaña + controles correctos**
- Agregar icono por tipo de vista en cada `.header__tab`, candado 🔒 en las privadas.
- Corregir el set de iconos de `.header__controls-right` para que coincida con la captura
  (llamada▾, check-circular, personas, avatar, lupa) y cambiar "+ Nota" → "+ Tarea ▾".
- Renombrar "Todas las notas" → "Todas las tareas" y todo copy visible de nota→tarea.

**Fase 6 — Rediseño completo de la grilla del calendario** (el núcleo del trabajo)
- Mover el número de día + botón "+" a un pie de fila por semana en vez de header por celda.
- Añadir el segundo "+" centrado con tooltip "Crear Tarea" en hover de celda vacía.
- Calcular altura de cada `.calendar__week` según el número de tracks ocupados esa semana
  (`CalendarUtils.assignTracks` ya devuelve `track`; falta usar el máximo para fijar
  `grid-template-rows`/altura en vez de `flex:1` uniforme).
- Reconstruir `.calendar__event` como tarjeta de 3 líneas + avatar/pila de avatares, con fondo
  pastel sólido por categoría, tanto para eventos de un día como para las barras banner multi-día
  (estas últimas más altas, mismo contenido).
- Ajustar `Calendar.createWeekRow` en `js/calendar.js` para construir el nuevo markup por tarjeta
  (breadcrumb, título, tiempo con icono reloj, avatar(es)) usando los nuevos campos del store.

**Fase 7 — Ajustes menores al popover de creación rápida**
- Agregar botón "×" de cierre junto al texto de categoría.
- Cambiar el icono de basura por un icono de reloj de arena (duración estimada) en la toolbar.

**Fase 8 — Reconstrucción del panel de detalle como modal de dos columnas**
- Cambiar de drawer lateral 700px a overlay que ocupe casi todo el viewport, layout en dos
  columnas (contenido ~65-70% / Activity ~30-35%).
- Barra superior del modal con breadcrumb completo + acciones (favorito, layout, cerrar).
- Riel mini de iconos (link/comentario/refrescar/grid) a la izquierda del contenido.
- Selector de tipo "● Tarea ▾", grid de campos 2 columnas con las etiquetas exactas de la
  captura (Estado, Fechas, Duración estimada, Registrar el tiempo / Personas asignadas,
  Prioridad, Puntos de sprint, Etiquetas), enlace "Contraer campos vacíos".
- Sección "Campos" impulsada por `customFields` del store (renderer genérico por `type`, incluido
  el renderer de barra de progreso para "Avance").
- Columna derecha "Activity": header, feed vacío, compositor de comentario con su fila de iconos.

**Fase 9 — Validación visual**
- `playwright` ya es dependencia del proyecto pero sin tests: usarlo para tomar screenshots del
  build local (`file://` o servidor estático) y compararlos lado a lado con las 4 capturas
  originales, iterando fase por fase hasta que coincidan.

## 4. Decisiones pendientes / lo que necesita confirmación del usuario

- **Colores exactos**: los hex usados en este documento y en `tokens.css` son aproximaciones a
  ojo sobre las capturas (compresión JPG/escalado puede desviar el tono real). Si se requiere
  *pixel-perfect* de verdad, conviene tomar los hex exactos con un eyedropper sobre las capturas
  originales o sobre ClickUp en vivo antes de la Fase 1.
- **Alcance del panel de detalle**: la Fase 8 es la más grande (modal de dos columnas + feed de
  actividad + campos custom genéricos). Si el objetivo inmediato del usuario es solo poder crear
  tarjetas en el calendario que se vean bien, se puede posponer la Fase 8 y priorizar Fases 1-7.
- **Funcionalidad vs. fidelidad visual**: varias piezas de la captura (dropdown del workspace,
  búsqueda real, Brain²/AI, time tracking "Start", filtros) son interactivas en ClickUp real. Este
  plan las trata como **solo visuales** (no funcionales) salvo que el usuario pida lo contrario,
  ya que el objetivo declarado es la apariencia para poder crear tareas, no reimplementar ClickUp
  entero.
