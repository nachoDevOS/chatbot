# Chatbot - Asistente Virtual Alejandro Unzueta

Este proyecto es un chatbot de WhatsApp desarrollado en Node.js que utiliza la **Evolution API** para enviar y recibir mensajes de forma automatizada. El bot gestiona un menú interactivo con información sobre propuestas, logros y contacto.

## 📋 Requisitos Previos

Para desplegar este proyecto necesitas:

1.  **Node.js**: Versión 16 o superior instalada.
2.  **Evolution API**: Una instancia operativa de Evolution API ya vinculada a un número de WhatsApp.
3.  **Conexión a Internet**: El servidor debe tener salida a internet para comunicarse con la API.

## 🚀 Instalación Paso a Paso

1.  **Descargar el proyecto**: Ubícate en la carpeta raíz del proyecto.
2.  **Instalar dependencias**: Ejecuta el siguiente comando en la terminal para instalar las librerías necesarias (`express`, `axios`):
    ```bash
    npm install express axios
    ```

## ⚙️ Configuración

El proyecto requiere cierta configuración manual en el código y en el sistema de archivos:

### 1. Credenciales de API
Abre el archivo `index.js` y verifica/actualiza las siguientes líneas con los datos de tu instancia de Evolution API:

```javascript
const API_KEY = 'TU_API_KEY_AQUI';
const BASE_URL = 'URL_DE_TU_EVOLUTION_API'; // Ej: http://tuservidor.com:8080
const INSTANCE = 'NOMBRE_DE_TU_INSTANCIA';
```

### 2. Archivos Multimedia
El código (línea 128) intenta enviar una imagen local. Para evitar errores, debes crear la estructura de carpetas:

1.  Crea una carpeta llamada `image` en la raíz del proyecto.
2.  Coloca dentro una imagen llamada `alejandro.jpeg`.

## ▶️ Ejecución y Despliegue

### Ejecución Local
Para iniciar el bot:
```bash
node index.js
```
El servidor escuchará en el puerto **3000**.

### Configuración del Webhook
Para que el bot reciba mensajes, debes configurar el Webhook en tu Evolution API apuntando a la IP pública de este servidor:

- **URL del Webhook**: `http://TU_IP_PUBLICA:3000/webhook`
- **Eventos requeridos**: Asegúrate de habilitar `MESSAGES_UPSERT` en la configuración de la instancia.

### Despliegue en Producción (Recomendado)
Para mantener el bot activo 24/7, se recomienda usar **PM2**:

```bash
npm install -g pm2
pm2 start index.js --name "chatbot-alejandro" -- run start
pm2 save
pm2 startup
```

## 📂 Estructura de Datos
El bot generará automáticamente un archivo `database.json` en la raíz para guardar el historial de sesiones y pausas de los usuarios.
