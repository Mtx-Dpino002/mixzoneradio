# 📻 Guía del Reproductor — Radio Mixzone <a id="intro"></a>

Reproductor web configurable para radios online. Este script integra stream de audio, carátula, metadata, historial, visualizador/Lottie, badge EN VIVO y contador de oyentes, todo manejado desde un único `config.json`. Potencial: fácil integración en sitios, branding personalizado, soporte para múltiples API (XML/JSON), y extensibilidad futura (reintentos, accesibilidad, nuevos patrones de visualizer).

---

## 🧭 Índice

- [Introducción y potencial](#intro)
- [Guía Rápida](#guia-rapida)
- [Estructura del Archivo](#estructura-archivo)
- [Configuración Visual](#config-visual)
- [Selector de Tema](#tema)
- [Animaciones de Transición](#transiciones)
- [Configuración de API y Datos](#config-api)
- [Controles del Reproductor](#controles)
- [Historial de Canciones](#historial)
- [Contador de Oyentes](#contador)
- [Visualizador de Audio](#visualizer)
- [Configuración de Redes Sociales](#redes)
- [Dónde aparece cada cosa (esquema)](#esquema)
- [Paso a Paso para configurar](#pasos)
- [Funcionalidades Automáticas](#auto)
- [Solución de Problemas](#troubleshooting)
- [Licencia](#licencia)

---

## 🚀 Guía Rápida <a id="guia-rapida"></a>

1) Abre `assets/api/config.json`.
2) Cambia `"nombre"` por el nombre de tu radio.
3) Pega tus URLs en `"api"` (metadata), `"imagen"` (carátula) y `"stream"` (audio).
4) Ajusta colores: `"background"`, `"colorText"`, `"borde"`.
5) Activa lo que quieras: `historial`, `visualizer`/`lottie`, `liveIndicator`, `contadorOyentes`.

Guarda y recarga la página con Ctrl+F5.

Atajo: ¿Solo quieres validar? Ve al [Checklist de validación](#checklist).

---

## 📋 Estructura del Archivo <a id="estructura-archivo"></a>

```json
{
  "config": {
    "fondoCaratula": true,
    "background": "#9b2226",
    "colorText": "#001219",
    "imagen": "https://api.mixzoneapp.cl/?pass=XXX&action=trackartwork",
    "api": "https://api.mixzoneapp.cl/?pass=XXX&action=playbackinfo",
    "stream": "https://live.mixzoneapp.cl/stream",
    "lottie": "https://lottie.host/xxxxx/xxxxx.json",
    "borde": "rgb(52, 52, 181)",
    "nombre": "Radio Dvj Mix Zone",
    "redesSociales": [ /* ... */ ],
    "historial": { /* ... */ },
    "visualizer": { /* ... */ },
    "liveIndicator": { /* ... */ },
    "contadorOyentes": { /* ... */ }
    "preferencias": { /* ... */ }


  }
}
```
   - Puedes desactivar esta ayuda estableciendo `"preferencias": { "altoContraste": false }` en `config.json`.

---

## 🎨 Configuración Visual <a id="config-visual"></a>

### `fondoCaratula` ⭐ Fondo Dinámico Configurable
Controla el tipo de fondo del reproductor mediante un boolean en `config.json`.

**Valores:**
- `true` → Usa la carátula del álbum como fondo difuminado con efectos elegantes
- `false` → Usa un color sólido definido en `background`

**Efectos con carátula (`fondoCaratula: true`):**
- ✨ Fondo dinámico que cambia automáticamente con cada canción
- 🎨 Extracción automática de colores RGB dominantes de la carátula
- 🌊 Rotación suave de gradientes con los colores extraídos (cada 4s)
- 💫 Movimiento elegante tipo péndulo (flotación + rotación sutil, 8s)
- 🌫️ Blur difuminado (10px) para profundidad visual
- 🔄 Crossfade estable entre imágenes (300ms) sin barridos verticales
- 🌟 Reflejos sutiles en elementos del reproductor durante reproducción
- 🎭 Overlay oscuro (40% opacidad) para mejorar contraste de texto

**Efectos con color sólido (`fondoCaratula: false`):**
- Solo muestra el color configurado en `background`
- Sin animaciones de fondo
- Carátula circular gira normalmente sin reflejos adicionales
- Ideal para branding corporativo o estética minimalista

**Nota técnica:** El sistema usa dos capas internas con precarga de imagen para evitar parpadeos y barridos al cambiar la carátula. Optimizado con composición GPU (`translateZ`, `backface-visibility`) para transiciones fluidas en todos los navegadores.

**Preset recomendado — Suave Elegante**
- Opacidad base del destello: 0.40; pico: 0.52 (CSS `@keyframes rotacionColores`).
- Duración del ciclo: 3.5s `ease-in-out` (CSS `.fondo-dinamico.animado .capa-colores`).
- Modo de mezcla: `soft-light` (JS sobre `.capa-colores`).
- Rotación de gradientes: cada 3500 ms (JS en `cargarTema()`).

Para ajustar carácter del efecto:
- Intensidad: cambia la opacidad en `@keyframes rotacionColores` (0.40–0.55 recomendado).
- Ritmo: ajusta 3.0–4.0s en CSS y el intervalo en JS a la par.
- Fino vs marcado: alterna `soft-light` (más sutil) u `overlay` (más presente).

### Presets de Destello RGB (valores sugeridos)

- Sutil
  - Opacidad: base 0.38, pico 0.48
  - Duración: 4.0s `ease-in-out`
  - Mezcla: `soft-light`
  - Intervalo gradientes (JS): 4000 ms

- Suave Elegante (actual)
  - Opacidad: base 0.40, pico 0.52
  - Duración: 3.5s `ease-in-out`
  - Mezcla: `soft-light`
  - Intervalo gradientes (JS): 3500 ms

- Intenso
  - Opacidad: base 0.45, pico 0.65
  - Duración: 3.0s `ease-in-out`
  - Mezcla: `overlay`
  - Intervalo gradientes (JS): 3000 ms

Dónde se cambia cada cosa:
- CSS `assets/css/style.css`:
  - Opacidad y duración: búsqueda `@keyframes rotacionColores` y `.fondo-dinamico.animado .capa-colores`.
  - Opacidad base directa de la capa: regla `.fondo-dinamico .capa-colores { opacity: ... }`.
- JS `assets/js/main.js` (función `cargarTema()`):
  - Mezcla: `capaColores.style.mixBlendMode = 'soft-light' | 'overlay'`.
  - Intervalo: `setInterval(() => { ... }, 3500)` (ajusta el valor en ms).

### Snippets listos para copiar/pegar

Usa estos bloques para aplicar rápidamente los presets. Reemplaza solo los valores; no cambies nombres de clases o callbacks si en tu código difieren.

Preset Sutil — CSS
```css
/* Opacidad base de la capa de colores */
.fondo-dinamico .capa-colores { opacity: 0.38; }

/* Pulso de opacidad del destello */
@keyframes rotacionColores {
  0%, 100% { opacity: 0.38; }
  50% { opacity: 0.48; }
}

/* Ritmo del destello */
.fondo-dinamico.animado .capa-colores {
  animation: rotacionColores 4s ease-in-out infinite;
}
```

Preset Sutil — JS
```js
// Mezcla y velocidad del gradiente (deja tu callback tal cual; solo cambia valores)
capaColores.style.mixBlendMode = 'soft-light';
clearInterval(intervaloGradiente);
intervaloGradiente = setInterval(() => { /* rotarGradientes() */ }, 4000);
```

Preset Intenso — CSS
```css
/* Opacidad base de la capa de colores */
.fondo-dinamico .capa-colores { opacity: 0.45; }

/* Pulso de opacidad del destello */
@keyframes rotacionColores {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.65; }
}

/* Ritmo del destello */
.fondo-dinamico.animado .capa-colores {
  animation: rotacionColores 3s ease-in-out infinite;
}
```

Preset Intenso — JS
```js
// Mezcla y velocidad del gradiente (deja tu callback tal cual; solo cambia valores)
capaColores.style.mixBlendMode = 'overlay';
clearInterval(intervaloGradiente);
intervaloGradiente = setInterval(() => { /* rotarGradientes() */ }, 3000);
```

### Solución de problemas

Parpadeos, barridos, fondos en blanco o falta de contraste suelen resolverse con estos ajustes. Los archivos clave son `assets/css/style.css` y `assets/js/main.js`.

- Parpadeo o barrido al cambiar carátula
  - Causa: cambiar `background-image` directo, `backdrop-filter` o transición de `filter` provoca repaints.
  - Solución: usar las dos capas `.bg-layer` (precarga + crossfade). Blur solo en la capa, no en `backdrop-filter`. Verifica `transition: opacity 300ms ease`, `will-change: opacity` y que una tenga `.visible`.

- Fondo blanco al iniciar
  - Causa: la imagen aún no carga o el contenedor está oculto.
  - Solución: define un color de fondo en `config.json` o una imagen por defecto; inicializa la capa visible con una imagen conocida; asegúrate que `#fondoDinamico` sea visible y con `z-index` inferior al contenido.

- La carátula no se actualiza
  - Causa: caché del navegador, URL sin cambios, error de API o CORS.
  - Solución: añade `?t=${Date.now()}` a la URL, valida el endpoint, revisa consola por CORS. Si falla, usa fondo sólido hasta recuperar.

- Destello RGB demasiado fuerte o con poco contraste
  - Causa: opacidad alta o modo `overlay` sobre imágenes claras/oscuras.
  - Solución: baja picos en `@keyframes rotacionColores`, usa `soft-light`, y eleva la opacidad del overlay oscuro (`::after`) a 0.45–0.50 si falta contraste.

- Rendimiento bajo en móvil (saltos o calor)
  - Causa: animaciones que fuerzan repaints (filtros), blur alto, intervalos rápidos.
  - Solución: anima solo `transform`/`opacity`, añade `will-change`, reduce el blur, sube la duración (3.5–4s) y alarga el intervalo de gradientes (3500–4000 ms).

- La capa de colores tapa el contenido
  - Causa: `z-index` o posicionamiento.
  - Solución: `.capa-colores` debe estar dentro de `#fondoDinamico` con `z-index` por debajo de la UI. Asegura que el contenido tenga un `z-index` mayor que el fondo.

- El audio no reproduce (autoplay bloqueado)
  - Causa: políticas de navegador.
  - Solución: requiere una interacción del usuario (botón Play). Opcionalmente inicia en `muted` y desmuta tras interacción.

- Banner de reconexión no desaparece
  - Causa: fallo de red persistente o backoff no limpiado.
  - Solución: revisa los listeners (`error`, `stalled`, `abort`), que se limpie el backoff al reconectar, y valida el endpoint de streaming.

- Historial no guarda o no aparece
  - Causa: `localStorage` deshabilitado/bloqueado o claves inconsistentes.
  - Solución: revisa consola por errores, confirma disponibilidad de `localStorage`, y limpia la clave del historial si quedó corrupta.

- Colores extraídos se ven apagados
  - Causa: combinación `soft-light` sobre imagen oscura.
  - Solución: sube ligeramente el pico de opacidad o cambia temporalmente a `overlay`.

- No se pueden extraer colores del álbum (CORS)
  - Causa: imagen de dominio externo sin CORS deja el canvas "tainted".
  - Solución: usa un proxy con CORS habilitado o usa colores predefinidos para el destello.

### Velocidad del visualizador de ondas

Puedes ajustar la velocidad de animación del visualizador editando `visualizer.duracionMs` en `config.json`:

- Rápido: 900–1000 ms (animación enérgica, ideal para música electrónica/dance)
- Medio (actual): 1200 ms (equilibrado y elegante)
- Lento: 1400–1600 ms (suave y relajado, ideal para baladas o ambient)

Ejemplo:
```json
"visualizer": {
  "activo": true,
  "duracionMs": 1000,
  ...
}
```

### Indicador en Vivo (`liveIndicator`)
Objeto de configuración para mostrar una insignia cuando el stream está activo.
Propiedades:
- `activo`: habilita la insignia.
- `texto`: texto a mostrar (ej: "EN VIVO").
- `colorFondo`: color de fondo del badge.
- `colorTexto`: color del texto.
- `pulso`: agrega animación de pulso.
 - `duracion`: milisegundos para auto-ocultar el badge tras iniciar (ej.: `120000` = 2 minutos). Si no se define o es `0`, no se oculta automáticamente.

Ejemplo:
```json
"liveIndicator": {
  "activo": true,
  "texto": "EN VIVO",
  "colorFondo": "#e63946",
  "colorTexto": "#ffffff",
  "pulso": true,
  "duracion": 120000
}
```

Notas:
- Al presionar `Play`, el badge aparece y se inicia el temporizador.
- Si se pausa o termina, se limpia el temporizador.
- En una nueva reproducción (`Play` otra vez), el badge reaparece y el temporizador se reinicia.

[Volver al índice](#guia-rapida)

### Historial de Canciones (`historial`) ⭐ CON PERSISTENCIA <a id="historial"></a>
Mantiene una lista de las últimas canciones reproducidas y las guarda en `localStorage` del navegador.

**Funcionalidad:**
- 💾 Se guarda automáticamente en el navegador (persiste entre sesiones)
- 📍 Posición: esquina superior derecha en desktop, toggle en mobile
- 🔄 Evita duplicados consecutivos
- 📱 Responsive automático

**Propiedades:**
- `activo`: boolean - Habilita/deshabilita historial
- `limite`: número - Máximo de canciones guardadas (recomendado: 8-15)

**Ejemplo:**
```json
"historial": {
  "activo": true,
  "limite": 10
}
```

**Comportamiento:**
- Desktop: Panel flotante en esquina superior derecha
- Mobile: Botón "Últimos temas" debajo del reproductor
- Los datos persisten aunque cierres el navegador

### Contador de Oyentes (`contadorOyentes`) ⭐ NUEVO <a id="contador"></a>
Muestra un contador en tiempo real de los oyentes conectados al stream.

**Funcionalidad:**
- 🎧 Icono de audífonos con animación sutil
- 🔄 Actualización automática cada X segundos (configurable)
- 🎨 Colores personalizables
- 📊 Compatible con múltiples formatos de API

**Propiedades:**
- `activo`: boolean - Habilita/deshabilita contador
- `api`: string - URL del endpoint que devuelve los oyentes
- `intervalo`: número - Milisegundos entre actualizaciones (default: 30000 = 30s)
- `colorTexto`: string - Color del texto (default: "#ffffff")
- `colorFondo`: string - Color de fondo del badge (default: "#0088cc")
 - `selectorJson`: string - Ruta tipo dot para leer el valor en respuestas JSON (ej: `data.stats.active_listeners`). Opcional.
 - `selectorXmlNodo`: string - Nombre del nodo XML del que leer el atributo (ej: `Streaming`). Opcional.
 - `selectorXmlAtributo`: string - Nombre del atributo a leer del nodo XML (default: `listeners`). Opcional.

**Formatos de API soportados:**
El contador intenta leer estos campos automáticamente:
- `{ "listeners": 42 }`
- `{ "currentlisteners": 42 }`
- `{ "oyentes": 42 }`
- `{ "count": 42 }`
 - XML RadioBOSS: `<Streaming listeners="42"/>` o `<CurrentTrack><TRACK LISTENERS="42"/></CurrentTrack>`

**Ejemplo completo:**
```json
"contadorOyentes": {
  "activo": true,
  "api": "https://api.turadio.com/stats/listeners",
  "intervalo": 30000,
  "colorTexto": "#ffffff",
  "colorFondo": "#000000",
  "selectorJson": "data.stats.active_listeners",
  "selectorXmlNodo": "Streaming",
  "selectorXmlAtributo": "listeners"
}
```

**Ejemplo desactivado:**
```json
"contadorOyentes": {
  "activo": false,
  "api": "",
  "intervalo": 30000,
  "colorTexto": "#ffffff",
  "colorFondo": "#0088cc"
}
```

**Notas importantes:**
- ⚡ Se actualiza inmediatamente al cargar y luego cada X segundos
- 🌐 Si la API falla, muestra "--" en lugar del número
- 🎯 Aparece junto al badge "EN VIVO" en la cabecera
- 📱 Responsive: se ajusta automáticamente en mobile
 - 🧩 Si cambias de endpoint, ajusta `selectorJson` o `selectorXml*` sin tocar el código

### Visualizador de Audio (`visualizer`) ⭐ ACTUALIZADO <a id="visualizer"></a>
Muestra barras animadas con patrones CSS elegantes (sin AudioContext, no interfiere con el audio).

**Funcionalidad:**
- Alterna automáticamente entre visualizer y animación Lottie
- `activo: true` → Muestra visualizer con el patrón seleccionado
- `activo: false` → Muestra animación Lottie por defecto

**Propiedades:**
- `activo`: boolean - Activa/desactiva visualizer
- `barras`: número - Cantidad de barras (recomendado: 24-48, número par)
- `color`: string - Color de las barras (hex o rgb)
- `patrones`: objeto - Lista de patrones disponibles (solo uno debe estar en `true`)

**Patrones Disponibles:**
- `onda` - Ondas desde extremos hacia el centro (efecto simétrico)
- `secuencial` - Ola viajando de izquierda a derecha
- `pulso` - Todas las barras suben/bajan sincronizadas (respiración)
- `alternado` - Barras impares/pares intercaladas
- `espejo` - Reflejado perfecto desde el centro
- `aleatorio` - Pseudo-aleatorio controlado (efecto orgánico)
- `cascada` - Caída secuencial inversa (como cascada)
- `doble` - Dos ondas simultáneas en direcciones opuestas

**Ejemplo completo:**
```json
"visualizer": {
  "activo": true,
  "barras": 48,
  "patrones": {
    "onda": false,
    "secuencial": false,
    "pulso": false,
    "alternado": false,
    "espejo": true,
    "aleatorio": false,
    "cascada": false,
    "doble": false
  },
  "color": "#ffffff"
}
```

**Notas importantes:**
- ✅ Solo un patrón debe estar en `true`, los demás en `false`
- 🔄 El sistema aplica automáticamente el primer patrón marcado como `true`
- 🎨 Responsive: ajusta tamaño automáticamente en mobile
- 🚫 No interfiere con el streaming de audio (solo CSS puro)
- 🎭 Si todos los patrones están en `false`, usa "onda" por defecto
- **Efectos con "color":**
  - Solo muestra el color sólido configurado en `background`
  - Sin animaciones de fondo
  - Carátula gira normalmente sin reflejos

### `background`
- **Tipo:** String (color hexadecimal o rgb)
- **Descripción:** Color de fondo cuando `tipoFondo` es `"color"`
- **Ejemplo:** `"#9b2226"` o `"rgb(155, 34, 38)"`
- **Nota:** Este color no se usa cuando `tipoFondo` es `"caratula"`

### `colorText`
- **Tipo:** String (color hexadecimal o rgb)
- **Descripción:** Color del texto principal (nombre de la canción, artista, etc.)
- **Ejemplo:** `"#001219"`

### `borde`
- **Tipo:** String (color hexadecimal o rgb)
- **Descripción:** Color del borde circular de la carátula del álbum
- **Ejemplo:** `"rgb(52, 52, 181)"`

### `nombre`
- **Tipo:** String
- **Descripción:** Nombre de la radio que aparece en la cabecera junto al logo
- **Ejemplo:** `"Radio Dvj Mix Zone"`

---

---

## 🔌 Configuración de API y Datos <a id="config-api"></a>

### `imagen`
- **Tipo:** String (URL)
- **Descripción:** URL de la API que devuelve la carátula del álbum de la canción actual
- **Ejemplo:** `"https://api.mixzoneapp.cl/?pass=XXX&action=trackartwork"`
- **Nota:** La carátula se actualiza automáticamente cada 5 segundos

### `api`
- **Tipo:** String (URL)
- **Descripción:** URL de la API de RadioBOSS que devuelve información de la canción actual (XML)
- **Ejemplo:** `"https://api.mixzoneapp.cl/?pass=XXX&action=playbackinfo"`
- **Campos XML usados:** `ARTIST`, `TITLE`, `CASTTITLE`

### `stream`
- **Tipo:** String (URL)
- **Descripción:** URL del stream de audio de la radio
- **Ejemplo:** `"https://live.mixzoneapp.cl/stream"`
- **Nota:** Actualmente está hardcodeado en el HTML, pero disponible en config para futura implementación

### `lottie`
- **Tipo:** String (URL)
- **Descripción:** URL del archivo JSON de la animación Lottie (ondas de sonido)
- **Ejemplo:** `"https://lottie.host/xxxxx/xxxxx.json"`
- **Comportamiento:** La animación aparece cuando se presiona Play y desaparece con Pause/Stop

---

[Volver al índice](#guia-rapida)

## 📱 Configuración de Redes Sociales <a id="redes"></a>

La propiedad `redesSociales` es un **array** que puede contener múltiples redes sociales. Cada red social es un objeto con las siguientes propiedades:

### Estructura de una Red Social

```json
{
    "activo": true,
    "tipo": "icono",
    "icono": "fa-brands fa-facebook",
    "enlace": "https://facebook.com/turadio",
    "color": "#1877f2"
}
```

### Propiedades de cada Red Social

#### `activo`
- **Tipo:** Boolean (`true` o `false`)
- **Descripción:** Controla si la red social se muestra o no
- **Valores:**
  - `true` → Se muestra en el reproductor
  - `false` → Se oculta pero mantiene la configuración para activarla después
- **Ejemplo:** `"activo": true`

#### `tipo`
- **Tipo:** String
- **Descripción:** Define si usar un icono de Font Awesome o una imagen personalizada
- **Valores permitidos:**
  - `"icono"` → Usa iconos de Font Awesome
  - `"imagen"` → Usa una imagen personalizada (PNG, SVG, etc.)
- **Ejemplo:** `"tipo": "icono"`

#### `icono` (solo para tipo "icono")
- **Tipo:** String
- **Descripción:** Clases de Font Awesome para el icono
- **Ejemplo:** `"fa-brands fa-facebook"`
- **Iconos disponibles:**
  - Facebook: `"fa-brands fa-facebook"`
  - Instagram: `"fa-brands fa-instagram"`
  - Twitter/X: `"fa-brands fa-twitter"`
  - YouTube: `"fa-brands fa-youtube"`
  - TikTok: `"fa-brands fa-tiktok"`
  - WhatsApp: `"fa-brands fa-whatsapp"`
  - Telegram: `"fa-brands fa-telegram"`
  - Discord: `"fa-brands fa-discord"`
  - Spotify: `"fa-brands fa-spotify"`
  - Twitch: `"fa-brands fa-twitch"`
- **Buscar más iconos:** [fontawesome.com/icons](https://fontawesome.com/icons)

#### `imagen` (solo para tipo "imagen")
- **Tipo:** String (ruta o URL)
- **Descripción:** Ruta de la imagen personalizada
- **Ejemplo:** `"./assets/img/instagram.png"`
- **Recomendaciones:**
  - Tamaño: 32x32px o 64x64px
  - Formato: PNG con transparencia o SVG
  - Ubicación: Guardar en `./assets/img/`

#### `enlace`
- **Tipo:** String (URL)
- **Descripción:** URL de tu perfil en la red social
- **Ejemplo:** `"https://instagram.com/turadio"`
- **Comportamiento:** Se abre en una nueva pestaña al hacer clic

#### `color` (solo para tipo "icono")
- **Tipo:** String (color hexadecimal o rgb)
- **Descripción:** Color del icono de Font Awesome
- **Ejemplo:** `"#1877f2"`
- **Colores oficiales de redes sociales:**
  - Facebook: `#1877f2`
  - Instagram: `#e4405f`
  - Twitter/X: `#1da1f2`
  - YouTube: `#ff0000`
  - TikTok: `#000000` o `#fe2c55`
  - WhatsApp: `#25d366`
  - Telegram: `#0088cc`

---

## 📝 Ejemplos Completos

### Ejemplo de config.json con Fondo de Carátula

```json
{
    "config": {
        "fondoCaratula": true,
        "background": "#9b2226",
        "colorText": "#001219",
        "imagen": "https://api.mixzoneapp.cl/?pass=XXX&action=trackartwork",
        "api": "https://api.mixzoneapp.cl/?pass=XXX&action=playbackinfo",
        "stream": "https://live.mixzoneapp.cl/stream",
        "lottie": "https://lottie.host/xxxxx/xxxxx.json",
        "borde": "rgb(52, 52, 181)",
        "nombre": "Radio Dvj Mix Zone",
        "redesSociales": [...]
        ,
        "preferencias": {
          "altoContraste": true,
          "focusVisible": true
        }
    }
}
```

### Ejemplo de config.json con Fondo de Color Sólido

```json
{
    "config": {
        "fondoCaratula": false,
        "background": "#9b2226",
        "colorText": "#001219",
        "imagen": "https://api.mixzoneapp.cl/?pass=XXX&action=trackartwork",
        "api": "https://api.mixzoneapp.cl/?pass=XXX&action=playbackinfo",
        "stream": "https://live.mixzoneapp.cl/stream",
        "lottie": "https://lottie.host/xxxxx/xxxxx.json",
        "borde": "rgb(52, 52, 181)",
        "nombre": "Radio Dvj Mix Zone",
        "redesSociales": [...]
    }
}
```

### Ejemplo 1: Red Social con Icono Font Awesome

```json
{
    "activo": true,
    "tipo": "icono",
    "icono": "fa-brands fa-facebook",
    "enlace": "https://facebook.com/radiomixzone",
    "color": "#1877f2"
}
```

### Ejemplo 2: Red Social con Imagen Personalizada

```json
{
    "activo": true,
    "tipo": "imagen",
    "imagen": "./assets/img/instagram.png",
    "enlace": "https://instagram.com/radiomixzone"
}
```

### Ejemplo 3: Red Social Desactivada (lista para activar)

```json
{
    "activo": false,
    "tipo": "icono",
    "icono": "fa-brands fa-twitter",
    "enlace": "https://twitter.com/radiomixzone",
    "color": "#1da1f2"
}
```

---

## 👀 Dónde aparece cada cosa (esquema) <a id="esquema"></a>

```
┌──────────────────────────────────────────────────────────────┐
│  Cabecera                                                    │
│  ─ Nombre de la radio   ─  EN VIVO  ─  🎧 Contador           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Carátula circular (gira en Play)                            │
│  Fondo: color sólido o difuminado desde carátula             │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Reproductor (controles nativos: Play/Pause/Volumen)         │
│  Visualizer o Lottie según configuración                     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Redes sociales (iconos o imágenes con enlaces)              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Historial (panel flotante en desktop / botón en mobile)     │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧭 Paso a Paso para configurar <a id="pasos"></a>

- Paso 1: Abre `assets/api/config.json`.
- Paso 2: Cambia `"nombre"` y los colores (`"background"`, `"colorText"`, `"borde"`).
- Paso 3: Pega tus URLs en `"api"` (metadata), `"imagen"` (carátula) y `"stream"` (audio).
- Paso 4: Activa `historial` si quieres guardar últimos temas.
- Paso 5: Elige entre `visualizer` (true) o animación `lottie` (false).
- Paso 6: Activa `liveIndicator` para mostrar el badge EN VIVO.
- Paso 7: Activa `contadorOyentes` y configura su `api` y selectores si tu endpoint cambia.
- Paso 8: Añade tus `redesSociales` (icono o imagen, enlace, color).
- Paso 9: Guarda y recarga con Ctrl+F5.

Consejo: Si algo no aparece, revisa la sección “Solución de Problemas”.

---

## 🌐 Integración vía iframe (opcional)

Para incrustar el reproductor en otra página sin perder funcionalidades, usa un iframe apuntando a tu `index.html` hospedado en HTTPS.

Ejemplo:

```html
<iframe
  src="https://tu-dominio/radio/index.html"
  style="width:100%;max-width:420px;height:700px;border:0;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.15)"
  allow="autoplay"
  loading="lazy">
</iframe>
```

Notas:
- Aísla CSS/JS del sitio contenedor; evita conflictos.
- Mantiene todas las funciones: stream, metadata, carátula, visualizer/Lottie, contador, reconexión y EN VIVO.
- Requisitos: `index.html` y endpoints en HTTPS; si APIs están en otro dominio, habilitar CORS.

---

## 🚀 Cómo Agregar una Nueva Red Social

1. Copia un bloque completo de una red social existente
2. Modifica los valores según tu necesidad
3. Asegúrate de agregar una coma `,` después del bloque anterior
4. Guarda el archivo

**Ejemplo:**

```json
"redesSociales": [
    {
        "activo": true,
        "tipo": "icono",
        "icono": "fa-brands fa-facebook",
        "enlace": "https://facebook.com/turadio",
        "color": "#1877f2"
    },
    {
        "activo": true,
        "tipo": "icono",
        "icono": "fa-brands fa-spotify",
        "enlace": "https://open.spotify.com/user/turadio",
        "color": "#1db954"
    }
]
```

---

## ⚙️ Funcionalidades Automáticas <a id="auto"></a>

### 🎛️ Controles del Reproductor <a id="controles"></a>
- Usa los **controles nativos del navegador** (100% compatibilidad)
- Botones de Play/Pause, control de volumen totalmente funcionales
- Optimizado con `z-index` y `pointer-events` para evitar interferencias
- Responsive y accesible en todos los dispositivos

### 🔄 Actualización de Metadatos
- La información de la canción se actualiza cada **5 segundos**
- La carátula se recarga automáticamente con timestamp para evitar caché
- Muestra **"Conectando..."** mientras carga la primera metadata

### 🧩 Auto-ocultar EN VIVO (opcional)
- Si `liveIndicator.duracion` está configurado (> 0), el badge "EN VIVO" se oculta automáticamente tras ese tiempo al iniciar reproducción. En un nuevo `Play`, reaparece y el temporizador se reinicia.

### 🎵 Animación Lottie / Visualizer
- **Modo Lottie** (`visualizer.activo: false`):
  - Al presionar Play: La animación Lottie aparece y se mueve
  - Al presionar Pause/Stop: La animación desaparece
- **Modo Visualizer** (`visualizer.activo: true`):
  - Al presionar Play: Aparecen barras animadas con el patrón seleccionado
  - Al presionar Pause/Stop: Las barras desaparecen
- ✅ Sin interferencia con el audio (CSS puro)

### 💿 Rotación de Carátula
- **Al presionar Play:** La carátula gira lentamente (12 segundos por rotación)
- **Al presionar Pause/Stop:** La carátula deja de girar
- **Con fondo carátula:** Añade efectos de reflejo sutiles

### 📊 Historial Automático
- Se actualiza cada vez que cambia la canción
- Se guarda en `localStorage` del navegador
- Se carga automáticamente al abrir el reproductor
- Evita duplicados consecutivos

### 🔗 Efectos de Redes Sociales
- **Hover:** Los iconos crecen un 20% y aumentan su brillo
- **Transición:** Efecto suave de 0.3 segundos
- **Tamaño uniforme:** Las imágenes se ajustan a 32x32px automáticamente

### 🔄 Indicador de Reconexión (integrado)
- Detecta errores del `audio` (error, stalled, abort) y fallos puntuales de APIs.
- Muestra un banner discreto con estado “Reconectando…” y botón “Reintentar”.
- Realiza reintentos progresivos (backoff limitado) y oculta el banner al recuperar reproducción.
- No requiere configuración: es parte del reproductor para mejorar la experiencia en redes inestables.

### ♿ Accesibilidad básica (integrada)
- El elemento `<audio>` recibe automáticamente un `aria-label` descriptivo.
- El botón de historial añade `aria-label` para lectores de pantalla.
- Los iconos de redes sociales (imagen o Font Awesome) incluyen `alt`/`aria-label` descriptivos.
- El botón “Reintentar” del banner de reconexión muestra foco visible al navegar con teclado.
 - Preferencia opcional: puedes desactivar los estilos de `:focus-visible` con `"preferencias": { "focusVisible": false }` si prefieres una estética más minimal (se recomienda mantenerlo activo por accesibilidad).

### 🔎 Ajuste de contraste (opcional)
- Si el fondo es un color claro, el script aplica una sombra de texto sutil a `#Tema` y a la cabecera para mejorar legibilidad (sin cambiar tus colores).
- Cuando el fondo usa la carátula difuminada, también refuerza ligeramente el contraste para mantener la lectura.

[Volver al índice](#guia-rapida)

---

[Volver al índice](#guia-rapida)

## ⚠️ Notas Importantes

1. **Formato JSON:** Asegúrate de mantener la sintaxis correcta (comas, comillas, llaves)
2. **Colores:** Puedes usar hexadecimal (`#ffffff`) o rgb (`rgb(255,255,255)`)
3. **URLs:** Siempre usa comillas dobles `"` para las URLs
4. **Imágenes:** Guarda tus iconos personalizados en `./assets/img/`
5. **Pruebas:** Después de modificar, recarga la página para ver los cambios
6. **Accesibilidad (recomendación):** Mantén `preferencias.focusVisible` en `true` para conservar los indicadores de enfoque al navegar con teclado. Si por branding minimal deseas ocultarlos, puedes usar `false`, pero verifica navegabilidad.

---

## 🛠️ Solución de Problemas <a id="troubleshooting"></a>

### La configuración no se aplica
- Verifica que el formato JSON sea correcto (usa un validador JSON online)
- Asegúrate de recargar la página con `Ctrl + F5` para limpiar caché

### Los iconos de Font Awesome no aparecen
- Verifica que las clases sean correctas (ej: `fa-brands fa-facebook`)
- Revisa que Font Awesome esté cargado en el HTML

### Las imágenes no se muestran
- Verifica que la ruta sea correcta
- Asegúrate de que la imagen exista en la carpeta `./assets/img/`
- Comprueba que el formato sea PNG, SVG o JPG

### El contador de oyentes muestra 0
- Verifica que `contadorOyentes.activo` sea `true`.
- Revisa que `contadorOyentes.api` apunte a una URL válida.
- Si tu API es XML, confirma `<Streaming listeners="X">` o `CurrentTrack > TRACK[LISTENERS]`.
- Si tu API es JSON, usa `selectorJson` (ej.: `data.stats.active_listeners`).
- Fuerza recarga (Ctrl+F5) para evitar caché del navegador.

### Lectores de pantalla no anuncian controles
- Asegúrate de que el elemento `<audio>` esté presente en tu `index.html`.
- El script añade `aria-label` automáticamente si el control existe.
- Si personalizas IDs/clases de botones, añade `aria-label` manualmente en tu HTML.

---

## 📄 Licencia <a id="licencia"></a>

© MOx Innovation 2023 - Derechos Reservados - Licencia MIT

---

## ✅ Checklist de validación <a id="checklist"></a>

- Nombre de la radio (`nombre`) actualizado.
- Colores (`background`, `colorText`, `borde`) visibles y legibles.
- URLs configuradas: `api` (metadata), `imagen` (carátula), `stream` (audio).
- Badge EN VIVO (`liveIndicator.activo`) aparece con el color correcto.
- Contador de oyentes (`contadorOyentes.activo`) muestra número válido.
- Redes sociales visibles y con enlaces correctos.
- Visualizer activo o Lottie mostrando según configuración.
- Historial guarda y muestra los últimos temas.

- Recarga forzada realizada (Ctrl+F5) tras cambios.

[Volver al índice](#guia-rapida)

---

## 🔎 Cómo probar accesibilidad (rápido)
- Navegación con teclado: Usa `Tab` y `Shift+Tab` para recorrer controles. Verifica que se vea el foco en botón historial, enlaces de redes y “Reintentar”.
- Contraste de texto: Con `fondoCaratula: true` o fondo claro, confirma que `#Tema` y la cabecera se lean bien (ajuste de contraste opcional activo por defecto).
- Lectores de pantalla: Pasa el cursor por los controles o usa NVDA/VoiceOver; el `<audio>` y el botón historial deben anunciarse con etiquetas claras.

### Buenas prácticas rápidas
- Mantén `preferencias.focusVisible: true` para accesibilidad; desactívalo solo por branding y valida navegabilidad con teclado.
- Usa colores con buen contraste (WCAG AA recomendado: ratio ≥ 4.5:1 para texto normal) y evita texto sobre fondos muy ocupados sin sombras sutiles.
 - Herramienta útil: Calcula el contraste en [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
