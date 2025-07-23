# 🔥 Configuración de Firebase para Trivia GM

## ¿Qué hemos agregado?

✅ **Base de datos en la nube** - Los jugadores y estadísticas se guardan en Firebase
✅ **Sincronización entre dispositivos** - Los datos se comparten automáticamente
✅ **Leaderboard global** - Top jugadores visibles para todos
✅ **Panel de administrador mejorado** - Estadísticas en tiempo real
✅ **Modo offline** - Funciona aunque Firebase no esté disponible

## 🚀 Cómo configurar Firebase (Opcional)

Para usar la base de datos real, necesitas crear un proyecto en Firebase:

### Paso 1: Crear proyecto en Firebase
1. Ve a https://console.firebase.google.com/
2. Clic en "Crear un proyecto"
3. Nombre: "trivia-gm"
4. Desactivar Google Analytics (opcional)

### Paso 2: Configurar Firestore
1. En el proyecto, ve a "Firestore Database"
2. Clic en "Crear base de datos"
3. Seleccionar "Comenzar en modo de prueba"
4. Elegir ubicación (us-central1)

### Paso 3: Obtener configuración
1. Ve a "Configuración del proyecto" (⚙️)
2. Bajar a "Tus apps" → "Web"
3. Clic en "</>" para agregar app web
4. Nombre: "trivia-gm-web"
5. Copiar el objeto `firebaseConfig`

### Paso 4: Reemplazar configuración
En el archivo `index.html`, reemplaza esta sección:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDemoKey123456789",
    authDomain: "trivia-gm-demo.firebaseapp.com",
    projectId: "trivia-gm-demo",
    storageBucket: "trivia-gm-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo123456789"
};
```

Con tu configuración real de Firebase.

## 📊 Funcionalidades nuevas

### Para Jugadores:
- Las puntuaciones se guardan automáticamente en la nube
- Ver leaderboard global al finalizar el juego
- Los datos persisten entre dispositivos

### Para Administradores:
- Estadísticas globales en tiempo real
- Lista completa de todos los jugadores
- Puntuaciones ordenadas por ranking
- Fechas y horas de cada partida

## 🔧 Modo de desarrollo actual

Actualmente la app funciona con:
- **Configuración demo** de Firebase (puede no funcionar)
- **Fallback a localStorage** si Firebase falla
- **Compatibilidad total** con la versión anterior

## ⚡ Estado actual de la aplicación

✅ Funciona sin configuración adicional
✅ Guarda datos localmente como backup
✅ Lista para usar Firebase cuando se configure
✅ Mantiene compatibilidad con versión anterior

¡La aplicación seguirá funcionando perfectamente aunque no configures Firebase!
