document.addEventListener("DOMContentLoaded", () => {
    mostrarJuegos();
    cargarSelects();

    document.querySelector("#b-agregar").addEventListener("click", () => {
        document.querySelector("#agregar").style.display = "block";
    });

    document.querySelector("#agregar-genero").addEventListener("change", (e) => {
        const otro = document.querySelector("#agregar-genero-otro");
        const esOtro = e.target.value === "otro";
        otro.style.display = esOtro ? "block" : "none";
        otro.required = esOtro;
        if (!esOtro) otro.value = "";
    });

    document.querySelector("#agregar-consola").addEventListener("change", (e) => {
        const otro = document.querySelector("#agregar-consola-otro");
        const esOtro = e.target.value === "otro";
        otro.style.display = esOtro ? "block" : "none";
        otro.required = esOtro;
        if (!esOtro) otro.value = "";
    });

    document.querySelector("#agregar").addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const juego = Object.fromEntries(data.entries());

        if (juego.genero === "otro") {
            juego.genero = document.querySelector("#agregar-genero-otro").value.trim();
            agregarGenero(juego.genero);
        }
        if (juego.consola === "otro") {
            juego.consola = document.querySelector("#agregar-consola-otro").value.trim();
            agregarConsola(juego.consola);
        }

        agregarJuego(juego);
        e.target.reset();
        e.target.style.display = "none";
        document.querySelector("#agregar-genero-otro").style.display = "none";
        document.querySelector("#agregar-consola-otro").style.display = "none";
        cargarSelects();
    });

    document.querySelector("#b-cancelar-agregar").addEventListener("click", () => {
        const form = document.querySelector("#agregar");
        form.reset();
        document.querySelector("#agregar-genero-otro").style.display = "none";
        document.querySelector("#agregar-consola-otro").style.display = "none";
        form.style.display = "none";
    });

    document.querySelector("#buscar").addEventListener("submit", (e) => {
        e.preventDefault();
        const titulo = e.target.titulo.value.toLowerCase();
        const genero = e.target.genero.value;
        const consola = e.target.consola.value;
        const juegos = obtenerJuegosConId().filter(j =>
            j.titulo.toLowerCase().includes(titulo) &&
            (genero === "" || j.genero === genero) &&
            (consola === "" || j.consola === consola)
        );

        if (juegos.length === 0) {
            mostrarMensaje("No se encontró el juego");
            mostrarSinResultados();
        } else {
            mostrarJuegos(juegos);
        }
    });

    document.querySelector("#b-inicio").addEventListener("click", () => {
        mostrarJuegos();
    });

    // Procesar el formulario de modificación
    document.querySelector("#modificar").addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const juego = Object.fromEntries(data.entries());

        if (juego.genero === "otro") {
            juego.genero = document.querySelector("#modificar-genero-otro").value.trim();
            agregarGenero(juego.genero);
        }
        if (juego.consola === "otro") {
            juego.consola = document.querySelector("#modificar-consola-otro").value.trim();
            agregarConsola(juego.consola);
        }

        modificarJuego(juego);
        e.target.style.display = "none"; // Oculta el formulario tras guardar
        cargarSelects();
    });
});