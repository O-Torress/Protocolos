const net = require('node:net');
const fs = require('node:fs'); 

let archivoActual = null;

const server = net.createServer();

server.on("connection", (socket) => {

socket.on("data", (data) => {
    
    const mensaje = data.toString();
    console.log("\nMensaje del cliente recibido:", mensaje);

    const partes = mensaje.split(" ");
    const comando = partes[0].toLowerCase();
    const argumento = partes.slice(1).join(" ");

    let respuesta = "";

    switch (comando) {
        
    case "crear":
    
    if (!argumento) {
             respuesta = "Error: debes indicar el nombre del archivo.";
        } else if (fs.existsSync(argumento)) {
            respuesta = "Error: el archivo ya existe.";
        } else {
           fs.writeFileSync(argumento, "");
            respuesta = "Archivo creado correctamente.";
        }
        break;

    case "abrir":
        
    if (!argumento) {
            respuesta = "Error: debes indicar el nombre del archivo.";
        } else if (!fs.existsSync(argumento)) {
            respuesta = "Error: el archivo no existe.";
        } else {
            archivoActual = argumento;
            respuesta = `Archivo '${archivoActual}' abierto.`;
        }
        break;

    case "adicionar":
        
    if (!archivoActual) {
            respuesta = "Error: no hay ningún archivo abierto.";
        } else if (!argumento) {
            respuesta = "Error: debes indicar el texto a adicionar.";
        } else {
            fs.appendFileSync(archivoActual, argumento + "\n");
            respuesta = "Texto añadido correctamente.";
        }
        break;

    case "leer":
        
    if (!archivoActual) {
            respuesta = "Error: no hay ningún archivo abierto.";
        } else {
            const contenido = fs.readFileSync(archivoActual, "utf8");
            respuesta = `Contenido del archivo=\n${contenido}`;
        }
        break;

    case "eliminar":
        
    if (!argumento) {
            respuesta = "Error: debes indicar el nombre del archivo.";
        } else if (!fs.existsSync(argumento)) {
            respuesta = "Error: el archivo no existe.";
        } else {
            fs.unlinkSync(argumento);
        if (archivoActual === argumento) archivoActual = null;
             respuesta = "Archivo eliminado correctamente.";
        }
        break;

    case "cerrar":
        
    if (!archivoActual) {
        respuesta = "Error: no hay ningún archivo abierto.";
    } else {
        archivoActual = null;
        respuesta = "Archivo cerrado correctamente.";
        }
        break;

    default:
        respuesta = "\n Comando no reconocido.";
    }

    socket.write(respuesta);
    });

    socket.on("close", () => {
        console.log("\n Comunicación finalizada");
    });

    socket.on("error", (err) => {
        console.log("Error:", err.message);
    });

});

server.listen(4000, () => {
    console.log("\nEl server está escuchando en el puerto", server.address().port);

});