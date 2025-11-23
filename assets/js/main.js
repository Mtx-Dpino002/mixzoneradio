//Creado por © MOx Innovation 2023 - Derechos Reservados - licencia MIT

$.getJSON('./assets/api/config.json', (query) => {
    var info = query.config.info
    var background = query.config.background
    var color = query.config.colorText
    var lottie = query.config.lottie
    var borde = query.config.borde
    var nombre = query.config.nombre
    let api = query.config.api
    let imagen = query.config.imagen
    config(info, background, color, lottie, borde, nombre, api, imagen)
})

function config(info, background, color, lottie, borde, nombre, api, imagen) {
    $('#animacion').html(`<dotlottie-wc src="${lottie}" style="width: 120%; height: 300px; margin-top: -60px; margin-left: -45%;" autoplay loop></dotlottie-wc>`)
    $('#body').css('background-color', background)
    $('#body').css('color', color)
    $('#album').css('border', `10px solid ${borde}`)
    $('#nombreRadio').text(nombre)


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

        document.getElementById("Tema").textContent = final;
        
        // Actualizar la carátula al mismo tiempo que cambia la información
        let caratula = document.getElementById('album');
        caratula.src = imagen + '&t=' + new Date().getTime(); // Añade timestamp para evitar caché
    }

    // Ejecutar cada 5 segundos
    cargarTema();
    setInterval(cargarTema, 5000);
}

function carga() {
    $('#album').removeClass('d-none');
    $('#album').addClass('animate__zoomIn');
    $('#spinner').css('display', 'none');
}




