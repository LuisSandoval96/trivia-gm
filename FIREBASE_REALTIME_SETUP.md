# 🔥 Configuración Firebase Real Database - Trivia GM

## Pasos para configurar Firebase Real Database

### 1. Crear proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Haz clic en "Crear un proyecto"
3. Nombre del proyecto: `trivia-gm`
4. Desactiva Google Analytics (no necesario)
5. Haz clic en "Crear proyecto"

### 2. Configurar Realtime Database
1. En el menú lateral, ve a "Realtime Database"
2. Haz clic en "Crear base de datos"
3. Elige ubicación: `us-central1` (recomendado)
4. **IMPORTANTE**: Selecciona "Comenzar en modo de prueba" (permite lectura/escritura por 30 días)
5. Copia la URL de la base de datos (algo como: `https://trivia-gm-default-rtdb.firebaseio.com`)

### 3. Obtener configuración del proyecto
1. Ve a "Configuración del proyecto" (icono de engranaje)
2. Baja hasta "Tus aplicaciones"
3. Haz clic en "Añadir app" > "Web" (icono </> )
4. Nombre de la app: `Trivia GM Web`
5. **NO** marcar "También configurar Firebase Hosting"
6. Copia toda la configuración que aparece

### 4. Actualizar firebase-config.js
Reemplaza los valores de ejemplo en `firebase-config.js` con tus datos reales:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "trivia-gm.firebaseapp.com", 
    databaseURL: "https://trivia-gm-default-rtdb.firebaseio.com", // ← MUY IMPORTANTE
    projectId: "trivia-gm",
    storageBucket: "trivia-gm.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789012"
};
```

### 5. Configurar reglas de seguridad (opcional pero recomendado)
En Realtime Database > Reglas, usa estas reglas para mayor seguridad:

```json
{
  "rules": {
    "players": {
      ".read": true,
      ".write": true,
      "$playerId": {
        ".validate": "newData.hasChildren(['name', 'avatar', 'finalScore', 'correctAnswers'])"
      }
    },
    "stats": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 6. Probar la conexión
1. Abre la consola del navegador en tu aplicación
2. Busca estos mensajes:
   - `🔥 Firebase configurado para Trivia GM`
   - `🔥 Estado Firebase: Conectado ✅`
   - `🔥 Firebase conectado - Modo sincronizado`

### 7. Estructura de datos esperada
Tu base de datos tendrá esta estructura:

```
trivia-gm-default-rtdb/
├── players/
│   ├── -player1-id/
│   │   ├── name: "Juan"
│   │   ├── avatar: "🚗"  
│   │   ├── finalScore: 850
│   │   ├── correctAnswers: 12
│   │   ├── timestamp: 1642694400000
│   │   └── device: "móvil"
│   └── -player2-id/
│       └── ...
└── stats/
    ├── totalPlayers: 5
    ├── bestScore: 1200
    └── lastUpdated: 1642694400000
```

## 🚨 Solución de problemas

### Error: "Firebase no disponible"
- Verifica que firebase-config.js se carga correctamente
- Revisa la consola por errores de configuración
- Asegúrate que la URL de database es correcta

### Error: "Permission denied" 
- Verifica que las reglas permiten lectura/escritura
- En modo prueba, las reglas son: `".read": true, ".write": true`

### No se sincronizan los datos
- Verifica conexión a internet
- Revisa la consola por errores de Firebase
- Confirma que la databaseURL es correcta

## 📱 Pruebas cross-device
1. Abre la app en móvil: Crea un jugador
2. Abre la app en computadora: Deberías ver el jugador del móvil
3. Completa el juego en cualquier dispositivo
4. Los resultados aparecen en ambos dispositivos

¡Firebase Real Database permitirá que los datos se sincronicen automáticamente entre todos los dispositivos! 🎉
