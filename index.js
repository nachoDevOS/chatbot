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

// Función para enviar medios (imágenes)
async function sendMedia(remoteJid, filePath, caption) {
    try {
        if (!fs.existsSync(filePath)) {
            console.error('Archivo no encontrado:', filePath);
            await sendMessage(remoteJid, caption); // Fallback a texto si no hay imagen
            return;
        }
        const fileData = fs.readFileSync(filePath, { encoding: 'base64' });
        await axios.post(`${BASE_URL}/message/sendMedia/${INSTANCE}`, {
            number: remoteJid,
            media: fileData,
            mediatype: "image",
            caption: caption
        }, {
            headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' }
        });
        console.log(`Imagen enviada a: ${remoteJid}`);
    } catch (error) {
        console.error('Error enviando imagen:', error.response?.data || error.message);
        await sendMessage(remoteJid, caption); // Fallback a texto si falla
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
1️⃣ 👤 *¿Quién es Alejandro Unzueta?*
2️⃣ 📋 *Propuestas*
3️⃣ 🏆 *Logros*
4️⃣ 🏭 *Desarrollo Económico Productivo*
5️⃣ 🌳 *Equilibrio Medioambiental*
6️⃣ 👨‍👩‍👧‍👦 *Bienestar Social*
7️⃣ 🏥 *Salud para Todos*
8️⃣ 🤝 *¿Qué es la Alianza Despierta?*
9️⃣ 🔭 *¿Cuál es la visión del plan?*
🔟 📞 *Hablar con un representante*`;

        const responses = {
            '1': "👤 *Alejandro Unzueta* es un líder beniano reconocido por su trabajo social y su compromiso con la salud y el bienestar de las familias. ❤️🏥\n\n🦠 Se hizo conocido por su apoyo directo a la población durante la pandemia del COVID-19, brindando asistencia médica, medicamentos y acompañamiento a miles de personas. 💊🤝\n\n🌟 Su visión es construir un Beni productivo, moderno, seguro y conectado, donde todas las comunidades tengan acceso a oportunidades, desarrollo y salud de calidad. 🚜🏗️",
            '2': "📋 *Principales propuestas del Plan 2026–2031:*\n\n🏭 *Desarrollo Económico Productivo*\n• Apoyo a MyPEs, artesanos y emprendedores. 🛠️\n• Mejora de carreteras, aeropuertos y obras productivas. 🛣️✈️\n• Fortalecimiento de agricultura, ganadería y cadenas productivas. 🌾🐄\n• Impulso al turismo con señalización y promoción. 🗺️📸\n\n🌳 *Equilibrio Medioambiental*\n• Protección de bosques, fauna, ríos y suelos. 🐆🌊\n• Gestión integral de residuos. ♻️\n• Reforestación y recuperación de áreas dañadas. 🌱\n• Alerta temprana ante desastres. 🚨\n\n👨‍👩‍👧‍👦 *Bienestar Social*\n• Infraestructura educativa moderna. 🏫\n• Promoción del deporte. ⚽\n• Protección cultural e identidad regional. 🎭\n• Programas para grupos vulnerables. 🤝\n\n🏥 *Salud para Todos*\n• Hospital de Tercer Nivel en Riberalta. 🏥\n• Modernización del Hospital Germán Busch. 🚑\n• Barco Hospital y centros fluviales. 🚤🩺\n• Laboratorio PCR y Telemedicina. 🔬💻",
            '3': "🏆 *Logros y Trayectoria:*\n\n🤝 *Trabajo social directo:* Atención a familias, comunidades y sectores vulnerables del Beni.\n\n🩺 *Cruzada de salud COVID-19:* Asistencia médica masiva, medicamentos y apoyo comunitario en momentos críticos. 💊\n\n🌉 *Impulso al Puente Binacional:* Proyecto estratégico para la integración comercial con Brasil. 🇧🇷🇧🇴\n\n🌍 *Corredor Bioceánico:* Promoción del Beni como actor clave en la conexión Atlántico–Pacífico. 🚛\n\n👣 *Liderazgo cercano:* Visitas constantes a provincias y trabajo mano a mano con pueblos indígenas. 🛖",
            '4': "📈 *Desarrollo Económico Productivo*\n\nEl objetivo es activar la economía, generar empleo y fortalecer la producción del Beni mediante: 💼💰\n\n🛣️ Carreteras y aeropuertos competitivos.\n🚜 Programas de apoyo al sector agropecuario.\n🛠️ Apoyo a MyPEs, artesanos e industrias regionales.\n🛍️ Impulso al comercio y al turismo en todo el departamento. ✈️",
            '5': "🌿 *Equilibrio Medioambiental*\n\nSe busca proteger el patrimonio natural del Beni, cuidando la Amazonía y sus ecosistemas: 🦜🌳\n\n🛡️ Conservación de bosques, ríos, fauna y flora.\n♻️ Gestión eficiente de residuos y control de contaminación.\n🌱 Proyectos de reforestación y recuperación ambiental.\n🚨 Alertas tempranas y prevención de desastres naturales.",
            '6': "👨‍👩‍👧‍👦 *Bienestar Social*\n\nEste eje fortalece la calidad de vida de las familias benianas: ❤️🏠\n\n🏫 Infraestructura educativa moderna.\n⚽ Centros y espacios deportivos para jóvenes.\n🎭 Rescate y promoción de la cultura beniana.\n👵👶 Programas para mujeres, niños, adultos mayores y personas con discapacidad.\n👮‍♂️ Proyectos de seguridad ciudadana en todos los municipios.",
            '7': "🏥 *Salud para Todos*\n\nPropone una transformación histórica del sistema de salud: 🩺✨\n\n🏗️ Nuevo Hospital de Tercer Nivel en Riberalta.\n🚑 Modernización del Hospital Germán Busch en Trinidad.\n🚤 Barco Hospital y centros de salud fluviales para zonas alejadas.\n🔬 Laboratorio PCR para controlar dengue, malaria y otras enfermedades.\n💻 Telemedicina y digitalización para un sistema moderno y accesible.",
            '8': "🤝 *¿Qué es la Alianza Despierta?*\n\nEs una alianza ciudadana departamental que plantea un nuevo modelo político: 🗳️✨\n\n✅ Participativo e innovador.\n✅ Basado en la construcción de un Beni comunal, productivo y unido.\n\n🚀 Busca superar la política tradicional promoviendo gestión técnica, transparencia y participación de todos los sectores de la sociedad. 👫🇧🇴",
            '9': "🔭 *Visión del Plan*\n\nLa visión es transformar el Beni en un departamento: 🌟\n\n🚜 Productivo\n🏙️ Moderno\n🔗 Conectado\n🌿 Ambientalmente equilibrado\n🎭 Culturalmente fortalecido\n🏥 Con un sistema de salud de primer nivel\n\nUn Beni donde el desarrollo llegue a cada provincia, municipio y comunidad. 🏡✨",
            '10': "📞 *Hablar con un Asesor*\n\n✅ Hemos recibido tu solicitud.\n\nUn representante del equipo se pondrá en contacto contigo a la brevedad para atenderte de manera personalizada. 👨‍💼💬\n\n¡Gracias por tu interés! 🙏"
        };

        // 2. Lógica del Chatbot
        const sessions = getSessions(); // Leemos la base de datos

        // Verificar si el bot está en pausa (esperando representante)
        if (sessions[remoteJid]?.pausedUntil) {
            if (Date.now() < sessions[remoteJid].pausedUntil) {
                return res.sendStatus(200); // El bot está en silencio, no hace nada
            }
            // Si ya pasaron los 10 minutos, reactivamos el bot borrando la pausa
            delete sessions[remoteJid].pausedUntil;
            saveSession(remoteJid, sessions[remoteJid]);
        }

        // Verificamos si el usuario ya tiene una sesión iniciada
        if (!sessions[remoteJid]) {
            // Si es nuevo (o reinició), enviamos la presentación y el menú obligatoriamente
            await sendMessage(remoteJid, `👋 ¡Hola *${pushName}*! Soy el Asistente Virtual del Dr. Alejandro Unzueta.\nEstoy aquí para responder tus preguntas y contarte más sobre su trayectoria y su visión para el Beni.\n\n*Escribe el número de la opción que deseas consultar:*\n${menuText}`);
            saveSession(remoteJid, { step: 'MAIN_MENU' }); // Guardamos en el archivo
        } else {
            // Si ya existe, procesamos su respuesta
            if (incomingText.includes('hola') || incomingText.includes('buen') || incomingText.includes('menu') || incomingText.includes('menú')) {
                await sendMessage(remoteJid, `👋 ¡Hola de nuevo *${pushName}*! Soy el Asistente Virtual del Dr. Alejandro Unzueta.\nEstoy aquí para responder tus preguntas y contarte más sobre su trayectoria y su visión para el Beni.\n\n*Escribe el número de la opción que deseas consultar:*\n${menuText}`);
            } else if (incomingText === '1') {
                const imagePath = path.join(__dirname, 'image', 'alejandro.jpeg');
                await sendMedia(remoteJid, imagePath, responses['1']);
            } else if (responses[incomingText]) {
                await sendMessage(remoteJid, responses[incomingText]);
                // Si elige hablar con representante (10), pausamos el bot por 10 minutos
                if (incomingText === '10') {
                    sessions[remoteJid].pausedUntil = Date.now() + 10 * 60 * 1000; // 10 minutos en milisegundos
                    saveSession(remoteJid, sessions[remoteJid]);
                }
            } else {
                await sendMessage(remoteJid, "No entendí tu opción. Por favor elige un número del *1 al 10* o escribe '*Menu*' para ver las opciones.");
            }
        }
    }

    res.status(200).send('EVENT_RECEIVED');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Chatbot corriendo en puerto ${PORT}`);
});