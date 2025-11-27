//Creado por © MOx Innovation 2023 - Derechos Reservados - licencia MIT

$.getJSON('./assets/api/config.json', (query) => {
    var info = query.config.info
    var fondoCaratula = query.config.fondoCaratula !== undefined ? query.config.fondoCaratula : false
    const liveIndicatorCfg = query.config.liveIndicator || { activo: false }
    const reconexionCfg = query.config.reconexion || { activo: false, intentos: 3, baseMs: 3000, factor: 2.0 }
    const historialCfg = query.config.historial || { activo: false, limite: 8 }
    const visualizerCfg = query.config.visualizer || { activo: false, patrones: { onda: true } }
    const contadorOyentesCfg = query.config.contadorOyentes || { activo: false }
    const preferenciasCfg = query.config.preferencias || { altoContraste: true, focusVisible: true }
    
    // Extraer patrón activo (el primero en true)
    let patronActivo = 'onda';
    if (visualizerCfg.patrones) {
        for (const [nombre, activo] of Object.entries(visualizerCfg.patrones)) {
            if (activo === true) {
                patronActivo = nombre;
                break;
            }
        }
    }
    visualizerCfg.patron = patronActivo;
    var tipoFondo = fondoCaratula ? 'caratula' : 'color'
    var background = query.config.background
    var color = query.config.colorText
    var lottie = query.config.lottie
    var borde = query.config.borde
    var nombre = query.config.nombre
    let api = query.config.api
    let imagen = query.config.imagen
    let redesSociales = query.config.redesSociales || []
    // Pasamos también las configuraciones nuevas para que se activen
    config(info, tipoFondo, background, color, lottie, borde, nombre, api, imagen, redesSociales, liveIndicatorCfg, historialCfg, visualizerCfg, contadorOyentesCfg, reconexionCfg, preferenciasCfg)
})

function config(info, tipoFondo, background, color, lottie, borde, nombre, api, imagen, redesSociales,
                liveIndicatorCfg = {}, historialCfg = {}, visualizerCfg = {}, contadorOyentesCfg = {}, reconexionCfg = {}, preferenciasCfg = { altoContraste: true, focusVisible: true }) {
    
    // Asegurar clase de animación elegante en el contenedor de fondo
    const fondoDinamicoEl = document.getElementById('fondoDinamico');
    if (fondoDinamicoEl && !fondoDinamicoEl.classList.contains('animado')) {
        fondoDinamicoEl.classList.add('animado');
    }

    // Configurar animación: si visualizer está activo, usarlo; si no, usar Lottie por defecto
    if (visualizerCfg.activo) {
        $('#animacion').remove(); // No usar Lottie
    } else {
        // Usar Lottie por defecto
        $('#animacion').html(`<dotlottie-wc id="lottiePlayer" src="${lottie}" style="width: 120%; height: 300px; margin-top: -60px; margin-left: -10%;" autoplay loop></dotlottie-wc>`);
        $('#animacion').addClass('oculto'); // Inicialmente oculto
        $('#waveVisualizer').remove(); // Eliminar visualizer si existe
    }
    
    // ========== CONFIGURACIÓN DE FONDO ==========
    // Verifica el tipo de fondo elegido por el usuario
    if (tipoFondo === 'caratula') {
        // Usa la carátula como fondo difuminado
        $('#body').css('background-color', 'transparent')
        $('#fondoDinamico').show(); // asegurar que el fondo esté visible
        // Color de respaldo mientras carga la imagen
        $('#fondoDinamico').css('background-color', background || '#000000')
        // Inicializar capas de fondo con imagen actual para evitar blanco inicial
        const fondoDinamicoInit = document.getElementById('fondoDinamico');
        if (fondoDinamicoInit) {
            let capaA = fondoDinamicoInit.querySelector('.bg-layer.a');
            let capaB = fondoDinamicoInit.querySelector('.bg-layer.b');
            if (!capaA) {
                capaA = document.createElement('div');
                capaA.className = 'bg-layer a visible';
                fondoDinamicoInit.appendChild(capaA);
            }
            if (!capaB) {
                capaB = document.createElement('div');
                capaB.className = 'bg-layer b';
                fondoDinamicoInit.appendChild(capaB);
            }
            // Fallback inmediato: asignar al contenedor mientras precarga capas
            const imagenInicial = imagen + '&t=' + new Date().getTime();
            if (imagenInicial) {
                fondoDinamicoInit.style.backgroundImage = `url('${imagenInicial}')`;
                // Precargar y mostrar en capa A para activar blur sin dejar blanco
                const preloadInit = new Image();
                preloadInit.crossOrigin = 'anonymous';
                preloadInit.src = imagenInicial;
                preloadInit.onload = function(){
                    capaA.style.backgroundImage = `url('${imagenInicial}')`;
                    capaB.style.backgroundImage = `url('${imagenInicial}')`;
                    capaA.classList.add('visible');
                    capaB.classList.remove('visible');
                    // Quitar color de respaldo una vez que hay imagen
                    fondoDinamicoInit.style.backgroundColor = 'transparent';
                };
                preloadInit.onerror = function(){
                    // Si falla, mantener imagen en el contenedor para no ver blanco
                    capaA.classList.add('visible');
                    capaB.classList.remove('visible');
                };
            }
        }
    } else {
        // Usa color sólido como fondo
        $('#body').css('background-color', background)
        $('#fondoDinamico').hide(); // Oculta el fondo dinámico
    }
    // ========== FIN CONFIGURACIÓN DE FONDO ==========
    
    $('#body').css('color', color)
    $('#album').css('border', `10px solid ${borde}`)
    $('#nombreRadio').text(nombre)
    // Preferencia: desactivar estilos de foco visible
    if (preferenciasCfg.focusVisible === false) {
        document.documentElement.classList.add('no-focus-visible');
    } else {
        document.documentElement.classList.remove('no-focus-visible');
    }
    // Ajuste opcional de contraste de texto según fondo
    function parseColorToRgb(c) {
        try {
            if (!c) return null;
            if (c.startsWith('#')) {
                const hex = c.replace('#','');
                const bigint = parseInt(hex.length===3 ? hex.split('').map(h=>h+h).join('') : hex, 16);
                return { r: (bigint>>16)&255, g: (bigint>>8)&255, b: bigint&255 };
            } else if (c.startsWith('rgb')) {
                const m = c.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
                if (m) return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]) };
            }
        } catch {}
        return null;
    }
    function relLuminance({r,g,b}){
        const srgb = [r,g,b].map(v=>v/255).map(v=> v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4));
        return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
    }
    const cabeceraEl = document.querySelector('.cabecera');
    const bgRgb = parseColorToRgb(background);
    if (bgRgb && (preferenciasCfg.altoContraste !== false)) {
        const lum = relLuminance(bgRgb);
        // Si el fondo es claro (luminancia alta), reforzar legibilidad con sombra
        if (lum > 0.7) {
            document.getElementById('Tema')?.classList.add('alto-contraste');
            cabeceraEl?.classList.add('alto-contraste');
        }
    }
    
    // Placeholder inicial mientras carga metadata
    $('#Tema').text('Conectando...').css('opacity', '0.7')

    // Alternar dirección del deslizamiento del título en cada cambio
    let alternarDireccionTitulo = true;

    // Animación suave de cambio de título sin romper estructura
    function animarCambioTitulo(el, nuevoTexto, direccion = 'izquierda') {
        if (!el) return;
        // Garantizar clase base
        if (!el.classList.contains('titulo-animando')) el.classList.add('titulo-animando');
        // Normalizar estado
        el.classList.remove('salida-izq','salida-der','entrada-izq','entrada-der');
        const outClass = direccion === 'izquierda' ? 'salida-izq' : 'salida-der';
        const inClass = direccion === 'izquierda' ? 'entrada-der' : 'entrada-izq';
        // Fase de salida
        let finalizado = false;
        let fallbackTimer;
        const limpiar = () => {
            if (finalizado) return;
            finalizado = true;
            el.removeEventListener('transitionend', onOutEnd);
            if (fallbackTimer) clearTimeout(fallbackTimer);
        };
        const onOutEnd = (e) => {
            // Asegurar que el evento provenga del propio elemento y de las props relevantes
            if (e && e.target !== el) return;
            if (e && (e.propertyName !== 'opacity' && e.propertyName !== 'transform')) return;
            limpiar();
            // Actualizar texto y preparar entrada desde el lado opuesto
            el.textContent = nuevoTexto;
            // Forzar reflow
            void el.offsetWidth;
            el.classList.remove(outClass);
            el.classList.add(inClass);
            // En el siguiente frame, quitar clase de entrada para animar hacia estado base
            requestAnimationFrame(() => {
                el.classList.remove(inClass);
            });
        };
        el.addEventListener('transitionend', onOutEnd);
        // Fallback: si por alguna razón no llega transitionend de opacity/transform, forzar en ~450ms
        fallbackTimer = setTimeout(() => {
            if (!finalizado) onOutEnd({ propertyName: 'opacity', target: el });
        }, 450);
        // Disparar salida
        el.classList.add(outClass);
    }
    
    // ========== GENERAR ICONOS DE REDES SOCIALES ==========
    // Verifica si hay redes sociales configuradas en el JSON
    if (redesSociales && redesSociales.length > 0) {
        let iconosHTML = '';
        
        // Recorre cada red social configurada
        redesSociales.forEach(red => {
            // Solo genera el HTML si la red está activa (activo !== false)
            // Si "activo" no existe o es true, se muestra
            if (red.activo !== false) {
                
                // Verifica si es una imagen personalizada
                if (red.tipo === 'imagen') {
                    // Genera HTML para imagen personalizada
                    // La imagen se toma de la ruta especificada en red.imagen
                    const nombreRed = (red.enlace || '').includes('instagram') ? 'Instagram' :
                                       (red.enlace || '').includes('facebook') ? 'Facebook' :
                                       (red.enlace || '').includes('youtube') ? 'YouTube' :
                                       (red.enlace || '').includes('tiktok') ? 'TikTok' :
                                       (red.enlace || '').includes('wa.me') || (red.enlace || '').includes('whatsapp') ? 'WhatsApp' : 'Red Social';
                    iconosHTML += `<a href="${red.enlace}" target="_blank" aria-label="Abrir ${nombreRed}">
                        <img src="${red.imagen}" alt="${nombreRed}">
                    </a>`;
                } else {
                    // Si no es imagen, es un icono de Font Awesome
                    // Aplica el color personalizado con inline style
                    const nombreRed = (red.icono || '').includes('facebook') ? 'Facebook' :
                                       (red.icono || '').includes('instagram') ? 'Instagram' :
                                       (red.icono || '').includes('twitter') ? 'X/Twitter' :
                                       (red.icono || '').includes('youtube') ? 'YouTube' :
                                       (red.icono || '').includes('tiktok') ? 'TikTok' :
                                       (red.icono || '').includes('whatsapp') ? 'WhatsApp' :
                                       (red.icono || '').includes('telegram') ? 'Telegram' :
                                       (red.icono || '').includes('discord') ? 'Discord' :
                                       (red.icono || '').includes('spotify') ? 'Spotify' :
                                       (red.icono || '').includes('twitch') ? 'Twitch' : 'Red Social';
                    iconosHTML += `<a href="${red.enlace}" target="_blank" style="color: ${red.color}" aria-label="Abrir ${nombreRed}">
                        <i class="${red.icono}" aria-hidden="true"></i>
                    </a>`;
                }
            }
        });
        
        // Inserta todos los iconos generados en el contenedor #redesSociales
        $('#redesSociales').html(iconosHTML);
    }
    // ========== FIN REDES SOCIALES ==========$
    
    // Aplicar patrón de visualizer según configuración
    if (visualizerCfg.activo) {
        aplicarPatronVisualizer(visualizerCfg.patron);
        // Aplicar duración personalizada si está configurada
        const duracion = (visualizerCfg.duracionMs || 1200) / 1000;
        document.querySelectorAll('.wave-bar').forEach(bar => {
            bar.style.animationDuration = duracion + 's';
        });
    }
    
    // Controlar animación según el estado del reproductor
    const player = document.getElementById('playerRadio');
    const animacion = document.getElementById('animacion');
    const caratula = document.getElementById('album');
    const fondoDinamico = document.getElementById('fondoDinamico');
    const subcontenedor = document.querySelector('.subcontenedor');
    const tema = document.getElementById('Tema');
    
    // Ajustar ancho del visualizador para igualar (o sobresalir ligeramente) al reproductor
    function ajustarAnchoWaveVisualizer(extraTotal = 64) { // 32px por lado
        const wave = document.getElementById('waveVisualizer');
        const audio = document.getElementById('playerRadio');
        if (!wave || !audio) return;
        const w = audio.getBoundingClientRect().width;
        if (w && Number.isFinite(w)) {
            // Evitar desbordes en pantallas pequeñas
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            let target = w + extraTotal;
            const maxAllowed = vw - 24; // deja pequeño margen lateral
            target = Math.max(w, Math.min(target, maxAllowed));
            wave.style.width = target + 'px';
            wave.style.marginLeft = 'auto';
            wave.style.marginRight = 'auto';
        }
    }
    // Ajuste inicial, pequeño reintento tras layout y al redimensionar
    ajustarAnchoWaveVisualizer();
    setTimeout(() => ajustarAnchoWaveVisualizer(), 300);
    window.addEventListener('resize', () => ajustarAnchoWaveVisualizer());
    const liveBadge = document.getElementById('liveBadge');
    let liveBadgeTimeout = null;
    const historialBtn = document.getElementById('toggleHistorial');
    const historialEl = document.getElementById('historial');
    // ====== ACCESIBILIDAD BÁSICA ======
    const audioEl = document.querySelector('#playerRadio audio') || document.querySelector('audio');
    if (audioEl && !audioEl.getAttribute('aria-label')) {
        audioEl.setAttribute('aria-label', 'Reproductor de Radio Mix Zone');
    }
    if (historialBtn && !historialBtn.getAttribute('aria-label')) {
        historialBtn.setAttribute('aria-label', 'Mostrar historial de canciones');
    }
    // ====== RECONEXIÓN ======
    let reconRetries = 0;
    let reconBannerEl = null;

    function crearBannerReconex(){
        if (reconBannerEl) return reconBannerEl;
        const el = document.createElement('div');
        el.id = 'reconexionBanner';
        el.className = 'reconexion-banner d-none';
        el.setAttribute('role','status');
        el.setAttribute('aria-live','polite');
        el.style.position = 'fixed';
        el.style.top = '10px';
        el.style.right = '10px';
        el.style.padding = '10px 12px';
        el.style.borderRadius = '8px';
        el.style.background = '#222';
        el.style.color = '#fff';
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
        el.style.zIndex = '9999';
        el.innerHTML = '<span class="msg">Reconectando…</span> <button type="button" class="btn-reintentar" aria-label="Reintentar" style="margin-left:12px;padding:6px 10px;border:none;border-radius:6px;background:#e63946;color:#fff;cursor:pointer">Reintentar</button>';
        document.body.appendChild(el);
        el.querySelector('.btn-reintentar')?.addEventListener('click', ()=>{
            ocultarBannerReconex();
            reconRetries = 0;
            intentarReconectarAhora();
        });
        // Mejora de foco visible para accesibilidad
        const btn = el.querySelector('.btn-reintentar');
        if (btn) {
            btn.style.outline = 'none';
            btn.addEventListener('focus', ()=>{ btn.style.boxShadow = '0 0 0 3px rgba(230,57,70,0.5)'; });
            btn.addEventListener('blur', ()=>{ btn.style.boxShadow = 'none'; });
        }
        reconBannerEl = el;
        return el;
    }
    function mostrarBannerReconex(texto){
        const el = crearBannerReconex();
        if (texto) el.querySelector('.msg').textContent = texto;
        el.classList.remove('d-none');
    }
    function ocultarBannerReconex(){
        if (reconBannerEl) reconBannerEl.classList.add('d-none');
    }
    function calcularSiguienteBackoff(intentos, baseMs, factor){
        const b = Math.max(1000, baseMs || 3000);
        const f = Math.max(1.2, factor || 2.0);
        return Math.min(60000, Math.round(b * Math.pow(f, intentos - 1)));
    }
    async function intentarReconectarAhora(){
        if (!player) return;
        try {
            await player.play();
            ocultarBannerReconex();
        } catch(err){
            // mantenemos el banner visible si falla
        }
    }
    function programarReintento(){
        if (!reconexionCfg?.activo) return;
        const maxIntentos = reconexionCfg.intentos ?? 3;
        if (reconRetries >= maxIntentos) return; // dejamos banner visible, sin más intentos
        reconRetries += 1;
        const delayMs = calcularSiguienteBackoff(reconRetries, reconexionCfg.baseMs, reconexionCfg.factor);
        mostrarBannerReconex(`Reconectando… intento ${reconRetries}/${maxIntentos}`);
        setTimeout(intentarReconectarAhora, delayMs);
    }

    // ====== LIVE BADGE ======
    if (liveIndicatorCfg.activo) {
        liveBadge.textContent = liveIndicatorCfg.texto || 'EN VIVO';
        liveBadge.style.background = liveIndicatorCfg.colorFondo || '#e63946';
        liveBadge.style.color = liveIndicatorCfg.colorTexto || '#ffffff';
        if (liveIndicatorCfg.pulso) liveBadge.classList.add('pulse');
    }

    // ====== HISTORIAL ======
    const HISTORIAL_KEY = 'radioHistorial';
    const historialLista = [];
    
    // Cargar historial desde localStorage al inicio
    function cargarHistorialGuardado() {
        if (!historialCfg.activo) return;
        try {
            const guardado = localStorage.getItem(HISTORIAL_KEY);
            if (guardado) {
                const datos = JSON.parse(guardado);
                if (Array.isArray(datos)) {
                    historialLista.push(...datos.slice(0, historialCfg.limite || 8));
                    pintarHistorial();
                }
            }
        } catch (e) {
            console.warn('No se pudo cargar historial guardado:', e);
        }
    }
    
    function agregarHistorial(cancion) {
        if (!historialCfg.activo) return;
        if (historialLista[0] === cancion) return; // Evita duplicado consecutivo
        historialLista.unshift(cancion);
        if (historialLista.length > (historialCfg.limite || 8)) historialLista.pop();
        pintarHistorial();
        guardarHistorial();
    }
    
    function guardarHistorial() {
        try {
            localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historialLista));
        } catch (e) {
            console.warn('No se pudo guardar historial:', e);
        }
    }
    function pintarHistorial() {
        if (!historialCfg.activo) return;
        const ul = document.createElement('ul');
        historialLista.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ul.appendChild(li);
        });
        historialEl.innerHTML = '';
        historialEl.appendChild(ul);
    }
    if (historialCfg.activo) {
        historialBtn.classList.remove('d-none');
        historialBtn.addEventListener('click', () => {
            historialEl.classList.toggle('abierto');
            historialEl.classList.toggle('d-none');
        });
        cargarHistorialGuardado();
    }

    // ====== CONTADOR OYENTES ======
    const contadorOyentesEl = document.getElementById('contadorOyentes');
    const numOyentesEl = document.getElementById('numOyentes');
    
    async function actualizarContadorOyentes() {
        if (!contadorOyentesCfg.activo) return;
        
        // Si no hay API configurada, no intentar consultar
        if (!contadorOyentesCfg.api) {
            numOyentesEl.textContent = '0';
            return;
        }
        
        try {
            // Evitar caché del navegador agregando timestamp
            const urlOyentes = contadorOyentesCfg.api + (contadorOyentesCfg.api.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`);
            const response = await fetch(urlOyentes);
            const texto = await response.text();
            
            // Parsear XML
            const parser = new DOMParser();
            const xml = parser.parseFromString(texto, "text/xml");
            
            // Intentar obtener oyentes de diferentes lugares del XML/JSON
            let oyentes = 0;
            
            // Preferencia: selector XML personalizado si está configurado
            if (contadorOyentesCfg.selectorXmlNodo) {
                const nodo = xml.querySelector(contadorOyentesCfg.selectorXmlNodo);
                if (nodo) {
                    const attr = contadorOyentesCfg.selectorXmlAtributo || 'listeners';
                    oyentes = parseInt(nodo.getAttribute(attr)) || 0;
                }
            }

            // Opción 1: XML de RadioBOSS - nodo <Streaming listeners="X"/>
            if (oyentes === 0) {
                const streamingNode = xml.querySelector("Streaming");
                if (streamingNode) {
                    oyentes = parseInt(streamingNode.getAttribute("listeners")) || 0;
                }
            }
            
            // Opción 2: XML de RadioBOSS - atributo LISTENERS en CurrentTrack
            if (oyentes === 0) {
                const trackNode = xml.querySelector("CurrentTrack TRACK");
                if (trackNode) {
                    oyentes = parseInt(trackNode.getAttribute("LISTENERS")) || 0;
                }
            }
            
            // Opción 3: Si es JSON en lugar de XML
            if (oyentes === 0 && texto.startsWith('{')) {
                const data = JSON.parse(texto);
                // Si hay ruta personalizada tipo 'data.stats.active_listeners'
                if (contadorOyentesCfg.selectorJson) {
                    try {
                        const partes = contadorOyentesCfg.selectorJson.split('.');
                        let cursor = data;
                        for (const p of partes) {
                            if (cursor && p in cursor) cursor = cursor[p];
                            else { cursor = undefined; break; }
                        }
                        oyentes = parseInt(cursor) || 0;
                    } catch { /* ignore */ }
                }
                // Fallbacks conocidos
                if (!oyentes) {
                    oyentes = data.listeners || data.currentlisteners || data.oyentes || data.count || 0;
                }
            }
            
            numOyentesEl.textContent = oyentes;
        } catch (e) {
            console.warn('No se pudo obtener contador de oyentes:', e);
            numOyentesEl.textContent = '--';
            programarReintento();
        }
    }
    
    if (contadorOyentesCfg.activo) {
        contadorOyentesEl.style.background = contadorOyentesCfg.colorFondo || '#0088cc';
        contadorOyentesEl.style.color = contadorOyentesCfg.colorTexto || '#ffffff';
        contadorOyentesEl.classList.remove('d-none');
        
        // Primera consulta inmediata
        actualizarContadorOyentes();
        
        // Consultar cada X segundos solo si hay API
        if (contadorOyentesCfg.api) {
            setInterval(actualizarContadorOyentes, contadorOyentesCfg.intervalo || 30000);
        }
    }
    
    player.addEventListener('play', function() {
        // Mostrar animación según configuración
        if (visualizerCfg.activo) {
            const waveVis = document.getElementById('waveVisualizer');
            if (waveVis) {
                waveVis.classList.remove('d-none');
                ajustarAnchoWaveVisualizer();
            }
        } else if (animacion) {
            animacion.classList.remove('oculto');
        }
        // Iniciar rotación de la carátula
        caratula.classList.remove('girando');
        caratula.classList.add('reflejando');
        
        // Iniciar animación del gradiente de fondo si está en modo carátula
        if (tipoFondo === 'caratula') {
            // Agregar reflejos sutiles a los elementos
            subcontenedor.classList.add('reflejando');
            tema.classList.add('reflejando');
            player.classList.add('reflejando');
        } else {
            // Si es color sólido, solo gira sin reflejo
            caratula.classList.add('girando');
        }
        // Live badge
        if (liveIndicatorCfg.activo) {
            liveBadge.classList.remove('d-none');
            if (liveBadgeTimeout) { clearTimeout(liveBadgeTimeout); liveBadgeTimeout = null; }
            const dur = parseInt(liveIndicatorCfg.duracion);
            if (!isNaN(dur) && dur > 0) {
                liveBadgeTimeout = setTimeout(() => {
                    liveBadge.classList.add('d-none');
                    liveBadgeTimeout = null;
                }, dur);
            }
        }
        // Si logra reproducir, ocultar banner y reset de reconexión
        reconRetries = 0;
        ocultarBannerReconex();
    });
    
    player.addEventListener('pause', function() {
        // Ocultar animación según configuración
        if (visualizerCfg.activo) {
            const waveVis = document.getElementById('waveVisualizer');
            if (waveVis) waveVis.classList.add('d-none');
        } else if (animacion) {
            animacion.classList.add('oculto');
        }
        // Detener rotación de la carátula
        caratula.classList.remove('girando');
        caratula.classList.remove('reflejando');
        // Quitar reflejos
        subcontenedor.classList.remove('reflejando');
        tema.classList.remove('reflejando');
        player.classList.remove('reflejando');
        if (liveIndicatorCfg.activo) {
            liveBadge.classList.add('d-none');
            if (liveBadgeTimeout) { clearTimeout(liveBadgeTimeout); liveBadgeTimeout = null; }
        }
    });
    
    player.addEventListener('ended', function() {
        // Ocultar animación según configuración
        if (visualizerCfg.activo) {
            const waveVis = document.getElementById('waveVisualizer');
            if (waveVis) waveVis.classList.add('d-none');
        } else if (animacion) {
            animacion.classList.add('oculto');
        }
        // Detener rotación de la carátula
        caratula.classList.remove('girando');
        caratula.classList.remove('reflejando');
        // Quitar reflejos
        subcontenedor.classList.remove('reflejando');
        tema.classList.remove('reflejando');
        player.classList.remove('reflejando');
        if (liveIndicatorCfg.activo) {
            liveBadge.classList.add('d-none');
            if (liveBadgeTimeout) { clearTimeout(liveBadgeTimeout); liveBadgeTimeout = null; }
        }
    });

    // Variable para guardar la canción anterior
    let cancionAnterior = '';

    // ========== FUNCIÓN PARA EXTRAER COLORES DOMINANTES DE LA CARÁTULA ==========
    function extraerColoresDominantes(imagenURL) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Para evitar problemas CORS
            img.src = imagenURL;
            
            img.onload = function() {
                // Crear un canvas temporal para analizar la imagen
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Redimensionar para mejorar el rendimiento
                canvas.width = 100;
                canvas.height = 100;
                
                // Dibujar la imagen en el canvas
                ctx.drawImage(img, 0, 0, 100, 100);
                
                // Obtener los datos de píxeles
                const imageData = ctx.getImageData(0, 0, 100, 100);
                const data = imageData.data;
                
                // Objeto para contar colores
                let colorCounts = {};
                
                // Analizar cada píxel (saltar de 4 en 4 para mejorar rendimiento)
                for (let i = 0; i < data.length; i += 16) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Ignorar colores muy oscuros o muy claros
                    const brightness = (r + g + b) / 3;
                    if (brightness < 30 || brightness > 225) continue;
                    
                    // Agrupar colores similares (redondear a múltiplos de 30)
                    const rGroup = Math.round(r / 30) * 30;
                    const gGroup = Math.round(g / 30) * 30;
                    const bGroup = Math.round(b / 30) * 30;
                    
                    const colorKey = `${rGroup},${gGroup},${bGroup}`;
                    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
                }
                
                // Ordenar colores por frecuencia
                const sortedColors = Object.entries(colorCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3); // Tomar los 3 colores más frecuentes
                
                if (sortedColors.length > 0) {
                    const colores = sortedColors.map(([color]) => {
                        const [r, g, b] = color.split(',');
                        return `rgb(${r}, ${g}, ${b})`;
                    });
                    resolve(colores);
                } else {
                    // Color por defecto si no se pueden extraer
                    resolve(['rgb(155, 34, 38)', 'rgb(52, 52, 181)', 'rgb(0, 18, 25)']);
                }
            };
            
            img.onerror = function() {
                // Color por defecto en caso de error
                resolve(['rgb(155, 34, 38)', 'rgb(52, 52, 181)', 'rgb(0, 18, 25)']);
            };
        });
    }
    // ========== FIN FUNCIÓN EXTRAER COLORES ==========

    async function cargarTema() {
        const url = api;

        const respuesta = await fetch(url);
        const texto = await respuesta.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(texto, "text/xml");

        const track = xml.querySelector("CurrentTrack > TRACK");

        // Campos del XML
        const artist = track.getAttribute("ARTIST") || "";
        const title = track.getAttribute("TITLE") || "";
        const cast = track.getAttribute("CASTTITLE") || "";

        let final;

        // RadioBOSS a veces no llena ARTIST/TITLE, pero sí CASTTITLE
        if (artist !== "" || title !== "") {
            final = `${artist} - ${title}`;
        } else {
            final = cast;
        }

        // Solo actualizar si hay metadata válida
        if (final && final.trim() !== '' && final !== 'undefined - undefined') {
            const temaEl = document.getElementById("Tema");
            temaEl.style.opacity = '1';
            // Inicial: pintar sin animación si no hay canción previa
            if (!cancionAnterior) {
                temaEl.textContent = final;
                agregarHistorial(final);
            }
        }
        
        // ========== ACTUALIZAR CARÁTULA Y FONDO SOLO SI CAMBIÓ LA CANCIÓN ==========
        // Verifica si la canción actual es diferente a la anterior
        if (final !== cancionAnterior) {
            // La canción cambió, actualiza título con animación, carátula y fondo
            const temaEl = document.getElementById('Tema');
            const direccion = alternarDireccionTitulo ? 'izquierda' : 'derecha';
            animarCambioTitulo(temaEl, final, direccion);
            alternarDireccionTitulo = !alternarDireccionTitulo;
            agregarHistorial(final);

            // Carátula y fondo
            let caratula = document.getElementById('album');
            let imagenURL = imagen + '&t=' + new Date().getTime(); // Añade timestamp para evitar caché
            
            // Actualización directa con precarga para máxima estabilidad
            const preloadAlbum = new Image();
            preloadAlbum.crossOrigin = 'anonymous';
            preloadAlbum.src = imagenURL;
            preloadAlbum.onload = function(){
                caratula.src = imagenURL;
            };
            preloadAlbum.onerror = function(){
                // Si falla, aplicar igualmente para no bloquear la UI
                caratula.src = imagenURL;
            };
            
            // Si el tipo de fondo es "caratula", usar doble capa con precarga y crossfade estable
            if (tipoFondo === 'caratula') {
                let fondoDinamico = document.getElementById('fondoDinamico');
                // Crear capas si no existen
                let capaA = fondoDinamico.querySelector('.bg-layer.a');
                let capaB = fondoDinamico.querySelector('.bg-layer.b');
                if (!capaA) {
                    capaA = document.createElement('div');
                    capaA.className = 'bg-layer a visible';
                    fondoDinamico.appendChild(capaA);
                }
                if (!capaB) {
                    capaB = document.createElement('div');
                    capaB.className = 'bg-layer b';
                    fondoDinamico.appendChild(capaB);
                }
                // Determinar capa oculta y visible
                const capaVisible = fondoDinamico.querySelector('.bg-layer.visible') || capaA;
                const capaOculta = capaVisible === capaA ? capaB : capaA;
                // Asegurar que la capa visible tenga imagen inicial para evitar fondo en blanco
                if (!capaVisible.style.backgroundImage || capaVisible.style.backgroundImage === '') {
                    capaVisible.style.backgroundImage = `url('${imagenURL}')`;
                }
                // Precargar imagen en la capa oculta y hacer crossfade
                const preloadBg = new Image();
                preloadBg.crossOrigin = 'anonymous';
                preloadBg.src = imagenURL;
                preloadBg.onload = function(){
                    capaOculta.style.backgroundImage = `url('${imagenURL}')`;
                    // Crossfade: mostrar oculta y ocultar visible
                    capaOculta.classList.add('visible');
                    capaVisible.classList.remove('visible');
                };
                preloadBg.onerror = function(){
                    // En caso de error, aplicar de todas formas para no bloquear
                    capaOculta.style.backgroundImage = `url('${imagenURL}')`;
                    capaOculta.classList.add('visible');
                    capaVisible.classList.remove('visible');
                };
                
                // Extraer colores dominantes y aplicar gradiente RGB animado
                const colores = await extraerColoresDominantes(imagenURL);
                
                // Crear capa de colores si no existe
                let capaColores = fondoDinamico.querySelector('.capa-colores');
                if (!capaColores) {
                    capaColores = document.createElement('div');
                    capaColores.className = 'capa-colores';
                    fondoDinamico.appendChild(capaColores);
                }
                
                // Crear gradiente animado con los colores extraídos que rota entre ellos
                const gradiente1 = `linear-gradient(135deg, 
                    ${colores[0]} 0%, 
                    ${colores[1] || colores[0]} 50%, 
                    ${colores[2] || colores[0]} 100%)`;
                
                const gradiente2 = `linear-gradient(225deg, 
                    ${colores[1] || colores[0]} 0%, 
                    ${colores[2] || colores[0]} 50%, 
                    ${colores[0]} 100%)`;
                
                const gradiente3 = `linear-gradient(315deg, 
                    ${colores[2] || colores[0]} 0%, 
                    ${colores[0]} 50%, 
                    ${colores[1] || colores[0]} 100%)`;
                
                // Animar entre los diferentes gradientes
                capaColores.style.background = gradiente1;
                capaColores.style.mixBlendMode = 'soft-light';
                
                // Rotar entre gradientes cada 3.5 segundos (suave elegante)
                let gradienteIndex = 0;
                const gradientes = [gradiente1, gradiente2, gradiente3];
                
                // Limpiar intervalo anterior si existe
                if (fondoDinamico.intervaloGradiente) {
                    clearInterval(fondoDinamico.intervaloGradiente);
                }
                
                fondoDinamico.intervaloGradiente = setInterval(() => {
                    gradienteIndex = (gradienteIndex + 1) % gradientes.length;
                    capaColores.style.background = gradientes[gradienteIndex];
                }, 3500);
                // Fondo basado en imagen puede ser ocupado: refuerza contraste del texto (si preferencia activa)
                if (preferenciasCfg.altoContraste !== false) {
                    document.getElementById('Tema')?.classList.add('alto-contraste');
                    document.querySelector('.cabecera')?.classList.add('alto-contraste');
                }
            }
            
            // Guarda la canción actual como anterior para la próxima verificación
            cancionAnterior = final;
        }
        // ========== FIN ACTUALIZAR CARÁTULA Y FONDO ==========
    }

    // Ejecutar cada 5 segundos
    cargarTema();
    setInterval(cargarTema, 5000);

    // Detectar errores del elemento de audio para reconexión
    if (reconexionCfg?.activo && player){
        player.addEventListener('error', ()=>{ programarReintento(); });
        player.addEventListener('stalled', ()=>{ programarReintento(); });
        player.addEventListener('abort', ()=>{ programarReintento(); });
        player.addEventListener('canplay', ()=>{ reconRetries = 0; ocultarBannerReconex(); });
    }
}

// Función centralizada para calcular delay según patrón
function calcularDelayPatron(patron, i, total) {
    const mitad = total / 2;
    
    switch(patron) {
        case 'onda': // Desde extremos al centro
            return i < mitad ? i * 0.025 : (total - i - 1) * 0.025;
        case 'secuencial': // Izquierda a derecha
            return i * 0.015;
        case 'pulso': // Todas al mismo tiempo
            return 0;
        case 'alternado': // Impares/pares
            return (i % 2) * 0.3;
        case 'espejo': // Reflejado desde centro
            return Math.abs(mitad - i) * 0.025;
        case 'aleatorio': // Pseudo-aleatorio controlado
            return (i * 7 % total) * 0.02;
        case 'cascada': // Caída secuencial inversa
            return (total - i) * 0.015;
        case 'doble': // Dos ondas opuestas
            return i < mitad ? i * 0.02 : (i - mitad) * 0.02;
        default:
            return i * 0.025;
    }
}

function aplicarPatronVisualizer(patron) {
    const barras = document.querySelectorAll('.wave-bar');
    if (!barras.length) return;
    
    const total = barras.length;
    barras.forEach((bar, i) => {
        const delay = calcularDelayPatron(patron, i, total);
        bar.style.animationDelay = delay + 's';
    });
}

function carga() {
    $('#album').removeClass('d-none');
    $('#album').addClass('animate__zoomIn');
    $('#spinner').css('display', 'none');
}
