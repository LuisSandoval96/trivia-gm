# 🏎️ Trivia General Motors

Una aplicación interactiva de trivia en tiempo real sobre la historia de General Motors, desarrollada al estilo Kahoot con funcionalidades multijugador y panel de administración.

## 🌟 Características

- **15 preguntas** sobre la historia de General Motors en Norteamérica y México
- **Multijugador en tiempo real** con Socket.io
- **Panel de administración** para gestionar el juego
- **Sistema de puntuación** con bonificación por velocidad
- **Cupón digital** para el ganador (Hummer EV)
- **Diseño responsivo** para móviles y escritorio
- **Avatares personalizables** para los jugadores

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

### Instalación
```bash
# Clonar o descargar el proyecto
cd triviapm2

# Instalar dependencias
npm install
```

### Ejecutar la aplicación

#### Modo de desarrollo (con recarga automática)
```bash
npm run dev
```

#### Modo de producción
```bash
npm start
```

La aplicación estará disponible en:

- **Jugadores**: <http://localhost:3002>
- **Administrador**: <http://localhost:3002/admin>

## 🎮 Cómo Jugar

### Para Jugadores
1. Accede a <http://localhost:3002>
2. Ingresa tu nombre y elige un avatar
3. Haz clic en "Unirse al Juego"
4. Espera a que el administrador inicie el juego
5. Responde las preguntas lo más rápido posible
6. ¡El ganador recibe un cupón para Hummer EV!

### Para Administradores

1. Accede a <http://localhost:3002/admin>
2. Espera a que se conecten los jugadores
3. Haz clic en "Iniciar Juego" cuando estés listo
4. Monitorea el progreso en tiempo real
5. Ve las estadísticas y el ganador final

## 📋 Preguntas de la Trivia

La trivia incluye 15 preguntas sobre:
- Historia fundacional de General Motors
- Desarrollo en México y Norteamérica
- Modelos icónicos y marcas
- Innovaciones tecnológicas
- Datos actuales sobre la empresa

## 🛠️ Estructura del Proyecto

```
triviapm2/
├── server.js              # Servidor principal con Socket.io
├── package.json           # Configuración del proyecto
├── public/                # Archivos estáticos
│   ├── index.html        # Interfaz de jugadores
│   ├── admin.html        # Panel de administración
│   ├── css/
│   │   ├── style.css     # Estilos para jugadores
│   │   └── admin.css     # Estilos para admin
│   ├── js/
│   │   ├── game.js       # Lógica del juego (jugadores)
│   │   └── admin.js      # Lógica del admin
│   └── images/           # Imágenes del proyecto
└── .github/
    └── copilot-instructions.md  # Instrucciones para Copilot
```

## 🎯 Características Técnicas

### Backend
- **Node.js** con Express
- **Socket.io** para comunicación en tiempo real
- **UUID** para identificadores únicos
- **CORS** habilitado para desarrollo

### Frontend
- **HTML5** semántico
- **CSS3** moderno con gradientes y animaciones
- **JavaScript ES6+** vanilla
- **Diseño responsivo** con CSS Grid y Flexbox

### Funcionalidades en Tiempo Real
- Conexión/desconexión de jugadores
- Envío de preguntas sincronizado
- Recolección de respuestas en vivo
- Actualizaciones de puntuación
- Tabla de posiciones en tiempo real

## 🏆 Sistema de Puntuación

- **Respuesta correcta**: 1000 puntos base
- **Bonificación por velocidad**: Hasta 300 puntos adicionales
- **Respuesta incorrecta**: 0 puntos
- **Sin respuesta**: 0 puntos

## 🎁 Premio para el Ganador

El jugador con mayor puntuación recibe:
- Cupón digital descargable
- Código único de premio
- Válido por 30 días
- Premio: Hummer EV (sujeto a términos y condiciones)

## 🔧 Configuración

### Variables de Entorno (Opcional)

```bash
PORT=3002  # Puerto del servidor (por defecto: 3002)
NODE_ENV=production  # Entorno de producción
ADMIN_PASSWORD=admin123GM  # Contraseña del administrador
```

### 🌐 Deployment

La aplicación está lista para ser desplegada en plataformas como:

- **Render** (Recomendado - Gratis): Ver `DEPLOYMENT.md`
- **Railway**: Deployment automático desde GitHub
- **Heroku**: Con `Procfile` incluido

**Archivos de configuración incluidos**:
- `render.yaml` - Configuración para Render
- `Procfile` - Configuración para Heroku
- Variables de entorno configuradas
- Autenticación de administrador

Ver el archivo `DEPLOYMENT.md` para instrucciones detalladas.

### Personalización
- Modifica las preguntas en `server.js` (array `questions`)
- Cambia los estilos en los archivos CSS
- Ajusta el tiempo de respuesta (por defecto: 30 segundos)

## 📱 Compatibilidad

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Móviles iOS/Android

## 🐳 Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `package.json` para más detalles.

## 🆘 Soporte

Si encuentras algún problema:
1. Verifica que todas las dependencias estén instaladas
2. Asegúrate de que el puerto 3000 esté disponible
3. Revisa la consola del navegador para errores JavaScript
4. Verifica la consola del servidor para errores de Node.js

## 📞 Contacto

Para más información sobre General Motors, visita: https://www.gm.com

---

¡Disfruta de la trivia de General Motors! 🏁
