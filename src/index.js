const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const activeWin = require("active-win");
const fs = require("fs");
const path = require("path");
const {listarProcesos} = require('./functions');

let mainWindow;
let appSeleccionada;
let interval;
let estado = false;
let isRun = false;
let afk = false;
let mensajeMostrado = false;
let lastPopup = 0;
let tiempos = {
    trabajo : 0,
    inactivo: 0
};

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile(path.join(__dirname, "index.html"));
});

ipcMain.on("obtener-tiempo", (event) => {
    event.reply("actualizar-tiempo", tiempos);
});

ipcMain.on("listar-apps", (event) => {
    listarProcesos(procesos => {
        event.reply("lista-apps", procesos);
    });
});

ipcMain.on("seleccionar-app", (event, appName) => {
    appSeleccionada = appName;

    if (interval) {
        clearInterval(interval);
    }

    isRun = true;

    interval = setInterval(async () => {
        const ventana = await activeWin();
        const procesosActivos = await new Promise((resolve) => {
            listarProcesos(resolve);
        });

        if (procesosActivos.some(proceso => proceso.nombre === appSeleccionada)) {
            let ejecutable = path.basename(ventana.owner.path)
            
            if(!afk){
                ejecutable === appSeleccionada ? tiempos.trabajo++ : tiempos.inactivo++;
            }

            if(ejecutable === appSeleccionada){
                afk = false;
                mensajeMostrado = false;
            }

        }

        if((tiempos.inactivo - lastPopup) >= 90 && !mensajeMostrado){
            afk = true;
            mensajeMostrado = true;
            dialog.showMessageBox(mainWindow, {
                type: "warning",
                title: "Inactividad",
                message: "Pasaron 90 segundos, se pauso el contador hasta que le des a iniciar o click al programa"
            }).then(result => {
                if(result.response === 0){
                    lastPopup = tiempos.inactivo
                }
            })
        }
        mainWindow.webContents.send("actualizar-tiempo", tiempos);
    }, 1000); 
});

ipcMain.on("toggle-estado", (event, status) => {
    estado = status
    if(isRun){
        if(estado){
            clearInterval(interval)
            isRun = false
            console.log("pausado")
        }
    }
})

ipcMain.on("guardar-tiempo", () => {
    guardarTiempos();
});

ipcMain.on("cargar-tiempo", () => {
    cargarTiempos();
});


function cargarTiempos() {
    dialog.showOpenDialog({
        title: 'Abrir Archivo de Tiempos',
        filters: [{ name: 'JSON', extensions: ['json'] }]
    }).then(result => {
        if (!result.canceled) {
            const filePath = result.filePaths[0];
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf-8');
                dataTiempo = JSON.parse(data);
                if (dataTiempo) {
                    tiempos.trabajo = dataTiempo.trabajo
                    tiempos.inactivo = dataTiempo.inactivo
                    mainWindow.webContents.send("actualizar-tiempo", tiempos);
                }
            } else {
                console.log(`El archivo ${filePath} no existe.`);
            }
        }
    }).catch(err => {
        console.log("Error al abrir el archivo:", err);
    });
}

function guardarTiempos() {
    dialog.showSaveDialog({
        title: 'Guardar Archivo de Tiempos',
        defaultPath: path.join(app.getPath("userData"), '.json'),
        filters: [{ name: 'JSON', extensions: ['json'] }]
    }).then(result => {
        if (!result.canceled) {
            const filePath = result.filePath;
            fs.writeFileSync(filePath, JSON.stringify(tiempos));
        }
    }).catch(err => {
        console.log("Error al guardar el archivo:", err);
    });
}