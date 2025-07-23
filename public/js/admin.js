// Variables globales para el admin
let socket;
let isAuthenticated = false;
let adminState = {
    players: new Map(),
    gameActive: false,
    currentQuestion: 0,
    totalQuestions: 15,
    answersReceived: 0,
    questionTimer: null,
    answerDistribution: {},
    recentAnswers: []
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    setupAuthModal();
    initializeAdminSocket();
    setupAdminEventListeners();
    logActivity('Panel de administración iniciado', 'system');
});

function setupAuthModal() {
    const authModal = document.getElementById('auth-modal');
    const passwordInput = document.getElementById('admin-password');
    const loginBtn = document.getElementById('login-btn');
    const authError = document.getElementById('auth-error');
    
    // Mostrar modal en producción o si no está autenticado
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        authModal.style.display = 'flex';
    } else {
        authModal.classList.add('hidden');
        isAuthenticated = true;
    }
    
    loginBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            attemptLogin();
        }
    });
    
    function attemptLogin() {
        const password = passwordInput.value.trim();
        if (!password) {
            showAuthError('Por favor ingresa la contraseña');
            return;
        }
        
        // En localhost, cualquier contraseña funciona para testing
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            isAuthenticated = true;
            authModal.classList.add('hidden');
            connectAsAdmin(password);
            return;
        }
        
        // En producción, verificar con el servidor
        fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                isAuthenticated = true;
                authModal.classList.add('hidden');
                connectAsAdmin(password);
            } else {
                showAuthError('Contraseña incorrecta');
                passwordInput.value = '';
                passwordInput.focus();
            }
        })
        .catch(error => {
            showAuthError('Error de conexión');
            console.error('Error:', error);
        });
    }
    
    function showAuthError(message) {
        authError.textContent = message;
        authError.style.display = 'block';
        setTimeout(() => {
            authError.style.display = 'none';
        }, 3000);
    }
}

function initializeAdminSocket() {
    socket = io();
    
    // Eventos del socket para admin
    socket.on('connect', () => {
        console.log('Admin conectado al servidor');
        if (isAuthenticated) {
            connectAsAdmin();
        }
        logActivity('Conectado como administrador', 'system');
    });
    
    socket.on('admin-auth-required', () => {
        document.getElementById('auth-modal').style.display = 'flex';
        isAuthenticated = false;
    });
    
    socket.on('disconnect', () => {
        console.log('Admin desconectado');
        logActivity('Conexión perdida', 'system');
        updateGameStatus('Desconectado');
    });
    
    socket.on('admin-connected', (data) => {
        adminState.players.clear();
        data.players.forEach(player => {
            adminState.players.set(player.id, player);
        });
        
        updatePlayersDisplay();
        updateGameInfo(data.gameState);
        logActivity(`Admin conectado. ${data.players.length} jugadores en línea`, 'system');
    });
    
    socket.on('player-joined', (data) => {
        adminState.players.set(data.player.id, data.player);
        updatePlayersDisplay();
        logActivity(`${data.player.name} se unió al juego`, 'player');
    });
    
    socket.on('player-left', (data) => {
        adminState.players.delete(data.player.id);
        updatePlayersDisplay();
        logActivity(`${data.player.name} salió del juego`, 'player');
    });
    
    socket.on('question-started', (data) => {
        showCurrentQuestion(data);
        adminState.currentQuestion = data.questionNumber;
        adminState.answersReceived = 0;
        adminState.answerDistribution = {};
        adminState.recentAnswers = [];
        
        updateGameInfo({
            isActive: true,
            currentQuestion: data.questionNumber,
            totalQuestions: 15
        });
        
        startQuestionTimer();
        updateAnswerStats();
        logActivity(`Pregunta ${data.questionNumber} iniciada`, 'game');
    });
    
    socket.on('player-answered', (data) => {
        adminState.answersReceived++;
        
        // Actualizar distribución de respuestas
        if (!adminState.answerDistribution[data.answerIndex]) {
            adminState.answerDistribution[data.answerIndex] = 0;
        }
        adminState.answerDistribution[data.answerIndex]++;
        
        // Agregar a respuestas recientes
        adminState.recentAnswers.unshift({
            playerName: data.playerName,
            isCorrect: data.isCorrect,
            timestamp: new Date()
        });
        
        // Mantener solo las últimas 10 respuestas
        if (adminState.recentAnswers.length > 10) {
            adminState.recentAnswers = adminState.recentAnswers.slice(0, 10);
        }
        
        updateAnswerStats();
        document.getElementById('answers-received').textContent = 
            `${adminState.answersReceived}/${adminState.players.size}`;
            
        logActivity(
            `${data.playerName} respondió ${data.isCorrect ? 'correctamente' : 'incorrectamente'}`, 
            'player'
        );
    });
    
    socket.on('question-results', (data) => {
        updateLeaderboard(data.leaderboard);
        logActivity('Resultados de pregunta mostrados', 'game');
    });
    
    socket.on('game-ended', (data) => {
        adminState.gameActive = false;
        updateGameStatus('Terminado');
        updateLeaderboard(data.leaderboard);
        
        if (data.winner) {
            showWinnerAnnouncement(data.winner);
            logActivity(`¡${data.winner.name} ganó el juego con ${data.winner.score} puntos!`, 'game');
        }
        
        // Habilitar botón de reset
        document.getElementById('reset-game').disabled = false;
        document.getElementById('start-game').disabled = false;
        
        hideQuestionDisplay();
        logActivity('Juego terminado', 'game');
    });
    
    socket.on('error', (message) => {
        showAdminNotification(message, 'error');
        logActivity(`Error: ${message}`, 'system');
    });
}

function connectAsAdmin(password = null) {
    if (socket && socket.connected) {
        socket.emit('join-admin', { password });
    }
}

function setupAdminEventListeners() {
    // Botón iniciar juego
    document.getElementById('start-game').addEventListener('click', startGame);
    
    // Botón reiniciar juego
    document.getElementById('reset-game').addEventListener('click', resetGame);
    
    // Modal de ganador
    document.getElementById('close-winner-modal').addEventListener('click', () => {
        document.getElementById('winner-announcement').classList.remove('show');
    });
}

function startGame() {
    if (adminState.players.size === 0) {
        showAdminNotification('No hay jugadores conectados', 'error');
        return;
    }
    
    socket.emit('start-game');
    adminState.gameActive = true;
    
    updateGameStatus('En curso');
    document.getElementById('start-game').disabled = true;
    document.getElementById('reset-game').disabled = false;
    
    logActivity(`Juego iniciado con ${adminState.players.size} jugadores`, 'game');
}

function resetGame() {
    // Recargar la página para resetear completamente
    if (confirm('¿Estás seguro de que quieres reiniciar el juego? Esto desconectará a todos los jugadores.')) {
        location.reload();
    }
}

function updatePlayersDisplay() {
    const playersList = document.getElementById('players-list');
    const playerCount = document.getElementById('player-count');
    
    playerCount.textContent = adminState.players.size;
    
    if (adminState.players.size === 0) {
        playersList.innerHTML = `
            <div class="no-players">
                <span>No hay jugadores conectados</span>
                <p>Los jugadores pueden unirse en: <strong>http://localhost:3002</strong></p>
            </div>
        `;
        return;
    }
    
    playersList.innerHTML = '';
    adminState.players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.innerHTML = `
            <div class="player-info-left">
                <div class="player-avatar">${player.avatar || '🏎️'}</div>
                <div class="player-details">
                    <h4>${player.name}</h4>
                    <span class="player-status">Conectado</span>
                </div>
            </div>
            <div class="player-score">${player.score || 0}</div>
        `;
        playersList.appendChild(playerCard);
    });
}

function updateGameInfo(gameState) {
    document.getElementById('current-question').textContent = 
        gameState.isActive ? `${gameState.currentQuestion}/15` : '-';
    
    updateGameStatus(gameState.isActive ? 'En curso' : 'Esperando');
}

function updateGameStatus(status) {
    const statusElement = document.getElementById('game-status');
    statusElement.textContent = status;
    
    // Cambiar color según el estado
    statusElement.className = 'stat-value';
    if (status === 'En curso') {
        statusElement.style.color = '#27ae60';
    } else if (status === 'Terminado') {
        statusElement.style.color = '#e74c3c';
    } else {
        statusElement.style.color = '#3498db';
    }
}

function showCurrentQuestion(data) {
    const questionDisplay = document.getElementById('question-display');
    questionDisplay.style.display = 'block';
    
    document.getElementById('display-question-number').textContent = data.questionNumber;
    document.getElementById('display-question-text').textContent = data.question;
    
    const optionsContainer = document.getElementById('display-options');
    optionsContainer.innerHTML = '';
    
    data.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'admin-option';
        optionElement.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span>${option}</span>
        `;
        optionsContainer.appendChild(optionElement);
    });
    
    // Mostrar estadísticas en vivo
    document.getElementById('live-stats').style.display = 'block';
}

function hideQuestionDisplay() {
    document.getElementById('question-display').style.display = 'none';
    document.getElementById('live-stats').style.display = 'none';
}

function startQuestionTimer() {
    let timeLeft = 30;
    const timerElement = document.getElementById('question-timer');
    
    const updateTimer = () => {
        timerElement.textContent = `${timeLeft}s`;
        
        if (timeLeft <= 0) {
            timerElement.textContent = 'Tiempo agotado';
            return;
        }
        
        timeLeft--;
        setTimeout(updateTimer, 1000);
    };
    
    updateTimer();
}

function updateAnswerStats() {
    updateAnswerDistribution();
    updateRecentAnswers();
    
    // Actualizar contador de respuestas
    document.getElementById('answers-received').textContent = 
        `${adminState.answersReceived}/${adminState.players.size}`;
}

function updateAnswerDistribution() {
    const container = document.getElementById('answer-distribution');
    container.innerHTML = '';
    
    const totalAnswers = Object.values(adminState.answerDistribution).reduce((sum, count) => sum + count, 0);
    
    // Mostrar distribución para opciones A, B, C, D
    for (let i = 0; i < 4; i++) {
        const count = adminState.answerDistribution[i] || 0;
        const percentage = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0;
        
        const barElement = document.createElement('div');
        barElement.className = 'answer-bar';
        barElement.innerHTML = `
            <div class="bar-label">${String.fromCharCode(65 + i)}</div>
            <div class="bar-fill">
                <div class="bar-progress" style="width: ${percentage}%">
                    <span class="bar-count">${count}</span>
                </div>
            </div>
        `;
        container.appendChild(barElement);
    }
}

function updateRecentAnswers() {
    const container = document.getElementById('recent-answers');
    container.innerHTML = '';
    
    adminState.recentAnswers.forEach(answer => {
        const answerElement = document.createElement('div');
        answerElement.className = 'recent-answer';
        answerElement.innerHTML = `
            <span class="answer-player">${answer.playerName}</span>
            <span class="answer-status ${answer.isCorrect ? 'correct' : 'incorrect'}">
                ${answer.isCorrect ? '✓' : '✗'}
            </span>
        `;
        container.appendChild(answerElement);
    });
}

function updateLeaderboard(leaderboard) {
    const container = document.getElementById('admin-leaderboard');
    
    if (!leaderboard || leaderboard.length === 0) {
        container.innerHTML = `
            <div class="no-scores">
                <span>No hay puntuaciones disponibles</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    leaderboard.slice(0, 10).forEach((player, index) => {
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'first';
        else if (rank === 2) rankClass = 'second';
        else if (rank === 3) rankClass = 'third';
        
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <span class="leaderboard-rank ${rankClass}">${rank}</span>
            <div class="leaderboard-player">
                <div class="leaderboard-avatar">${player.avatar || '🏎️'}</div>
                <span class="leaderboard-name">${player.name}</span>
            </div>
            <span class="leaderboard-score">${player.score}</span>
        `;
        container.appendChild(item);
    });
}

function showWinnerAnnouncement(winner) {
    document.getElementById('winner-avatar').textContent = winner.avatar || '🏎️';
    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-score').textContent = winner.score;
    
    document.getElementById('winner-announcement').classList.add('show');
    
    showAdminNotification(`¡${winner.name} ganó la trivia!`, 'success');
}

function logActivity(message, type = 'system') {
    const logContainer = document.getElementById('activity-log');
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    
    let typeLabel = '';
    switch (type) {
        case 'system':
            typeLabel = 'Sistema';
            break;
        case 'player':
            typeLabel = 'Jugador';
            break;
        case 'game':
            typeLabel = 'Juego';
            break;
        default:
            typeLabel = 'Info';
    }
    
    logEntry.innerHTML = `
        <span class="log-time">[${timestamp} - ${typeLabel}]</span>
        <span class="log-message">${message}</span>
    `;
    
    // Insertar al principio
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    
    // Mantener solo los últimos 50 logs
    const logs = logContainer.querySelectorAll('.log-entry');
    if (logs.length > 50) {
        logs[logs.length - 1].remove();
    }
}

function showAdminNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `admin-notification admin-notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Agregar estilos si no existen
    if (!document.querySelector('.admin-notification-styles')) {
        const styles = document.createElement('style');
        styles.className = 'admin-notification-styles';
        styles.textContent = `
            .admin-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                min-width: 300px;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            .admin-notification-success {
                background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            }
            
            .admin-notification-error {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            }
            
            .admin-notification-info {
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            }
            
            .admin-notification button {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Actualizar interfaz cada segundo
setInterval(() => {
    if (adminState.gameActive) {
        updatePlayersDisplay();
    }
}, 5000);

// Manejo de errores
window.addEventListener('error', function(event) {
    console.error('Error en admin:', event.error);
    logActivity(`Error: ${event.error.message}`, 'system');
});
