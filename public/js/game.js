// Variables globales
let socket;
let gameState = {
    playerId: null,
    playerName: '',
    playerAvatar: '🏎️',
    currentScore: 0,
    isGameActive: false,
    currentQuestion: null,
    timeRemaining: 30,
    selectedAnswer: null,
    questionStartTime: null
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeSocket();
    setupEventListeners();
    setupAvatarSelection();
});

function initializeSocket() {
    socket = io();
    
    // Eventos del socket
    socket.on('connect', () => {
        console.log('Conectado al servidor');
    });
    
    socket.on('disconnect', () => {
        console.log('Desconectado del servidor');
        showScreen('welcome-screen');
        showNotification('Conexión perdida. Recarga la página.', 'error');
    });
    
    socket.on('player-joined', (data) => {
        gameState.playerId = data.playerId;
        gameState.playerName = data.player.name;
        gameState.playerAvatar = data.player.avatar;
        
        document.getElementById('player-display-name').textContent = gameState.playerName;
        document.getElementById('player-avatar').textContent = gameState.playerAvatar;
        
        showScreen('waiting-screen');
        showNotification(`¡Bienvenido ${gameState.playerName}!`, 'success');
    });
    
    socket.on('question', (data) => {
        startQuestion(data);
    });
    
    socket.on('answer-result', (data) => {
        handleAnswerResult(data);
    });
    
    socket.on('question-results', (data) => {
        showQuestionResults(data);
    });
    
    socket.on('game-ended', (data) => {
        showFinalResults(data);
    });
    
    socket.on('winner-coupon', (data) => {
        showWinnerCoupon(data);
    });
    
    socket.on('error', (message) => {
        showNotification(message, 'error');
    });
}

function setupEventListeners() {
    // Formulario de unirse al juego
    document.getElementById('join-game').addEventListener('click', joinGame);
    document.getElementById('player-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            joinGame();
        }
    });
    
    // Botones de opciones (se configuran dinámicamente)
    
    // Botón de jugar de nuevo
    document.getElementById('play-again').addEventListener('click', () => {
        location.reload();
    });
    
    // Botones del cupón de ganador
    document.getElementById('download-coupon').addEventListener('click', downloadCoupon);
    document.getElementById('close-winner').addEventListener('click', () => {
        document.getElementById('winner-screen').classList.remove('show');
    });
}

function setupAvatarSelection() {
    const avatarButtons = document.querySelectorAll('.avatar-btn');
    
    avatarButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover selección anterior
            document.querySelector('.avatar-btn.active').classList.remove('active');
            
            // Agregar selección nueva
            btn.classList.add('active');
            gameState.playerAvatar = btn.dataset.avatar;
        });
    });
}

function joinGame() {
    const nameInput = document.getElementById('player-name');
    const playerName = nameInput.value.trim();
    
    if (!playerName) {
        showNotification('Por favor ingresa tu nombre', 'error');
        nameInput.focus();
        return;
    }
    
    if (playerName.length > 20) {
        showNotification('El nombre debe tener máximo 20 caracteres', 'error');
        nameInput.focus();
        return;
    }
    
    gameState.playerName = playerName;
    
    // Enviar al servidor
    socket.emit('join-player', {
        name: gameState.playerName,
        avatar: gameState.playerAvatar
    });
}

function startQuestion(data) {
    gameState.isGameActive = true;
    gameState.currentQuestion = data;
    gameState.timeRemaining = data.timeRemaining || 30;
    gameState.selectedAnswer = null;
    gameState.questionStartTime = Date.now();
    
    // Actualizar UI
    document.getElementById('question-number').textContent = data.questionNumber;
    document.getElementById('question-text').textContent = data.question;
    document.getElementById('current-score').textContent = gameState.currentScore;
    
    // Crear opciones
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    data.options.forEach((option, index) => {
        const optionElement = document.createElement('button');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(optionElement);
    });
    
    showScreen('game-screen');
    startTimer(data.timeRemaining || 30);
    
    // Ocultar feedback anterior
    document.getElementById('answer-feedback').classList.remove('show');
}

function selectAnswer(answerIndex) {
    if (gameState.selectedAnswer !== null) return; // Ya respondió
    
    gameState.selectedAnswer = answerIndex;
    
    // Marcar opción seleccionada
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        if (index === answerIndex) {
            option.classList.add('selected');
        }
        option.classList.add('disabled');
    });
    
    // Enviar respuesta al servidor
    socket.emit('answer', {
        answerIndex: answerIndex,
        timeElapsed: Date.now() - gameState.questionStartTime
    });
}

function handleAnswerResult(data) {
    gameState.currentScore = data.totalScore;
    
    const feedback = document.getElementById('answer-feedback');
    const options = document.querySelectorAll('.option');
    
    if (data.correct) {
        feedback.innerHTML = `
            <div class="feedback-correct">
                <h3>¡Correcto! 🎉</h3>
                <p>+${data.points} puntos</p>
                <p>Puntuación total: ${data.totalScore}</p>
            </div>
        `;
        
        // Marcar opción como correcta
        options[gameState.selectedAnswer].classList.add('correct');
    } else {
        feedback.innerHTML = `
            <div class="feedback-incorrect">
                <h3>Incorrecto 😔</h3>
                <p>+0 puntos</p>
                <p>Puntuación total: ${data.totalScore}</p>
            </div>
        `;
        
        // Marcar opción como incorrecta
        options[gameState.selectedAnswer].classList.add('incorrect');
    }
    
    feedback.classList.add('show');
}

function startTimer(seconds) {
    const timerElement = document.getElementById('timer-text');
    const timerCircle = document.querySelector('.timer-circle');
    let timeLeft = seconds;
    
    const updateTimer = () => {
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerCircle.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            // Tiempo agotado
            if (gameState.selectedAnswer === null) {
                const options = document.querySelectorAll('.option');
                options.forEach(option => {
                    option.classList.add('disabled');
                });
                
                const feedback = document.getElementById('answer-feedback');
                feedback.innerHTML = `
                    <div class="feedback-incorrect">
                        <h3>Tiempo agotado ⏰</h3>
                        <p>No respondiste a tiempo</p>
                        <p>Puntuación total: ${gameState.currentScore}</p>
                    </div>
                `;
                feedback.classList.add('show');
            }
            return;
        }
        
        timeLeft--;
        setTimeout(updateTimer, 1000);
    };
    
    // Resetear estado del timer
    timerCircle.classList.remove('warning');
    updateTimer();
}

function showQuestionResults(data) {
    // Mostrar respuesta correcta
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        if (index === data.correct) {
            option.classList.add('correct');
        }
        option.classList.add('disabled');
    });
    
    // Mostrar explicación y leaderboard
    document.getElementById('question-explanation').innerHTML = `
        <h3>Respuesta correcta:</h3>
        <p>${data.explanation}</p>
    `;
    
    updateLeaderboard(data.leaderboard, 'leaderboard-list');
    
    showScreen('results-screen');
    
    // Auto-avanzar después de 5 segundos
    setTimeout(() => {
        showScreen('waiting-screen');
    }, 4500);
}

function showFinalResults(data) {
    updateLeaderboard(data.leaderboard, 'final-leaderboard-list');
    showScreen('final-screen');
    
    // Mostrar posición del jugador
    const playerPosition = data.leaderboard.findIndex(player => player.id === gameState.playerId) + 1;
    if (playerPosition > 0) {
        showNotification(`¡Terminaste en la posición ${playerPosition}!`, 'info');
    }
}

function updateLeaderboard(leaderboard, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    leaderboard.slice(0, 10).forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'first';
        else if (rank === 2) rankClass = 'second';
        else if (rank === 3) rankClass = 'third';
        
        // Destacar al jugador actual
        const isCurrentPlayer = player.id === gameState.playerId;
        if (isCurrentPlayer) {
            item.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            item.style.color = 'white';
        }
        
        item.innerHTML = `
            <span class="leaderboard-rank ${rankClass}">${rank}</span>
            <div class="leaderboard-player">
                <span class="leaderboard-avatar">${player.avatar || '🏎️'}</span>
                <span class="leaderboard-name">${player.name}${isCurrentPlayer ? ' (Tú)' : ''}</span>
            </div>
            <span class="leaderboard-score">${player.score}</span>
        `;
        
        container.appendChild(item);
    });
}

function showWinnerCoupon(data) {
    document.getElementById('coupon-code').textContent = data.couponCode;
    document.getElementById('coupon-expiry').textContent = data.validUntil;
    
    document.getElementById('winner-screen').classList.add('show');
    
    showNotification('¡FELICIDADES! ¡ERES EL GANADOR!', 'success');
}

function downloadCoupon() {
    const couponCode = document.getElementById('coupon-code').textContent;
    const expiryDate = document.getElementById('coupon-expiry').textContent;
    
    // Crear contenido del cupón
    const couponContent = `
CUPÓN DE PREMIO - TRIVIA GENERAL MOTORS
=======================================

🏆 ¡FELICIDADES! ¡ERES EL GANADOR! 🏆

Premio: HUMMER EV
Código de cupón: ${couponCode}
Válido hasta: ${expiryDate}

*Sujeto a términos y condiciones
*Presentar este cupón en concesionario autorizado GM

General Motors - Trivia Champion
Generado el: ${new Date().toLocaleDateString()}
    `.trim();
    
    // Crear y descargar archivo
    const blob = new Blob([couponContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GM-Trivia-Winner-Coupon-${couponCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Cupón descargado exitosamente', 'success');
}

function showScreen(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar pantalla solicitada
    document.getElementById(screenId).classList.add('active');
}

function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Agregar estilos inline si no existen
    if (!document.querySelector('.notification-styles')) {
        const styles = document.createElement('style');
        styles.className = 'notification-styles';
        styles.textContent = `
            .notification {
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
            }
            
            .notification-success {
                background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            }
            
            .notification-error {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            }
            
            .notification-info {
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            }
            
            .notification button {
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
            
            @media (max-width: 480px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    min-width: auto;
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

// Funciones de utilidad
function formatTime(seconds) {
    return seconds.toString().padStart(2, '0');
}

function formatScore(score) {
    return score.toLocaleString();
}

// Manejo de errores globales
window.addEventListener('error', function(event) {
    console.error('Error:', event.error);
    showNotification('Ocurrió un error. Por favor recarga la página.', 'error');
});

// Reconexión automática
socket.on('reconnect', () => {
    showNotification('Reconectado al servidor', 'success');
    location.reload(); // Recargar para sincronizar estado
});
