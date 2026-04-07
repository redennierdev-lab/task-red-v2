const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data/red_ennier.sqlite');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const db = new sqlite3.Database(dbPath);

console.log('--- RESETEANDO BASE DE DATOS E INYECTANDO ESQUEMAS V3 ---');

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS customers");
    db.run("DROP TABLE IF EXISTS technicians");
    db.run("DROP TABLE IF EXISTS tasks");
    db.run("DROP TABLE IF EXISTS services");
    db.run("DROP TABLE IF EXISTS client_equipments");

    db.run(`CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellidos TEXT,
        cedula TEXT,
        tipo TEXT,
        clasificacion TEXT,
        correo TEXT,
        telefono TEXT,
        whatsapp TEXT,
        direccion TEXT,
        coordenadas TEXT,
        status TEXT DEFAULT 'Activo'
    )`);

    db.run(`CREATE TABLE client_equipments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        servicio_requerido TEXT,
        tipo_instalacion TEXT,
        antena_tipo TEXT,
        antena_modelo TEXT,
        antena_marca TEXT,
        antena_serial TEXT,
        antena_usuario TEXT,
        antena_password TEXT,
        antena_ip TEXT,
        puerto_forward TEXT,
        router_modelo TEXT,
        router_tipo TEXT,
        router_version TEXT,
        FOREIGN KEY(cliente_id) REFERENCES customers(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE technicians (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        especialidad TEXT,
        telefono TEXT,
        status TEXT DEFAULT 'Activo'
    )`);

    db.run(`CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT UNIQUE,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        cliente_id INTEGER,
        tecnico_admin_id INTEGER,
        instalador_id INTEGER,
        estado TEXT DEFAULT 'Pendiente',
        FOREIGN KEY(cliente_id) REFERENCES customers(id),
        FOREIGN KEY(tecnico_admin_id) REFERENCES technicians(id),
        FOREIGN KEY(instalador_id) REFERENCES technicians(id)
    )`);

    db.run(`CREATE TABLE services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL DEFAULT 0,
        cobro_por_punto BOOLEAN DEFAULT 0
    )`);

    console.log('✅ Nuevos esquemas construidos (Customers V3, ClientEquipments, Tareas V3)');
    
    // Default system users
    db.run(`INSERT INTO technicians (nombre, especialidad, telefono) VALUES ('Carlos Romero', 'Sistemas / Instalaciones', '000-000')`);
    
    // Seed requested services based on user specs
    db.run(`INSERT INTO services (nombre, descripcion, precio, cobro_por_punto) VALUES ('Cámaras de Seguridad (Por Punto)', 'Instalación mano de obra de cámaras / DVR', 20.0, 1)`);
    db.run(`INSERT INTO services (nombre, descripcion, precio, cobro_por_punto) VALUES ('Internet - Alquiler de Equipo', 'Instalación de antena subarrendada', 70.0, 0)`);
    db.run(`INSERT INTO services (nombre, descripcion, precio, cobro_por_punto) VALUES ('Internet - Equipo Nuevo', 'Instalación con antena y router nuevos', 250.0, 0)`);
    db.run(`INSERT INTO services (nombre, descripcion, precio, cobro_por_punto) VALUES ('Internet - ABCB 7', 'Tecnología ABCB V7 (Antena)', 180.0, 0)`);
    
    console.log('✅ Catálogo de Servicios Inicial V3 cargado');
});

db.close(() => {
    console.log('--- PROCESO FINALIZADO ---');
});
