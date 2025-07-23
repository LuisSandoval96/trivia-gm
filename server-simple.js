const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

console.log('Starting simple server...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

app.get('/', (req, res) => {
    console.log('GET / request received');
    res.send('Hello World! Trivia GM Server is running!');
});

app.get('/health', (req, res) => {
    console.log('GET /health request received');
    res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Simple server running on port ${PORT}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
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
