// https://6a73b2b015e0453fe1b424ed.mockapi.io/juegos  usar post con el formulario de agregar juego y modificar juego, para que se guarde en la api y no en el localstorage

//////////////////////////////////////////
//no se si se agrega las cosas agregadas por el usuario al mockapi
// fetch('https://6a73b2b015e0453fe1b424ed.mockapi.io/juegos', {
//     method: 'POST',
//     headers: { 'content-type': 'application/json' },
//     body: JSON.stringify(nuevoJuego)
// })
//     .then(res => {
//         if (res.ok) {
//             return res.json();
//         }
//         // handle error
//     })
//     .then(juegos => {
//         document.querySelector().innerHTML=`<form action="" id="agregar">
//                     <h3>agregar juego</h3>
//                     <input type="text" name="titulo" placeholder="ingrese titulo" required>

//                     <select name="genero" id="agregar-genero" required></select>
//                     <input type="text" id="agregar-genero-otro" placeholder="ingrese nuevo genero" class="campo-otro">

//                     <select name="consola" id="agregar-consola" required></select>
//                     <input type="text" id="agregar-consola-otro" placeholder="ingrese nueva consola" class="campo-otro">

//                     <input type="submit" name="submit" value="agregar">
//                     <button type="button" id="b-cancelar-agregar">Cancelar</button>
//                 </form>`
//     })
//     .catch(error => {
//         // handle error
//     });
//////////////////////////////////////////
const obtenerJuegos = () => JSON.parse(localStorage.getItem("juegos")) || [];

//acá esta el fetch que si sube los datos agregados jeje
const guardarJuegos = (juegos) => {
     fetch('https://6a73b2b015e0453fe1b424ed.mockapi.io/juegos', {
  method: 'POST',
  headers: {'content-type':'application/json'},
  // Send your data in the request body as JSON
  body: JSON.stringify(juegos)
}).then(res => {
  if (res.ok) {
      return res.json();
  }
  // handle error
}).then(juego => {
  console.log('Juego creado:', juego);
}).catch(error => {
  // handle error
})
}
    // localStorage.setItem("juegos", JSON.stringify(juegos));

const generosPorDefecto = ["Acción", "Aventura", "RPG", "Deportes", "Terror"];
const consolasPorDefecto = ["PC", "PlayStation 5", "PlayStation 4", "PlayStation 3", "Xbox Series X/S", "Xbox One", "Xbox 360", "Nintendo Switch", "Nintendo Wii U", "Nintendo 3DS", "Mobile", "Steam Deck"];

const obtenerGeneros = () => JSON.parse(localStorage.getItem("generos")) || generosPorDefecto;
const obtenerConsolas = () => JSON.parse(localStorage.getItem("consolas")) || consolasPorDefecto;

const guardarGeneros = (generos) => localStorage.setItem("generos", JSON.stringify(generos));
const guardarConsolas = (consolas) => localStorage.setItem("consolas", JSON.stringify(consolas));

const agregarGenero = (genero) => {
    const generos = obtenerGeneros();
    if (genero && !generos.includes(genero)) {
        generos.push(genero);
        guardarGeneros(generos);
    }
};

const agregarConsola = (consola) => {
    const consolas = obtenerConsolas();
    if (consola && !consolas.includes(consola)) {
        consolas.push(consola);
        guardarConsolas(consolas);
    }
};

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

const cargarSelects = () => {
    llenarSelect(document.querySelector("#buscar-genero"), obtenerGeneros(), true, false);
    llenarSelect(document.querySelector("#buscar-consola"), obtenerConsolas(), true, false);
    llenarSelect(document.querySelector("#agregar-genero"), obtenerGeneros(), false, true);
    llenarSelect(document.querySelector("#agregar-consola"), obtenerConsolas(), false, true);
};

// Selecciona en el select el valor actual del juego; si ese valor ya no está
// en la lista (caso raro), cae en "otro" y muestra el campo de texto.
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

// Devuelve los juegos con un "id" = posición en el vector + 1
const obtenerJuegosConId = () => obtenerJuegos().map((j, i) => ({ ...j, id: i + 1 }));

const mostrarJuegos = (juegos = null) => {
    const listado = document.querySelector("#listado");
    const datos = juegos !== null ? juegos : obtenerJuegosConId();
    const btnInicio = document.querySelector("#b-inicio");
    if (btnInicio) btnInicio.style.display = juegos !== null ? "inline-block" : "none";
    listado.innerHTML = '';

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

const mostrarSinResultados = () => {
    const listado = document.querySelector("#listado");
    const btnInicio = document.querySelector("#b-inicio");
    if (btnInicio) btnInicio.style.display = "inline-block";
    listado.innerHTML = `
        <div class="sin-resultados">
            <p>No se encontró ningún juego con ese título, género o consola</p>
        </div>`;
};

const agregarJuego = (nuevoJuego) => {
    const juegos = obtenerJuegos();
    juegos.push(nuevoJuego);
    guardarJuegos(juegos);
    mostrarJuegos();
    mostrarMensaje("Juego agregado con éxito");
};

//eliminar juegos
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

//modificar juegos
const prepararEdicion = (id) => {
    const juegos = obtenerJuegos();
    const juego = juegos[id - 1];
    if (!juego) return;
    const form = document.querySelector("#modificar");

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

    document.querySelector("#b-cancelar-modificar").addEventListener("click", () => {
        form.style.display = "none";
    });
};

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