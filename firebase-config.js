// Configuración Firebase Real Database para Trivia GM
// IMPORTANTE: Reemplazar con tus credenciales reales de Firebase

const firebaseConfig = {
    apiKey: "AIzaSyExample-replace-with-your-api-key",
    authDomain: "trivia-gm-default-rtdb.firebaseapp.com",
    databaseURL: "https://trivia-gm-default-rtdb.firebaseio.com",
    projectId: "trivia-gm",
    storageBucket: "trivia-gm.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789012"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// API de Firebase para la trivia
window.firebaseAPI = {
    // Guardar jugador en Firebase Real Database
    async savePlayer(player) {
        try {
            console.log('🔥 Guardando jugador en Firebase:', player.name);
            
            // Crear referencia única para el jugador
            const playerRef = database.ref('players').push();
            const playerData = {
                ...player,
                id: playerRef.key,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                lastActive: firebase.database.ServerValue.TIMESTAMP
            };
            
            await playerRef.set(playerData);
            
            // Actualizar estadísticas globales
            await this.updateGlobalStats(player);
            
            console.log('✅ Jugador guardado en Firebase con ID:', playerRef.key);
            return { success: true, id: playerRef.key };
            
        } catch (error) {
            console.error('❌ Error guardando en Firebase:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Cargar todos los jugadores
    async loadAllPlayers() {
        try {
            console.log('🔥 Cargando jugadores desde Firebase...');
            
            const snapshot = await database.ref('players').once('value');
            const playersData = snapshot.val() || {};
            
            // Convertir objeto a array y ordenar por puntaje
            const players = Object.values(playersData).sort((a, b) => b.finalScore - a.finalScore);
            
            console.log('✅ Cargados', players.length, 'jugadores desde Firebase');
            return players;
            
        } catch (error) {
            console.error('❌ Error cargando jugadores:', error);
            return [];
        }
    },
    
    // Cargar estadísticas globales
    async loadGlobalStats() {
        try {
            const snapshot = await database.ref('stats').once('value');
            const stats = snapshot.val() || {
                totalPlayers: 0,
                totalGames: 0,
                bestScore: 0,
                averageScore: 0
            };
            
            return stats;
        } catch (error) {
            console.error('❌ Error cargando stats:', error);
            return { totalPlayers: 0, totalGames: 0, bestScore: 0, averageScore: 0 };
        }
    },
    
    // Actualizar estadísticas globales
    async updateGlobalStats(player) {
        try {
            const statsRef = database.ref('stats');
            const snapshot = await statsRef.once('value');
            const currentStats = snapshot.val() || { totalPlayers: 0, totalGames: 0, bestScore: 0, averageScore: 0 };
            
            const newStats = {
                totalPlayers: (currentStats.totalPlayers || 0) + 1,
                totalGames: (currentStats.totalGames || 0) + 1,
                bestScore: Math.max(currentStats.bestScore || 0, player.finalScore || 0),
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
            };
            
            await statsRef.update(newStats);
            console.log('📊 Estadísticas actualizadas:', newStats);
            
        } catch (error) {
            console.error('❌ Error actualizando stats:', error);
        }
    },
    
    // Escuchar cambios en tiempo real
    onPlayersUpdate(callback) {
        database.ref('players').on('value', (snapshot) => {
            const playersData = snapshot.val() || {};
            const players = Object.values(playersData).sort((a, b) => b.finalScore - a.finalScore);
            callback(players);
        });
    },
    
    // Detener listeners
    stopListening() {
        database.ref('players').off();
        database.ref('stats').off();
    },
    
    // Verificar conexión
    async testConnection() {
        try {
            const testRef = database.ref('.info/connected');
            const snapshot = await testRef.once('value');
            const connected = snapshot.val();
            
            console.log('🔥 Firebase conectado:', connected);
            return connected;
        } catch (error) {
            console.error('❌ Error conectando Firebase:', error);
            return false;
        }
    }
};

// Función para verificar si Firebase está disponible
window.isFirebaseAvailable = function() {
    return typeof firebase !== 'undefined' && firebase.apps.length > 0;
};

console.log('🔥 Firebase configurado para Trivia GM');
