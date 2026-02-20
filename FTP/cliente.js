const net = require('net');
const fs = require('fs');
const readline = require('readline');

const CONTROL_PORT = 2121;
const DATA_PORT = 2020;

const client = net.createConnection({ port: CONTROL_PORT }, () => {
    console.log("Conectado al servidor FTP\n");
    mostrarMenu();
});

client.on("data", (data) => {
    const respuesta = data.toString();
    console.log("Servidor:", respuesta);

    if (respuesta.startsWith("150")) {
        abrirCanalDatos();
    }

    if (respuesta.startsWith("221")) {
        rl.close();
        client.end();
    }
});

function mostrarMenu() {

  console.log("\n========= MENU FTP =========");
  console.log("1 - Login");
  console.log("2 - Listar archivos (LIST)");
  console.log("3 - Descargar archivo (RETR)");
  console.log("4 - Crear y subir archivo (STOR)");
  console.log("5 - Salir (QUIT)");
  console.log("============================");

  rl.question("Selecciona una opción: ", (opcion) => {

    switch (opcion.trim()) {

        case "1":
            login();
            break;

        case "2":
            client.write("LIST\r\n");
            break;

        case "3":
            rl.question("Nombre del archivo: ", (nombre) => {
                client.write(`RETR ${nombre}\r\n`);
            });
            break;

        case "4":
            crearYSubirArchivo();
            break;

        case "5":
            client.write("QUIT\r\n");
            break;

        default:
            console.log("Opción inválida");
    }

    setTimeout(mostrarMenu, 500);
  });
}

function login() {
  rl.question("Usuario: ", (user) => {
    client.write(`USER ${user}\r\n`);
    rl.question("Contraseña: ", (pass) => {
        client.write(`PASS ${pass}\r\n`);
    });
  });
}

function abrirCanalDatos() {

    const dataClient = net.createConnection({ port: DATA_PORT }, () => {
        console.log("Canal de datos conectado");
    });

    let receivedData = "";

    dataClient.on("data", (data) => {
        receivedData += data.toString();
    });

    dataClient.on("end", () => {

        if (receivedData.includes("\n")) {
            console.log("\nArchivos en servidor:\n" + receivedData);
        } else {
            const nombre = "archivo_descargado.txt";
            fs.writeFileSync(`./downloads/${nombre}`, receivedData);
            console.log(`Archivo guardado como ${nombre}`);
        }
    });
}

function crearYSubirArchivo() {

  rl.question("Nombre del archivo (ej: prueba.txt): ", (nombre) => {

    rl.question("Contenido del archivo: ", (contenido) => {

      const rutaLocal = `./downloads/${nombre}`;
      fs.writeFileSync(rutaLocal, contenido);
      console.log("Archivo creado localmente.");

      client.write(`STOR ${nombre}\r\n`);

      const dataClient = net.createConnection({ port: DATA_PORT }, () => {
        const readStream = fs.createReadStream(rutaLocal);
        readStream.pipe(dataClient);
        });
      });
  });
}