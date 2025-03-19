const { ipcRenderer } = require("electron");

let toggleEstado = false;

window.onload = () => {
    ipcRenderer.send("listar-apps");
    ipcRenderer.send("obtener-tiempo");
};

ipcRenderer.on("lista-apps", (event, apps) => {
    const lista = document.getElementById("app-lista");
    lista.innerHTML = "";

    const nombresUnicos = new Set(apps.map(app => app.nombre));

    nombresUnicos.forEach(nombre => {
        const option = document.createElement("option");
        option.textContent = nombre;
        option.value = nombre;
        lista.appendChild(option);
    });
});

function convertirAHMS(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
}

function seleccionarApp() {
    const appSeleccionada = document.getElementById("app-lista").value;
    if (appSeleccionada) {
        ipcRenderer.send("seleccionar-app", appSeleccionada);
    }
}

function actualizarLista(){
    ipcRenderer.send("listar-apps")
}

function toggleFuncion() {
    toggleEstado = true;
    ipcRenderer.send("toggle-estado", toggleEstado);
    toggleEstado = false;
}

function guardarTiempos() {
    ipcRenderer.send("guardar-tiempo");
}

function cargarTiempos() {
    ipcRenderer.send("cargar-tiempo");
}

ipcRenderer.on("actualizar-tiempo", (event, tiempos) => {
    const estado = document.getElementById("estado");
    estado.innerHTML = `Tiempo de trabajo: ${convertirAHMS(tiempos.trabajo)} | Tiempo inactivo: ${convertirAHMS(tiempos.inactivo)}`;
});


document.getElementById("guardar-btn").addEventListener("click", guardarTiempos);
document.getElementById("cargar-btn").addEventListener("click", cargarTiempos);
document.getElementById("actualizar-lista").addEventListener("click", actualizarLista);