const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// IMPORTACIÓN DE RUTAS
// Asegúrate de que los archivos existan en backend/routes/
const clientesRoutes = require('./routes/clientes');
const tecnicosRoutes = require('./routes/tecnicos');
const tareasRoutes = require('./routes/tareas');
const serviciosRoutes = require('./routes/servicios');
const logsRoutes = require('./routes/logs').router;
const statusRoutes = require('./routes/status');

// CONEXIÓN DE RUTAS
app.use('/api/customers', clientesRoutes);
app.use('/api/technicians', tecnicosRoutes);
app.use('/api/tasks', tareasRoutes);
app.use('/api/services', serviciosRoutes);
app.use('/api/audit', logsRoutes);
app.use('/api/status', statusRoutes);

app.get('/', (req, res) => {
    res.send('Servidor RED ENNIER Operativo');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log('====================================');
    console.log('🚀 MOTOR RED ENNIER V2 ACTIVO');
    console.log('✅ RUTA CLIENTES: /api/customers');
    console.log('✅ RUTA TÉCNICOS: /api/technicians');
    console.log('✅ RUTA TAREAS: /api/tasks');
    console.log('====================================');
});