const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data/red_ennier.sqlite');

// Asegurar que la carpeta data exista
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const db = new sqlite3.Database(dbPath);

console.log('--- RESETEANDO BASE DE DATOS RED ENNIER ---');

db.serialize(() => {
    // ELIMINAR TABLAS ANTIGUAS
    db.run("DROP TABLE IF EXISTS customers");
    db.run("DROP TABLE IF EXISTS technicians");
    db.run("DROP TABLE IF EXISTS tasks");
    db.run("DROP TABLE IF EXISTS services");

    // CREAR TABLA CLIENTES
    db.run(`CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        cedula TEXT,
        telefono TEXT,
        direccion TEXT,
        status TEXT DEFAULT 'Activo'
    )`);

    // CREAR TABLA TÉCNICOS
    db.run(`CREATE TABLE technicians (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        especialidad TEXT,
        telefono TEXT,
        status TEXT DEFAULT 'Activo'
    )`);

    // CREAR TABLA TAREAS
    db.run(`CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        cliente_id INTEGER,
        tecnico_id INTEGER,
        estado TEXT DEFAULT 'Pendiente',
        FOREIGN KEY(cliente_id) REFERENCES customers(id),
        FOREIGN KEY(tecnico_id) REFERENCES technicians(id)
    )`);

    // CREAR TABLA SERVICIOS
    db.run(`CREATE TABLE services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL DEFAULT 0
    )`);

    console.log('✅ Esquemas reconstruidos con éxito');
    
    // INSERTAR DATOS INICIALES (OPCIONAL PERO ÚTIL)
    db.run(`INSERT INTO customers (nombre, cedula, telefono, direccion) VALUES ('Cliente Premium Prueba', 'V-000000', '000-000', 'Calle Central')`);
    db.run(`INSERT INTO technicians (nombre, especialidad, telefono) VALUES ('Admin Técnico', 'Sistemas', '000-000')`);
    
    console.log('✅ Datos iniciales cargados');
});

db.close(() => {
    console.log('--- PROCESO FINALIZADO ---');
});
