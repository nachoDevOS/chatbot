const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Configuración de tu Evolution API
const API_KEY = 'B384826D919F-4B0A-A2D3-33949BE4D446';
const BASE_URL = 'http://evo-is8804884wggw00wckcg880o.190.129.54.198.sslip.io';
const INSTANCE = 'boot-alejandro';

// Función para enviar respuesta
async function sendMessage(remoteJid, text) {
    try {
        await axios.post(`${BASE_URL}/message/sendText/${INSTANCE}`, {
            number: remoteJid, // Evolution API acepta el JID directamente
            text: text
        }, {
            headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' }
        });
        console.log(`Respuesta enviada a: ${remoteJid}`);
    } catch (error) {
        console.error('Error enviando mensaje:', error.response?.data || error.message);
    }
}

// Endpoint para el Webhook
app.post('/webhook', async (req, res) => {
    const payload = req.body;

    // 1. Validar que sea un evento de mensaje
    if (payload.event === 'messages.upsert') {
        const messageData = payload.data;
        
        // Evitar responder a nuestros propios mensajes
        if (messageData.key.fromMe) return res.sendStatus(200);

        const remoteJid = messageData.key.remoteJid;
        const pushName = messageData.pushName || '';
        const incomingText = (messageData.message?.conversation || 
                             messageData.message?.extendedTextMessage?.text || "").toLowerCase();

        console.log(`Mensaje recibido de ${remoteJid}: ${incomingText}`);

        // 2. Lógica del Chatbot
        if (incomingText.includes('hola') || incomingText.includes('buen')) {
            await sendMessage(remoteJid, `👋 ¡Hola ${pushName}! Soy el Asistente Virtual del Dr. Alejandro Unzueta.\nEstoy aquí para responder tus preguntas y contarte más sobre su trayectoria y su visión para el Beni.`);
        } else if (incomingText.includes('precio')) {
            await sendMessage(remoteJid, "Nuestros servicios varían según tu necesidad. Dime qué buscas.");
        } else {
            await sendMessage(remoteJid, "Recibí tu mensaje. En breve un humano te atenderá.");
        }
    }

    res.status(200).send('EVENT_RECEIVED');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Chatbot corriendo en puerto ${PORT}`);
});