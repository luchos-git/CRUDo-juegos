// modulos.js: la api de mockapi es la fuente de datos real (coleccion "juegos").
// localStorage se usa solo como cache local, para no tener que esperar la respuesta
// de la api cada vez que se dibuja la lista. cada accion (agregar, modificar, eliminar)
// hace el fetch correspondiente (POST/PUT/DELETE, mismo patron que el ejemplo de la
// materia) y recien cuando la api confirma, se actualiza el cache y lo que se ve en pantalla.
//
// los generos y consolas YA NO se guardan aparte: se sacan directo de los juegos que hay
// en el cache (o sea, de lo que subio la gente a la api). asi, si alguien carga un juego
// con una consola nueva (por "otro"), esa consola nueva aparece sola en el filtro para
// todos la proxima vez que se actualiza la lista, sin tener que guardarla por separado.

// url de la api con la que trabajo
const API_URL = 'https://6a73b2b015e0453fe1b424ed.mockapi.io/juegos';

// lee el array de juegos guardado en el cache local, si no hay nada devuelve vacio
const obtenerJuegos = () => JSON.parse(localStorage.getItem("juegos")) || [];

// guarda el array completo en el cache local (esto NO toca la api, es solo el cache)
const guardarJuegos = (juegos) => {
    localStorage.setItem("juegos", JSON.stringify(juegos));
};

// trae todos los juegos de la api (GET) y con eso actualiza el cache local, el listado
// y los select de genero/consola (porque dependen de los juegos que hay)
// se llama al arrancar la pagina, para que siempre se vea lo que realmente hay en la api
const cargarJuegosDesdeApi = () => {
    fetch(API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => {
            if (!res.ok) throw new Error('la api respondio con un error');
            return res.json();
        })
        .then(juegos => {
            guardarJuegos(juegos);
            mostrarJuegos();
            cargarSelects();
        })
        .catch(error => {
            // si no hay conexion sigo mostrando lo ultimo que quedo en el cache local
            console.error('no se pudieron cargar los juegos desde la api:', error);
        });
};

// listas por defecto, por si todavia no hay ningun juego cargado
const generosPorDefecto = ["Acción", "Aventura", "RPG", "Deportes", "Terror"];
const consolasPorDefecto = ["PC", "PlayStation 5", "PlayStation 4", "PlayStation 3", "Xbox Series X/S", "Xbox One", "Xbox 360", "Nintendo Switch", "Nintendo Wii U", "Nintendo 3DS", "Mobile", "Steam Deck"];

// arma la lista de generos: los de por defecto + los que ya tienen los juegos del cache
// (osea, los que subio la gente a la api), sin repetidos. uso un Set para sacar los duplicados
const obtenerGeneros = () => {
    const generosDeJuegos = obtenerJuegos().map(j => j.genero);
    return Array.from(new Set([...generosPorDefecto, ...generosDeJuegos]));
};

// lo mismo que obtenerGeneros pero para consolas
const obtenerConsolas = () => {
    const consolasDeJuegos = obtenerJuegos().map(j => j.consola);
    return Array.from(new Set([...consolasPorDefecto, ...consolasDeJuegos]));
};

// llena un select con las opciones que le paso
// incluirTodos agrega la opcion "todos" arriba de todo (para los filtros de busqueda)
// incluirOtro agrega la opcion "otro" al final (para cargar un valor nuevo)
const llenarSelect = (select, opciones, incluirTodos, incluirOtro) => {
    select.innerHTML = '';
    if (incluirTodos) {
        select.innerHTML += `<option value="">Todos</option>`;
    }
    opciones.forEach(op => {
        select.innerHTML += `<option value="${op}">${op}</option>`;
    });
    if (incluirOtro) {
        select.innerHTML += `<option value="otro">Otro...</option>`;
    }
};

// carga todos los select de la pagina (buscar y agregar) con los generos y consolas actuales
const cargarSelects = () => {
    llenarSelect(document.querySelector("#buscar-genero"), obtenerGeneros(), true, false);
    llenarSelect(document.querySelector("#buscar-consola"), obtenerConsolas(), true, false);
    llenarSelect(document.querySelector("#agregar-genero"), obtenerGeneros(), false, true);
    llenarSelect(document.querySelector("#agregar-consola"), obtenerConsolas(), false, true);
};

// selecciona en el select el valor actual del juego que se esta editando
// si ese valor ya no esta en la lista (caso raro) cae en "otro" y muestra el campo de texto
const seleccionarValorActual = (selectorSelect, selectorOtro, valorActual) => {
    const select = document.querySelector(selectorSelect);
    const otro = document.querySelector(selectorOtro);
    const existeOpcion = Array.from(select.options).some(o => o.value === valorActual);
    if (existeOpcion) {
        select.value = valorActual;
        otro.style.display = "none";
    } else {
        select.value = "otro";
        otro.style.display = "block";
        otro.value = valorActual;
    }
};

// dibuja la lista de juegos en pantalla
// si le paso un array por parametro (por ej resultado de una busqueda) muestra ese array
// si no le paso nada, muestra el listado completo (del cache local)
// el id de cada juego es el que le asigna la api (mockapi), no una posicion inventada
const mostrarJuegos = (juegos = null) => {
    const listado = document.querySelector("#listado");
    const datos = juegos !== null ? juegos : obtenerJuegos();
    const btnInicio = document.querySelector("#b-inicio");

    // el boton "volver al inicio" solo se muestra cuando estoy viendo un resultado filtrado
    if (btnInicio) btnInicio.style.display = juegos !== null ? "inline-block" : "none";
    listado.innerHTML = ''; // limpio el listado antes de volver a dibujarlo

    datos.forEach(j => {
        listado.innerHTML += `
        <div class="juego">
            <div class="info">
                <p><strong>${j.titulo}</strong></p>
                <p>${j.genero} - ${j.consola}</p>
            </div>
            <div class="botones">
                <button class="b-modificar" onclick="prepararEdicion('${j.id}')">Modificar</button>
                <button class="b-eliminar" onclick="eliminarJuego('${j.id}')">Eliminar</button>
            </div>
        </div>`;
    });
};

// muestra el mensaje de "sin resultados" cuando una busqueda no encuentra nada
const mostrarSinResultados = () => {
    const listado = document.querySelector("#listado");
    const btnInicio = document.querySelector("#b-inicio");
    if (btnInicio) btnInicio.style.display = "inline-block";
    listado.innerHTML = `
        <div class="sin-resultados">
            <p>No se encontró ningún juego con ese título, género o consola</p>
        </div>`;
};

// crea el juego en la api (POST) y, si sale bien, lo agrega al cache local con el id que le dio la api
// tambien vuelve a cargar los select, por si el juego trae un genero/consola nuevo (cargado por "otro")
const agregarJuego = (nuevoJuego) => {
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoJuego)
    })
        .then(res => {
            if (!res.ok) throw new Error('la api respondio con un error');
            return res.json();
        })
        .then(juegoCreado => {
            // juegoCreado ya viene con el id que le asigno mockapi
            const juegos = obtenerJuegos();
            juegos.push(juegoCreado);
            guardarJuegos(juegos);
            mostrarJuegos();
            cargarSelects();
            mostrarMensaje("Juego agregado con éxito");
        })
        .catch(error => {
            console.error('no se pudo agregar el juego en la api:', error);
            mostrarMensaje("No se pudo agregar el juego, probá de nuevo");
        });
};

// borra el juego en la api (DELETE por id) y, si sale bien, lo saca tambien del cache local
const eliminarJuego = (id) => {
    const juego = obtenerJuegos().find(j => j.id === id);
    if (!juego) return;
    if (!confirm(`¿Seguro que querés eliminar "${juego.titulo}"?`)) return;

    fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => {
            if (!res.ok) throw new Error('la api respondio con un error');
            return res.json();
        })
        .then(() => {
            const juegos = obtenerJuegos().filter(j => j.id !== id);
            guardarJuegos(juegos);
            mostrarJuegos();
            cargarSelects();
            mostrarMensaje("juego eliminado");
        })
        .catch(error => {
            console.error('no se pudo eliminar el juego en la api:', error);
            mostrarMensaje("No se pudo eliminar el juego, probá de nuevo");
        });
};

// prepara y muestra el formulario de edicion para el juego con ese id
const prepararEdicion = (id) => {
    const juego = obtenerJuegos().find(j => j.id === id);
    if (!juego) return;
    const form = document.querySelector("#modificar");

    // el formulario de edicion se arma dinamicamente (estaba vacio en el html), ya cargado con los datos del juego
    form.innerHTML = `
        <h3>Modificar juego</h3>
        <input type="hidden" name="id" value="${id}">
        <input type="text" name="titulo" value="${juego.titulo}" required>

        <select name="genero" id="modificar-genero" required></select>
        <input type="text" id="modificar-genero-otro" placeholder="ingrese nuevo genero" class="campo-otro">

        <select name="consola" id="modificar-consola" required></select>
        <input type="text" id="modificar-consola-otro" placeholder="ingrese nueva consola" class="campo-otro">

        <input type="submit" value="Guardar Cambios">
        <button type="button" id="b-cancelar-modificar">Cancelar</button>
    `;
    form.style.display = "block";

    llenarSelect(document.querySelector("#modificar-genero"), obtenerGeneros(), false, true);
    llenarSelect(document.querySelector("#modificar-consola"), obtenerConsolas(), false, true);
    seleccionarValorActual("#modificar-genero", "#modificar-genero-otro", juego.genero);
    seleccionarValorActual("#modificar-consola", "#modificar-consola-otro", juego.consola);

    // como estos select se recrean cada vez, hay que volver a engancharles el evento change de "otro"
    document.querySelector("#modificar-genero").addEventListener("change", (e) => {
        const otro = document.querySelector("#modificar-genero-otro");
        const esOtro = e.target.value === "otro";
        otro.style.display = esOtro ? "block" : "none";
        if (!esOtro) otro.value = "";
    });

    document.querySelector("#modificar-consola").addEventListener("change", (e) => {
        const otro = document.querySelector("#modificar-consola-otro");
        const esOtro = e.target.value === "otro";
        otro.style.display = esOtro ? "block" : "none";
        if (!esOtro) otro.value = "";
    });

    // boton para cerrar el formulario de edicion sin guardar cambios
    document.querySelector("#b-cancelar-modificar").addEventListener("click", () => {
        form.style.display = "none";
    });
};

// actualiza el juego en la api (PUT por id) y, si sale bien, actualiza tambien el cache local
// y los select, por si el juego editado trae un genero/consola nuevo
const modificarJuego = (datos) => {
    const juegoActualizado = {
        titulo: datos.titulo,
        genero: datos.genero,
        consola: datos.consola
    };

    fetch(`${API_URL}/${datos.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(juegoActualizado)
    })
        .then(res => {
            if (!res.ok) throw new Error('la api respondio con un error');
            return res.json();
        })
        .then(juegoDesdeApi => {
            const juegos = obtenerJuegos();
            const index = juegos.findIndex(j => j.id === datos.id);
            if (index !== -1) {
                juegos[index] = juegoDesdeApi;
                guardarJuegos(juegos);
            }
            mostrarJuegos();
            cargarSelects();
            mostrarMensaje("juego actualizado");
        })
        .catch(error => {
            console.error('no se pudo actualizar el juego en la api:', error);
            mostrarMensaje("No se pudo actualizar el juego, probá de nuevo");
        });
};