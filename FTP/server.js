const net = require('net');
const fs = require('fs');
const path = require('path');

const CONTROL_PORT = 2121;
const DATA_PORT = 2020;

let authenticated = false;

const server = net.createServer((controlSocket) => {

console.log("Cliente conectado");
authenticated = false;

controlSocket.write(" Servicio FTP listo\r\n");

controlSocket.on("data", (data) => {

const command = data.toString().trim();
const [cmd, arg] = command.split(" ");

switch (cmd) {

  case "USER":
      controlSocket.write("\n Usuario correcto\r\n");
      break;

  case "PASS":
      authenticated = true;
      controlSocket.write("\n Login exitoso\r\n");
      break;

  case "LIST":
      if (!authenticated) {
          controlSocket.write("\n No autenticado\r\n");
          return;
      }
      controlSocket.write("\n Abriendo conexión de datos\r\n");
      enviarLista(controlSocket);
      break;

  case "RETR":
      if (!authenticated) {
          controlSocket.write("\n530 No autenticado\r\n");
          return;
      }
      if (!arg) {
          controlSocket.write("\n501 Nombre de archivo requerido\r\n");
          return;
      }
      controlSocket.write("\n150 Abriendo conexión de datos\r\n");
      enviarArchivo(controlSocket, arg);
      break;

  case "STOR":
      if (!authenticated) {
          controlSocket.write("\n530 No autenticado\r\n");
          return;
      }
      if (!arg) {
          controlSocket.write("\n501 Nombre de archivo requerido\r\n");
          return;
      }
      controlSocket.write("\n150 Abriendo conexión de datos\r\n");
      recibirArchivo(controlSocket, arg);
      break;

  case "QUIT":
      controlSocket.write("\n221 Cerrando conexión\r\n");
      controlSocket.end();
      break;

  default:
      controlSocket.write("\n500 Comando no reconocido\r\n");
}
    });

    controlSocket.on("end", () => {
        console.log("\nCliente desconectado");
    });
});

server.listen(CONTROL_PORT, () => {
    console.log(`Servidor FTP escuchando en puerto ${CONTROL_PORT}`);
});

function enviarLista(controlSocket) {

  const dataServer = net.createServer((dataSocket) => {

  fs.readdir("./files", (err, files) => {
      if (err) {
          dataSocket.write("Error al leer directorio");
      } else {
          dataSocket.write(files.join("\n"));
      }
      dataSocket.end();
  });

  dataSocket.on("end", () => {
      controlSocket.write("226 Transferencia completa\r\n");
      dataServer.close();
  });
  });

  dataServer.listen(DATA_PORT);
}

function enviarArchivo(controlSocket, filename) {

  const filePath = path.join("./files", filename);

  if (!fs.existsSync(filePath)) {
      controlSocket.write("550 Archivo no encontrado\r\n");
      return;
  }

  const dataServer = net.createServer((dataSocket) => {

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(dataSocket);

      readStream.on("end", () => {
          controlSocket.write("226 Transferencia completa\r\n");
          dataServer.close();
      });
  });

  dataServer.listen(DATA_PORT);
}

function recibirArchivo(controlSocket, filename) {

  const dataServer = net.createServer((dataSocket) => {

    const filePath = path.join("./files", filename);
    const writeStream = fs.createWriteStream(filePath);

    dataSocket.pipe(writeStream);

    dataSocket.on("end", () => {
      controlSocket.write("226 Transferencia completa\r\n");
      dataServer.close();
    });
  });

    dataServer.listen(DATA_PORT);
}