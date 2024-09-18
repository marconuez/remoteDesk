const express = require('express');
const WebSocket = require('ws');
const cors = require('cors'); // Importar cors
const app = express();
const port = 8080;

// Usar cors
app.use(cors()); // Habilitar CORS para todas las rutas

// Crear el servidor HTTP
const server = app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Crear el servidor WebSocket
const wss = new WebSocket.Server({ server });

// Estaciones conectadas
let estaciones = {};

wss.on('connection', (ws) => {
    console.log('Nueva estación conectada');

    // Manejar mensajes de las estaciones
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log("Mensaje recibido:", data); // Depuración

        if (data.type === 'register') {
            // Registrar estación
            estaciones[data.stationId] = ws;
            console.log(`Estación ${data.stationId} registrada`);
        }
    });

    // Desconexión de estaciones
    ws.on('close', () => {
        console.log('Estación desconectada');
        for (let id in estaciones) {
            if (estaciones[id] === ws) {
                delete estaciones[id];
            }
        }
    });
});

// Endpoint para configurar el tiempo
app.use(express.json());
app.post('/set-time', (req, res) => {
    const { stationId, time } = req.body;
    console.log(`Configurando tiempo para estación ${stationId}: ${time} minutos`); // Depuración
    if (estaciones[stationId]) {
        estaciones[stationId].send(JSON.stringify({ type: 'setTime', time }));
        res.status(200).send(`Tiempo configurado para la estación ${stationId}`);
    } else {
        res.status(404).send('Estación no encontrada');
    }
});


// Endpoint para obtener las estaciones conectadas
app.get('/stations', (req, res) => {
    const connectedStations = Object.keys(estaciones);
    console.log(connectedStations); // Agrega este console.log para depurar
    res.status(200).json(connectedStations);
});



//Endpoint para cerrar sesion forzadamente
app.post('/end-time', (req, res) => {
    const { stationId } = req.body;
    console.log(`Cerrando estación... ${stationId}`); // Depuración
    if (estaciones[stationId]) {
        estaciones[stationId].send(JSON.stringify({ type: 'endTime', stationId }));
        res.status(200).send(`Cerrando estación... ${stationId}`);
    } else {
        res.status(404).send('Estación no encontrada');
    }
});