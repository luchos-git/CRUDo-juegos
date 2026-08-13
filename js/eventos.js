// manejo de eventos de la pagina: que pasa cuando hago click, envio un formulario, etc
// las funciones que uso ac (mostrarJuegos, agregarJuego, etc) estan en modulos.js

// todo esto arranca recien cuando el html termino de cargar, para asegurarme de que los elementos ya existen
document.addEventListener("DOMContentLoaded", () => {

    // al entrar a la pagina muestro el listado completo (desde localStorage) y lleno los select
    mostrarJuegos();
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

        // si elegi "otro" en genero/consola, uso lo que escribi a mano y lo sumo a la lista para la proxima
        if (juego.genero === "otro") {
            juego.genero = document.querySelector("#agregar-genero-otro").value.trim();
            agregarGenero(juego.genero);
        }
        if (juego.consola === "otro") {
            juego.consola = document.querySelector("#agregar-consola-otro").value.trim();
            agregarConsola(juego.consola);
        }

        // agregarJuego guarda en localStorage y ademas manda el post a la api
        agregarJuego(juego);
        e.target.reset();
        e.target.style.display = "none";
        document.querySelector("#agregar-genero-otro").style.display = "none";
        document.querySelector("#agregar-consola-otro").style.display = "none";
        cargarSelects(); // por si agregue un genero/consola nuevo
    });

    // boton "cancelar" del formulario de agregar, lo limpia y lo oculta sin guardar nada
    document.querySelector("#b-cancelar-agregar").addEventListener("click", () => {
        const form = document.querySelector("#agregar");
        form.reset();
        document.querySelector("#agregar-genero-otro").style.display = "none";
        document.querySelector("#agregar-consola-otro").style.display = "none";
        form.style.display = "none";
    });

    // envio del formulario "buscar", filtra los juegos guardados en localStorage
    document.querySelector("#buscar").addEventListener("submit", (e) => {
        e.preventDefault();
        const titulo = e.target.titulo.value.toLowerCase();
        const genero = e.target.genero.value;
        const consola = e.target.consola.value;

        // me quedo solo con los juegos que cumplen los 3 filtros a la vez
        // si un filtro esta vacio no se aplica esa condicion
        const juegos = obtenerJuegosConId().filter(j =>
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
            agregarGenero(juego.genero);
        }
        if (juego.consola === "otro") {
            juego.consola = document.querySelector("#modificar-consola-otro").value.trim();
            agregarConsola(juego.consola);
        }

        modificarJuego(juego); // guarda los cambios en localStorage
        e.target.style.display = "none"; // oculta el formulario tras guardar
        cargarSelects();
    });
});