const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? false : "*",
        methods: ["GET", "POST"]
    }
});

// Configuración
const PORT = process.env.PORT || 3002;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123GM';

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Variables globales para el juego
let gameState = {
    isActive: false,
    currentQuestion: 0,
    players: new Map(),
    scores: new Map(),
    gameId: null,
    questionStartTime: null,
    answers: new Map() // Para almacenar respuestas de la pregunta actual
};

// Preguntas sobre General Motors (15 preguntas)
const questions = [
    {
        question: "¿En qué año fue fundada General Motors?",
        options: ["1906", "1908", "1910", "1912"],
        correct: 1,
        explanation: "General Motors fue fundada el 16 de septiembre de 1908 por William C. Durant."
    },
    {
        question: "¿Quién fue el fundador de General Motors?",
        options: ["Henry Ford", "William C. Durant", "Walter Chrysler", "David Buick"],
        correct: 1,
        explanation: "William C. Durant fundó General Motors en 1908, consolidando varias marcas automotrices."
    },
    {
        question: "¿Cuál fue la primera marca adquirida por GM?",
        options: ["Chevrolet", "Buick", "Cadillac", "Oldsmobile"],
        correct: 1,
        explanation: "Buick fue la primera marca que Durant incorporó a General Motors en 1908."
    },
    {
        question: "¿En qué año comenzó GM a producir automóviles en México?",
        options: ["1935", "1937", "1940", "1942"],
        correct: 1,
        explanation: "GM comenzó operaciones en México en 1937 con una planta de ensamblaje en la Ciudad de México."
    },
    {
        question: "¿Cuál es el modelo más vendido de Chevrolet en la historia?",
        options: ["Corvette", "Camaro", "Impala", "Malibu"],
        correct: 2,
        explanation: "El Chevrolet Impala es uno de los modelos más vendidos en la historia de la marca."
    },
    {
        question: "¿En qué ciudad mexicana se encuentra la planta más importante de GM?",
        options: ["Tijuana", "Ramos Arizpe", "Silao", "Toluca"],
        correct: 2,
        explanation: "La planta de Silao, Guanajuato, es una de las más importantes de GM en México."
    },
    {
        question: "¿Qué significa las siglas GMC?",
        options: ["General Motors Company", "General Motors Corporation", "General Motors Commercial", "General Motors Chevrolet"],
        correct: 1,
        explanation: "GMC originalmente significaba General Motors Corporation, ahora General Motors Company."
    },
    {
        question: "¿En qué década GM se convirtió en la empresa automotriz más grande del mundo?",
        options: ["1920s", "1930s", "1940s", "1950s"],
        correct: 0,
        explanation: "En la década de 1920, GM superó a Ford como la empresa automotriz más grande del mundo."
    },
    {
        question: "¿Cuál fue el primer auto eléctrico producido masivamente por GM?",
        options: ["Volt", "Bolt", "EV1", "Spark EV"],
        correct: 2,
        explanation: "El GM EV1 fue el primer auto eléctrico moderno producido masivamente, lanzado en 1996."
    },
    {
        question: "¿En qué año GM se declaró en bancarrota en Estados Unidos?",
        options: ["2008", "2009", "2010", "2011"],
        correct: 1,
        explanation: "GM se declaró en bancarrota el 1 de junio de 2009 durante la crisis financiera."
    },
    {
        question: "¿Cuál es la marca de lujo de General Motors?",
        options: ["Buick", "Cadillac", "GMC", "Chevrolet"],
        correct: 1,
        explanation: "Cadillac es la división de vehículos de lujo de General Motors desde 1909."
    },
    {
        question: "¿Qué modelo de GM fue el primer SUV eléctrico de la marca?",
        options: ["Equinox EV", "Blazer EV", "Hummer EV", "Tahoe EV"],
        correct: 2,
        explanation: "El Hummer EV fue el primer SUV totalmente eléctrico de GM, lanzado en 2021."
    },
    {
        question: "¿En cuántos países tiene presencia General Motors actualmente?",
        options: ["Más de 50", "Más de 75", "Más de 100", "Más de 125"],
        correct: 2,
        explanation: "General Motors tiene presencia en más de 100 países alrededor del mundo."
    },
    {
        question: "¿Cuál es el centro de investigación y desarrollo más importante de GM en México?",
        options: ["Centro Técnico GM México", "GM Innovation Center", "GM Research Lab México", "GM Tech Hub"],
        correct: 0,
        explanation: "El Centro Técnico GM México es el principal centro de I+D de la compañía en el país."
    },
    {
        question: "¿Qué plan estratégico anunció GM para ser carbono neutral?",
        options: ["GM Green 2030", "Carbon Zero 2035", "Ultium Future", "Zero Emissions 2040"],
        correct: 1,
        explanation: "GM anunció su plan de ser carbono neutral para 2035 con su estrategia de vehículos eléctricos."
    }
];

// Rutas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Verificación de contraseña para admin
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
});

app.get('/game/:gameId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// Socket.io eventos
io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Unirse como administrador
    socket.on('join-admin', (data) => {
        // Verificar contraseña si se proporciona
        if (process.env.NODE_ENV === 'production' && (!data || !data.password || data.password !== ADMIN_PASSWORD)) {
            socket.emit('admin-auth-required');
            return;
        }
        
        socket.join('admin');
        socket.emit('admin-connected', {
            players: Array.from(gameState.players.values()),
            gameState: {
                isActive: gameState.isActive,
                currentQuestion: gameState.currentQuestion,
                totalQuestions: questions.length
            }
        });
    });

    // Unirse como jugador
    socket.on('join-player', (data) => {
        const playerId = uuidv4();
        const player = {
            id: playerId,
            socketId: socket.id,
            name: data.name,
            score: 0,
            avatar: data.avatar || '😊'
        };

        gameState.players.set(playerId, player);
        gameState.scores.set(playerId, 0);
        
        socket.join('players');
        socket.playerId = playerId;
        
        socket.emit('player-joined', { playerId, player });
        
        // Notificar a admin
        io.to('admin').emit('player-joined', { player });
        
        // Si el juego está activo, enviar pregunta actual
        if (gameState.isActive && gameState.currentQuestion < questions.length) {
            socket.emit('question', {
                questionNumber: gameState.currentQuestion + 1,
                question: questions[gameState.currentQuestion].question,
                options: questions[gameState.currentQuestion].options,
                timeRemaining: getTimeRemaining()
            });
        }
    });

    // Iniciar juego (solo admin)
    socket.on('start-game', () => {
        if (gameState.players.size === 0) {
            socket.emit('error', 'No hay jugadores conectados');
            return;
        }

        gameState.isActive = true;
        gameState.currentQuestion = 0;
        gameState.gameId = uuidv4();
        gameState.answers.clear();
        
        // Resetear puntajes
        gameState.players.forEach(player => {
            player.score = 0;
            gameState.scores.set(player.id, 0);
        });

        startQuestion();
    });

    // Responder pregunta
    socket.on('answer', (data) => {
        if (!gameState.isActive || !socket.playerId) return;
        
        const playerId = socket.playerId;
        const player = gameState.players.get(playerId);
        
        if (!player || gameState.answers.has(playerId)) return;
        
        const timeElapsed = Date.now() - gameState.questionStartTime;
        const answer = {
            playerId,
            playerName: player.name,
            answerIndex: data.answerIndex,
            timeElapsed,
            isCorrect: data.answerIndex === questions[gameState.currentQuestion].correct
        };
        
        gameState.answers.set(playerId, answer);
        
        // Calcular puntos (más puntos por respuesta rápida y correcta)
        if (answer.isCorrect) {
            const maxTime = 30000; // 30 segundos
            const timeBonus = Math.max(0, (maxTime - timeElapsed) / 1000);
            const points = Math.round(1000 + (timeBonus * 10));
            
            player.score += points;
            gameState.scores.set(playerId, player.score);
            
            socket.emit('answer-result', {
                correct: true,
                points,
                totalScore: player.score
            });
        } else {
            socket.emit('answer-result', {
                correct: false,
                points: 0,
                totalScore: player.score
            });
        }
        
        // Notificar a admin
        io.to('admin').emit('player-answered', {
            playerName: player.name,
            isCorrect: answer.isCorrect,
            totalAnswers: gameState.answers.size,
            totalPlayers: gameState.players.size
        });
    });

    // Desconexión
    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
        
        if (socket.playerId) {
            const player = gameState.players.get(socket.playerId);
            if (player) {
                gameState.players.delete(socket.playerId);
                gameState.scores.delete(socket.playerId);
                gameState.answers.delete(socket.playerId);
                
                io.to('admin').emit('player-left', { player });
            }
        }
    });
});

// Funciones auxiliares
function startQuestion() {
    if (gameState.currentQuestion >= questions.length) {
        endGame();
        return;
    }

    gameState.questionStartTime = Date.now();
    gameState.answers.clear();
    
    const currentQ = questions[gameState.currentQuestion];
    
    // Enviar pregunta a jugadores
    io.to('players').emit('question', {
        questionNumber: gameState.currentQuestion + 1,
        question: currentQ.question,
        options: currentQ.options,
        timeRemaining: 30
    });
    
    // Enviar a admin
    io.to('admin').emit('question-started', {
        questionNumber: gameState.currentQuestion + 1,
        question: currentQ.question,
        options: currentQ.options
    });
    
    // Timer de 30 segundos
    setTimeout(() => {
        showResults();
    }, 30000);
}

function showResults() {
    const currentQ = questions[gameState.currentQuestion];
    const results = Array.from(gameState.answers.values());
    
    // Enviar resultados
    io.emit('question-results', {
        correct: currentQ.correct,
        explanation: currentQ.explanation,
        results: results,
        leaderboard: getLeaderboard()
    });
    
    // Siguiente pregunta después de 5 segundos
    setTimeout(() => {
        gameState.currentQuestion++;
        startQuestion();
    }, 5000);
}

function endGame() {
    gameState.isActive = false;
    const finalLeaderboard = getLeaderboard();
    const winner = finalLeaderboard[0];
    
    io.emit('game-ended', {
        leaderboard: finalLeaderboard,
        winner: winner
    });
    
    // Enviar cupón al ganador si existe
    if (winner) {
        const winnerSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.playerId === winner.id);
        
        if (winnerSocket) {
            winnerSocket.emit('winner-coupon', {
                couponCode: generateCouponCode(),
                message: '¡Felicidades! Has ganado una Hummer EV',
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
            });
        }
    }
}

function getLeaderboard() {
    return Array.from(gameState.players.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
}

function getTimeRemaining() {
    if (!gameState.questionStartTime) return 30;
    const elapsed = Date.now() - gameState.questionStartTime;
    return Math.max(0, Math.round((30000 - elapsed) / 1000));
}

function generateCouponCode() {
    return 'HUMMER-EV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT} para jugar`);
    console.log(`Accede a http://localhost:${PORT}/admin para administrar`);
});
/ /   S e r v e r   s t a b l e  
 