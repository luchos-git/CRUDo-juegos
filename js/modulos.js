// los juegos se guardan en localStorage, es lo que usa toda la pagina para listar, buscar, editar y borrar
// ademas, cada vez que se agrega un juego nuevo, tambien se manda a la api con post (por la consigna)
// por ahora uso solo post, despues voy sumando get, put y delete de a poco

// url de la api a donde mando los juegos con post
const API_URL = 'https://6a73b2b015e0453fe1b424ed.mockapi.io/juegos';

// lee el array de juegos de localStorage, si no hay nada devuelve vacio
const obtenerJuegos = () => JSON.parse(localStorage.getItem("juegos")) || [];

// guarda el array completo en localStorage
// esta es la posta, si no se llama a esto los cambios no quedan guardados
const guardarJuegos = (juegos) => {
    localStorage.setItem("juegos", JSON.stringify(juegos));
};

// manda un solo juego a la api con post
// el body tiene que ser el objeto del juego, no el array entero, porque cada post crea un registro nuevo
const guardarJuegoEnApi = (juego) => {
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(juego)
    })
        .then(res => {
            if (!res.ok) throw new Error('la api respondio con un error')
            return res.json();
        })
        .then(juegoCreado => {
            console.log('juego creado en la api:', juegoCreado);
        })
        .catch(error => {
            // si falla el post (por ej sin conexion) el juego ya quedo en localStorage, no se pierde
            console.error('no se pudo guardar el juego en la api:', error);
        });
};

// listas por defecto por si todavia no hay nada guardado
const generosPorDefecto = ["Acción", "Aventura", "RPG", "Deportes", "Terror"];
const consolasPorDefecto = ["PC", "PlayStation 5", "PlayStation 4", "PlayStation 3", "Xbox Series X/S", "Xbox One", "Xbox 360", "Nintendo Switch", "Nintendo Wii U", "Nintendo 3DS", "Mobile", "Steam Deck"];

// si localStorage tiene algo lo uso, si no uso las listas de arriba
const obtenerGeneros = () => JSON.parse(localStorage.getItem("generos")) || generosPorDefecto;
const obtenerConsolas = () => JSON.parse(localStorage.getItem("consolas")) || consolasPorDefecto;

// guardan el array actualizado en localStorage
const guardarGeneros = (generos) => localStorage.setItem("generos", JSON.stringify(generos));
const guardarConsolas = (consolas) => localStorage.setItem("consolas", JSON.stringify(consolas));

// agrega un genero nuevo a la lista, solo si no esta ya
const agregarGenero = (genero) => {
    const generos = obtenerGeneros();
    if (genero && !generos.includes(genero)) {
        generos.push(genero);
        guardarGeneros(generos);
    }
};

// lo mismo que agregarGenero pero para consolas
const agregarConsola = (consola) => {
    const consolas = obtenerConsolas();
    if (consola && !consolas.includes(consola)) {
        consolas.push(consola);
        guardarConsolas(consolas);
    }
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

// devuelve los juegos con un id = posicion en el vector + 1
// este id es solo para uso interno de la pagina (botones modificar/eliminar)
const obtenerJuegosConId = () => obtenerJuegos().map((j, i) => ({ ...j, id: i + 1 }));

// dibuja la lista de juegos en pantalla
// si le paso un array por parametro (por ej resultado de una busqueda) muestra ese array
// si no le paso nada, muestra el listado completo
const mostrarJuegos = (juegos = null) => {
    const listado = document.querySelector("#listado");
    const datos = juegos !== null ? juegos : obtenerJuegosConId();
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
                <button class="b-modificar" onclick="prepararEdicion(${j.id})">Modificar</button>
                <button class="b-eliminar" onclick="eliminarJuego(${j.id})">Eliminar</button>
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

// agrega un juego nuevo, lo guarda en localStorage (para que se vea en la lista) y ademas lo manda a la api con post
const agregarJuego = (nuevoJuego) => {
    const juegos = obtenerJuegos();
    juegos.push(nuevoJuego);
    guardarJuegos(juegos);

    guardarJuegoEnApi(nuevoJuego);

    mostrarJuegos();
    mostrarMensaje("Juego agregado con éxito");
};

// elimina un juego (por ahora, solo de localStorage)
const eliminarJuego = (id) => {
    const juegos = obtenerJuegos();
    const juego = juegos[id - 1];
    if (!juego) return;
    if (confirm(`¿Seguro que querés eliminar "${juego.titulo}"?`)) {
        juegos.splice(id - 1, 1);
        guardarJuegos(juegos);
        mostrarJuegos();
        mostrarMensaje("juego eliminado");
    }
};

// prepara y muestra el formulario de edicion para el juego con ese id
const prepararEdicion = (id) => {
    const juegos = obtenerJuegos();
    const juego = juegos[id - 1];
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

// guarda los cambios de edicion (por ahora, solo en localStorage)
const modificarJuego = (datos) => {
    let juegos = obtenerJuegos();
    const index = Number(datos.id) - 1;
    if (index >= 0 && index < juegos.length) {
        juegos[index] = {
            titulo: datos.titulo,
            genero: datos.genero,
            consola: datos.consola
        };
        guardarJuegos(juegos);
        mostrarJuegos();
        mostrarMensaje("juego actualizado");
    }
};