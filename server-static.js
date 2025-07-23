const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123GM';

console.log('🚀 Starting Trivia GM Server (Static Version)...');
console.log('📊 PORT:', PORT);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Game data for static version
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
    }
    // Más preguntas aquí...
];

// Rutas básicas
app.get('/', (req, res) => {
    console.log('📄 GET / request received');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
    console.log('❤️ GET /health request received');
    res.json({ 
        status: 'OK', 
        message: 'Trivia GM Server is running', 
        timestamp: new Date().toISOString(),
        version: 'static'
    });
});

app.get('/admin', (req, res) => {
    console.log('⚙️ GET /admin request received');
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API para obtener preguntas
app.get('/api/questions', (req, res) => {
    res.json(questions);
});

// Verificación de contraseña para admin
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    console.log('🔐 Admin login attempt');
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', (error) => {
    if (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
    console.log(`🎮 Trivia GM Server running on port ${PORT}`);
    console.log(`🌐 Players: http://localhost:${PORT}`);
    console.log(`⚙️ Admin: http://localhost:${PORT}/admin`);
    console.log(`❤️ Health: http://localhost:${PORT}/health`);
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
    });
});
