Resumen del Proyecto Radio Mixzone

Estructura General
Es un reproductor de radio web minimalista y funcional que consume datos desde una API de RadioBOSS.

index.html
Estructura básica con reproductor de audio HTML5
Usa Font Awesome para iconos, Animate.css para animaciones
Integra Lottie para animaciones vectoriales
Incluye jQuery para manipulación del DOM
Elemento clave: <audio id="playerRadio"> con URL de stream hardcodeada
style.css
Diseño centrado y responsive
Layout flexbox para posicionamiento
Spinner de carga (ícono de ventilador animado)
Imagen de álbum circular con borde personalizable
Cabecera fija con logo y nombre de la radio
main.js
Carga configuración desde config.json
Función principal: cargarTema() - consulta la API cada 5 segundos
Parsea XML de RadioBOSS para obtener artista y título
Actualiza carátula del álbum con timestamp para evitar caché
Aplica estilos dinámicos (colores, bordes, animaciones)
config.json
Centraliza toda la configuración visual y de API
Colores: fondo rojo oscuro (#9b2226), texto negro (#001219)
URLs de API, stream y animación Lottie
Nombre de la radio: "Radio Dvj Mix Zone"
Aspectos Destacables:
✅ Código limpio y bien estructurado
✅ Separación de configuración del código lógico
✅ Actualización automática de metadatos
✅ Sistema anti-caché para imágenes

Observaciones Técnicas:
El stream está hardcodeado en el HTML pero también existe en el JSON (no se usa)
Usa técnica de timestamp para forzar recarga de imágenes
Maneja casos donde RadioBOSS no proporciona ARTIST/TITLE completos
