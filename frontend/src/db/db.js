import Dexie from 'dexie';

export const db = new Dexie('RedEnnierDB');

db.version(1).stores({
    customers: '++id, nombre, apellidos, cedula, tipo, clasificacion, correo, telefono, whatsapp, direccion, coordenadas, status',
    client_equipments: '++id, cliente_id, servicio_requerido, tipo_instalacion, antena_ip',
    technicians: '++id, nombre, especialidad, telefono, status',
    services: '++id, nombre, descripcion, precio',
    tasks: '++id, ticket_id, titulo, descripcion, cliente_id, tecnico_admin_id, instalador_id, estado, started_at',
    audit_logs: '++id, usuario, accion, tabla, registro_id, detalle, timestamp',
    expenses: '++id, categoria, subcategoria, producto_nombre, marca, modelo, tipo, monto, metodo_pago, fecha, hora, descripcion'
});

export const logAction = async (usuario, accion, tabla, registro_id, detalle) => {
    await db.audit_logs.add({
        usuario,
        accion,
        tabla,
        registro_id: String(registro_id),
        detalle,
        timestamp: new Date().toISOString()
    });
};

export const exportData = async () => {
    const data = {
        meta: {
            app: 'RedEnnierTask',
            version: '2.0-Offline',
            export_at: new Date().toISOString()
        },
        payload: {}
    };

    const tables = ['customers', 'client_equipments', 'technicians', 'services', 'tasks', 'audit_logs', 'expenses'];
    for (const table of tables) {
        data.payload[table] = await db[table].toArray();
    }

    return data;
};
