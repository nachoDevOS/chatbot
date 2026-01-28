const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

// Configuración de tu Evolution API
const API_KEY = 'B384826D919F-4B0A-A2D3-33949BE4D446';
const BASE_URL = 'http://evo-is8804884wggw00wckcg880o.190.129.54.198.sslip.io';
const INSTANCE = 'boot-alejandro';

// Configuración de la Base de Datos (Archivo JSON)
const DB_PATH = path.join(__dirname, 'database.json');

// Función para leer las sesiones guardadas
function getSessions() {
    if (!fs.existsSync(DB_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (error) {
        return {};
    }
}

// Función para guardar una sesión nueva
function saveSession(remoteJid, data) {
    const sessions = getSessions();
    sessions[remoteJid] = data;
    fs.writeFileSync(DB_PATH, JSON.stringify(sessions, null, 2));
}

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
                             messageData.message?.extendedTextMessage?.text || "").toLowerCase().trim();

        console.log(`Mensaje recibido de ${remoteJid}: ${incomingText}`);

        const menuText = `
1️⃣ ¿Quién es Alejandro Unzueta?
2️⃣ Propuestas
3️⃣ Logros
4️⃣ Desarrollo Económico Productivo
5️⃣ Equilibrio Medioambiental
6️⃣ Bienestar Social
7️⃣ Salud para Todos
8️⃣ ¿Qué es la Alianza Despierta?
9️⃣ ¿Cuál es la visión del plan?`;

        const responses = {
            '1': "Alejandro Unzueta es un líder beniano reconocido por su trabajo social y su compromiso con la salud y el bienestar de las familias. Se hizo conocido por su apoyo directo a la población durante la pandemia del COVID-19, brindando asistencia médica, medicamentos y acompañamiento a miles de personas.\nSu visión es construir un Beni productivo, moderno, seguro y conectado, donde todas las comunidades tengan acceso a oportunidades, desarrollo y salud de calidad.",
            '2': "Estas son las principales propuestas del plan 2026–2031:\n\n📌 Desarrollo Económico Productivo\nApoyo a MyPEs, artesanos y emprendedores.\nMejora de carreteras, aeropuertos y obras productivas.\nFortalecimiento de agricultura, ganadería y cadenas productivas.\nImpulso al turismo con señalización, formación de guías y promoción.\n\n📌 Equilibrio Medioambiental\nProtección de bosques, fauna, ríos y suelos.\nGestión integral de residuos.\nReforestación y recuperación de áreas dañadas.\nSistemas de alerta temprana ante inundaciones, incendios y sequías.\n\n📌 Bienestar Social\nInfraestructura y equipamiento para educación.\nPromoción del deporte.\nProtección cultural e identidad regional.\nProgramas para niños, mujeres, adultos mayores y personas vulnerables.\n\n📌 Salud para Todos\nHospital de Tercer Nivel en Riberalta.\nModernización del Hospital Germán Busch.\nBarco Hospital y centros de salud fluviales.\nLaboratorio departamental de PCR.\nTelemedicina y digitalización de la salud.",
            '3': "Trabajo social directo: atención a familias, comunidades y sectores vulnerables del Beni.\n\nCruzada de salud en el COVID-19: asistencia médica masiva, medicamentos y apoyo comunitario.\n\nImpulso al Puente Binacional: proyecto estratégico que mejorará la integración comercial con Brasil.\n\nParticipación en el Corredor Bioceánico: promoviendo al Beni como un actor clave para la conexión Atlántico–Pacífico.\n\nLiderazgo cercano y comunitario: visitas constantes a provincias y trabajo con pueblos indígenas.",
            '4': "El objetivo es activar la economía, generar empleo y fortalecer la producción del Beni mediante:\n\nCarreteras y aeropuertos competitivos.\nProgramas de apoyo al sector agropecuario.\nApoyo a MyPEs, artesanos e industrias regionales.\nImpulso al comercio y al turismo en todo el departamento.",
            '5': "Se busca proteger el patrimonio natural del Beni, cuidando la Amazonía y sus ecosistemas:\n\nConservación de bosques, ríos, fauna y flora.\nGestión eficiente de residuos y control de contaminación.\nProyectos de reforestación y recuperación ambiental.\nAlertas tempranas y prevención de desastres naturales.",
            '6': "Este eje fortalece la calidad de vida de las familias:\n\nInfraestructura educativa moderna.\nCentros y espacios deportivos para jóvenes.\nRescate y promoción de la cultura beniana.\nProgramas para mujeres, niños, adultos mayores y personas con discapacidad.\nProyectos de seguridad ciudadana en todos los municipios.",
            '7': "Propone una transformación histórica del sistema de salud:\n\nNuevo Hospital de Tercer Nivel en Riberalta.\nModernización del Hospital Germán Busch en Trinidad.\nCentros de Salud Fluviales y el Barco Hospital para zonas alejadas.\nLaboratorio PCR para controlar dengue, malaria y otras enfermedades.\nTelemedicina y digitalización para un sistema moderno y accesible.",
            '8': "Es una alianza ciudadana departamental que plantea un nuevo modelo político: participativo, innovador y basado en la construcción de un Beni comunal, productivo y unido. Busca superar la política tradicional promoviendo gestión técnica, transparencia y participación de todos los sectores de la sociedad.",
            '9': "La visión del plan es transformar el Beni en un departamento:\n\nProductivo\nModerno\nConectado\nAmbientalmente equilibrado\nCulturalmente fortalecido\nY con un sistema de salud de primer nivel\n\nUn Beni donde el desarrollo llegue a cada provincia, municipio y comunidad."
        };

        // 2. Lógica del Chatbot
        const sessions = getSessions(); // Leemos la base de datos

        // Verificamos si el usuario ya tiene una sesión iniciada
        if (!sessions[remoteJid]) {
            // Si es nuevo (o reinició), enviamos la presentación y el menú obligatoriamente
            await sendMessage(remoteJid, `👋 ¡Hola ${pushName}! Soy el Asistente Virtual del Dr. Alejandro Unzueta.\nEstoy aquí para responder tus preguntas y contarte más sobre su trayectoria y su visión para el Beni.\n\nEscribe el número de la opción que deseas consultar:\n${menuText}`);
            saveSession(remoteJid, { step: 'MAIN_MENU' }); // Guardamos en el archivo
        } else {
            // Si ya existe, procesamos su respuesta
            if (incomingText.includes('hola') || incomingText.includes('buen') || incomingText.includes('menu')) {
                await sendMessage(remoteJid, `👋 ¡Hola de nuevo ${pushName}! Aquí tienes las opciones:\n${menuText}`);
            } else if (responses[incomingText]) {
                await sendMessage(remoteJid, responses[incomingText]);
            } else {
                await sendMessage(remoteJid, "No entendí tu opción. Por favor elige un número del 1 al 9 o escribe 'menú' para ver las opciones.");
            }
        }
    }

    res.status(200).send('EVENT_RECEIVED');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Chatbot corriendo en puerto ${PORT}`);
});