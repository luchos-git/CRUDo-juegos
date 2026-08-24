// manejo de eventos de la pagina: que pasa cuando hago click, envio un formulario, etc
// las funciones que uso aca (mostrarJuegos, agregarJuego, etc) estan en modulos.js

// todo esto arranca recien cuando el html termino de cargar, para asegurarme de que los elementos ya existen
document.addEventListener("DOMContentLoaded", () => {

    // muestro primero lo que haya en el cache local (para no dejar la pantalla en blanco)
    // y despues traigo la version actualizada desde la api
    mostrarJuegos();
    cargarJuegosDesdeApi();
    cargarSelects();

    // boton "agregar juegos", muestra el formulario para cargar un juego nuevo
    document.querySelector("#b-agregar").addEventListener("click", () => {
        document.querySelector("#agregar").style.display = "block";
    });

    // si en el formulario de agregar elijo "otro" como genero, aparece el campo de texto para escribirlo
    document.querySelector("#agregar-genero").addEventListener("change", (e) => {
        const otro = document.querySelector("#agregar-genero-otro");
        const esOtro = e.target.value === "otro";
        otro.style.display = esOtro ? "block" : "none";
        otro.required = esOtro; // solo obligatorio si elegi "otro"
        if (!esOtro) otro.value = "";
    });

    // lo mismo que arriba pero para consola
    document.querySelector("#agregar-consola").addEventListener("change", (e) => {
        const otro = document.querySelector("#agregar-consola-otro");
        const esOtro = e.target.value === "otro";
        otro.style.display = esOtro ? "block" : "none";
        otro.required = esOtro;
        if (!esOtro) otro.value = "";
    });

    // envio del formulario "agregar juego"
    document.querySelector("#agregar").addEventListener("submit", (e) => {
        e.preventDefault(); // evita que la pagina se recargue al enviar el form

        // junta todos los campos del formulario en un objeto { titulo, genero, consola }
        const data = new FormData(e.target);
        const juego = Object.fromEntries(data.entries());

        // si elegi "otro" en genero/consola, uso lo que escribi a mano
        // (ese genero/consola nuevo va a aparecer solo en los select cuando el juego se termine de subir a la api)
        if (juego.genero === "otro") {
            juego.genero = document.querySelector("#agregar-genero-otro").value.trim();
        }
        if (juego.consola === "otro") {
            juego.consola = document.querySelector("#agregar-consola-otro").value.trim();
        }

        // agregarJuego manda el post a la api y, cuando responde, actualiza el cache, el listado y los select
        agregarJuego(juego);
        e.target.reset();
        e.target.style.display = "none";
        document.querySelector("#agregar-genero-otro").style.display = "none";
        document.querySelector("#agregar-consola-otro").style.display = "none";
    });

    // boton "cancelar" del formulario de agregar, lo limpia y lo oculta sin guardar nada
    document.querySelector("#b-cancelar-agregar").addEventListener("click", () => {
        const form = document.querySelector("#agregar");
        form.reset();
        document.querySelector("#agregar-genero-otro").style.display = "none";
        document.querySelector("#agregar-consola-otro").style.display = "none";
        form.style.display = "none";
    });

    // envio del formulario "buscar", filtra los juegos guardados en el cache local
    document.querySelector("#buscar").addEventListener("submit", (e) => {
        e.preventDefault();
        const titulo = e.target.titulo.value.toLowerCase();
        const genero = e.target.genero.value;
        const consola = e.target.consola.value;

        // me quedo solo con los juegos que cumplen los 3 filtros a la vez
        // si un filtro esta vacio no se aplica esa condicion
        const juegos = obtenerJuegos().filter(j =>
            j.titulo.toLowerCase().includes(titulo) &&
            (genero === "" || j.genero === genero) &&
            (consola === "" || j.consola === consola)
        );

        if (juegos.length === 0) {
            mostrarMensaje("No se encontró el juego");
            mostrarSinResultados();
        } else {
            mostrarJuegos(juegos); // le paso el array ya filtrado
        }
    });

    // boton "volver al inicio", descarta el filtro y muestra el listado completo
    document.querySelector("#b-inicio").addEventListener("click", () => {
        mostrarJuegos();
    });

    // envio del formulario de modificacion
    // este formulario se arma dinamicamente en prepararEdicion (modulos.js)
    // pero el listener se engancha ac una sola vez, al cargar la pagina
    document.querySelector("#modificar").addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(e.target); // incluye el id (input hidden)
        const juego = Object.fromEntries(data.entries());

        if (juego.genero === "otro") {
            juego.genero = document.querySelector("#modificar-genero-otro").value.trim();
        }
        if (juego.consola === "otro") {
            juego.consola = document.querySelector("#modificar-consola-otro").value.trim();
        }

        // modificarJuego manda el put a la api y, cuando responde, actualiza el cache, el listado y los select
        modificarJuego(juego);
        e.target.style.display = "none"; // oculta el formulario tras guardar
    });
});