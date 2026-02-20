const net = require('node:net'); 
const readline = require("node:readline");

const options = {
    port: 4000,
}

const client = net.createConnection(options);

const rl = readline.createInterface({
    
    input: process.stdin,
    output: process.stdout

});

client.on("connect", () => {
    console.log("Conexión exitosa con el servidor");
    pedirComando();

});

client.on("data", (data) => {
    console.log("\nServidor:", data.toString());
    pedirComando();

});

client.on("close", () => {
    console.log("\nConexión cerrada");
    rl.close();

});

client.on("error", (err) => {
    console.log("Error:", err.message);

});

function pedirComando() {
    rl.question("> ", (comando) => {
        client.write(comando);
   
    });

}