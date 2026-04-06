const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Base de Datos
const dbPath = path.resolve(__dirname, '../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

// Crear todas las tablas necesarias si no existen
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, cedula TEXT, telefono TEXT, direccion TEXT, status TEXT DEFAULT 'Activo')`);
    db.run(`CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, descripcion TEXT, cliente_id INTEGER, tecnico_id INTEGER, estado TEXT DEFAULT 'Pendiente')`);
    db.run(`CREATE TABLE IF NOT EXISTS technicians (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, status TEXT DEFAULT 'Activo')`);
});

// --- IMPORTACIÓN DE RUTAS ---
const clientesRoutes = require('./routes/clientes');
const tareasRoutes = require('./routes/tareas');
const tecnicosRoutes = require('./routes/tecnicos');
const authRoutes = require('./routes/auth');

// --- ACTIVACIÓN DE RUTAS ---
app.use('/api/customers', clientesRoutes);
app.use('/api/tasks', tareasRoutes);
app.use('/api/technicians', tecnicosRoutes);
app.use('/api/auth', authRoutes);

const PORT = 5000;
server.listen(PORT, () => {
    console.log('-----------------------------------------');
    console.log('🚀 MOTOR RED ENNIER V2 - FULL CONECTADO');
    console.log('📦 Menús cargados: Clientes, Tareas, Técnicos, Auth');
    console.log('-----------------------------------------');
});