let tareas = [];


function agregarTarea() {
    const inputTarea = document.getElementById("input-tarea");
    const tareaTexto = inputTarea.value.trim();

    if (tareaTexto !== "") {
        const nuevaTarea = {
            id: Date.now(),
            texto: tareaTexto,
            completada: false
        };
        tareas.push(nuevaTarea);
        inputTarea.value = "";
        actualizarListaTareas();
    }
}

function eliminarTarea(id) {
    tareas = tareas.filter(tarea => tarea.id !== id);
    actualizarListaTareas();
}


function toggleCompletada(id) {
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        tarea.completada = !tarea.completada;
        actualizarListaTareas();
    }
}

function actualizarListaTareas() {
    const listaTareas = document.getElementById("lista-tareas");
    listaTareas.innerHTML = "";

    tareas.forEach(tarea => {
        const li = document.createElement("li");
        li.classList.add("tarea");

        if (tarea.completada) {
            li.classList.add("completada");
        }

        const span = document.createElement("span");
        span.textContent = tarea.texto;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = tarea.completada;
        checkbox.classList.add("checkbox");
        checkbox.onclick = () => toggleCompletada(tarea.id);

        const botonEliminar = document.createElement("button");
        botonEliminar.classList.add("eliminar");
        botonEliminar.textContent = "Eliminar";
        botonEliminar.onclick = () => eliminarTarea(tarea.id);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(botonEliminar);

        listaTareas.appendChild(li);
    });
}
