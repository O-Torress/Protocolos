// Importar el módulo dgram
const dgram = require('dgram');

// Crear el socket cliente
const client = dgram.createSocket('udp4');

// Mensaje a enviar
const message = Buffer.from('Hola servidor');
const PORT = 3000;
const HOST = 'localhost';

// Enviar mensaje
client.send(message, PORT, HOST, (err) => {
  if (err) {
    console.error('Error al enviar:', err);
    client.close();
  } else {
    console.log('Mensaje enviado');
  }
});

// Manejar mensajes recibidos del servidor
client.on('message', (msg, rinfo) => {
  console.log(`Servidor respondió: ${msg} desde ${rinfo.address}:${rinfo.port}`);
  client.close(); // Cerrar cliente al terminar
});

// Manejar errores
client.on('error', (err) => {
  console.error(`Error:\n${err.stack}`);
  client.close();
});