import React from 'react';
import { X, Printer, Download, User, MapPin, Phone, Briefcase, Zap, Calendar, Wrench, Layers, CheckCircle2, History, ShieldCheck, Mail, FileText, Wifi, Lock, Globe, Router } from 'lucide-react';

const ComprehensiveDetailModal = ({ isOpen, onClose, data, type, onPrint, onSave, clientes }) => {
    if (!isOpen || !data) return null;

    const isTask = type === 'task';

    const getClientInfo = () => {
        if (!isTask || !clientes) return { nombre: 'N/A' };
        return (clientes || []).find(c => String(c.id) === String(data.cliente_id)) || { nombre: 'N/A' };
    };

    const clientInfo = getClientInfo();

    // Helper: renders a labeled data row
    const InfoRow = ({ icon, label, value, mono = false, hide = false }) => {
        if (hide || !value) return null;
        return (
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500 mt-0.5">
                    {icon}
                </div>
                <div className="text-left flex-1 min-w-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none mb-0.5">{label}</p>
                    <p className={`text-xs font-black text-slate-700 dark:text-slate-200 uppercase italic break-words ${mono ? 'font-mono tracking-widest text-emerald-600 dark:text-emerald-400' : ''}`}>{value}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose}></div>
            
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-white/10 animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="bg-logo-gradient p-6 text-white relative shrink-0">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
                            {isTask ? <FileText size={24}/> : <User size={24}/>}
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight italic leading-tight">
                                {isTask ? (data.titulo || 'Detalle de Tarea') : `${data.nombre} ${data.apellidos || ''}`}
                            </h2>
                            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em] italic text-left">
                                {isTask ? `Documento Operativo: ${data.ticket_id}` : `Perfil de Cliente: ${data.cedula || data.identificacion}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 dark:bg-slate-950/20">
                    {isTask ? (
                        /* TICKET VIEW */
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Tipo de Servicio</p>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-600">
                                                {data.servicio_tipo === 'Internet' ? <Zap size={14}/> : <Wrench size={14}/>}
                                            </div>
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase italic">{data.servicio_tipo || 'General'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Estado Actual</p>
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase italic ${data.estado === 'Completada' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {data.estado}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6 py-2">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Fecha Programada</p>
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                            <Calendar size={14} className="text-orange-500"/>
                                            <span className="text-xs font-bold">{data.fecha_programada || 'No definida'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Costo de Operación</p>
                                        <span className="text-sm font-black text-emerald-600 font-mono">${data.monto || '0.00'}</span>
                                    </div>
                                </div>
                            </div>

                            {clientInfo && (
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Cliente Asignado</p>
                                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase italic">{clientInfo.nombre} {clientInfo.apellidos || ''}</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 italic">Especificaciones Técnicas</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { label: 'Equipos Asignados', items: data.equipos, icon: <Layers size={14}/>, color: 'text-blue-500' },
                                        { label: 'Materiales Consumibles', items: data.materiales, icon: <CheckCircle2 size={14}/>, color: 'text-emerald-500' },
                                        { label: 'Herramientas de Campo', items: data.herramientas, icon: <Wrench size={14}/>, color: 'text-orange-500' }
                                    ].map((sec, i) => (
                                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={sec.color}>{sec.icon}</div>
                                                <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider italic">{sec.label}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(sec.items || []).length > 0 ? (sec.items || []).map((it, idx) => (
                                                    <span key={idx} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-[8px] font-bold text-slate-600 dark:text-slate-400 rounded-full border border-slate-100 dark:border-slate-700 uppercase italic">
                                                        {it}
                                                    </span>
                                                )) : <span className="text-[8px] text-slate-300 italic uppercase">Ninguno registrado</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 dark:bg-black/40 p-5 rounded-3xl border border-white/5 space-y-2">
                                <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest italic">Alcance de la Operación</p>
                                <p className="text-xs text-white/80 leading-relaxed font-bold italic">
                                    {data.descripcion || 'Sin descripción detallada.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* CLIENT CV STYLE */
                        <div className="space-y-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center py-4">
                                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-2 border-orange-500/20 p-4 mb-4 transform -rotate-3 transition-transform hover:rotate-0 relative">
                                    <img src="/logo.png" alt="Profile" className="w-full h-full object-contain opacity-20 grayscale brightness-50" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                         <User size={32} className="text-orange-500" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase italic tracking-tighter text-center">
                                    {data.nombre} {data.apellidos || ''}
                                </h3>
                                <p className="text-[10px] font-black text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-4 py-1 rounded-full uppercase tracking-widest mt-1 italic">
                                    {data.clasificacion || 'Persona Natural'}
                                </p>
                            </div>

                            {/* Datos de Contacto */}
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                                <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.3em] italic mb-1">Datos de Contacto</p>
                                <InfoRow icon={<Phone size={16}/>} label="Línea de Contacto" value={data.telefono} mono />
                                <InfoRow icon={<MapPin size={16}/>} label="Punto de Despliegue" value={data.direccion} />
                                <InfoRow icon={<History size={16}/>} label="Identificación Fiscal" value={data.cedula || data.identificacion} />
                                <InfoRow icon={<Mail size={16}/>} label="Correo Electrónico" value={data.correo} hide={!data.correo} />
                                <InfoRow icon={<Globe size={16}/>} label="Coordenadas GPS" value={data.coordenadas} mono hide={!data.coordenadas} />
                            </div>

                            {/* Ficha Técnica de Equipo */}
                            {(data.antena_tipo || data.antena_modelo || data.router_modelo || data.antena_ip) && (
                                <div className="space-y-3">
                                    {/* Antena */}
                                    {(data.antena_tipo || data.antena_modelo) && (
                                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm space-y-3">
                                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.3em] italic flex items-center gap-2">
                                                <Wifi size={12}/> Información de Antena
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {data.antena_tipo && <div><p className="text-[7px] text-slate-400 font-black uppercase italic">Tipo</p><p className="text-[10px] font-black text-slate-700 dark:text-white uppercase italic">{data.antena_tipo}</p></div>}
                                                {data.antena_marca && <div><p className="text-[7px] text-slate-400 font-black uppercase italic">Marca</p><p className="text-[10px] font-black text-slate-700 dark:text-white uppercase italic">{data.antena_marca}</p></div>}
                                                {data.antena_modelo && <div><p className="text-[7px] text-slate-400 font-black uppercase italic">Modelo</p><p className="text-[10px] font-black text-slate-700 dark:text-white uppercase italic">{data.antena_modelo}</p></div>}
                                                {data.antena_serial && <div><p className="text-[7px] text-slate-400 font-black uppercase italic">Serial</p><p className="text-[10px] font-black text-slate-700 dark:text-white uppercase italic font-mono">{data.antena_serial}</p></div>}
                                                {data.antena_usuario && <div><p className="text-[7px] text-slate-400 font-black uppercase italic">Usuario</p><p className="text-[10px] font-black text-slate-700 dark:text-white uppercase italic font-mono">{data.antena_usuario}</p></div>}
                                                {data.antena_password && <div><p className="text-[7px] text-slate-400 font-black uppercase italic">Password</p><p className="text-[10px] font-black text-slate-700 dark:text-white uppercase italic font-mono">{data.antena_password}</p></div>}
                                            </div>
                                            {data.antena_ip && (
                                                <div className="mt-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-between">
                                                    <p className="text-[8px] font-black text-emerald-600 uppercase italic">IP Antena</p>
                                                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-widest">{data.antena_ip}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Router */}
                                    {(data.router_modelo || data.router_tipo || data.puerto_forward) && (
                                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-fuchsia-100 dark:border-fuchsia-500/20 shadow-sm space-y-3">
                                            <p className="text-[8px] font-black text-fuchsia-600 uppercase tracking-[0.3em] italic flex items-center gap-2">
                                                <Wrench size={12}/> Información de Router
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {data.router_modelo && <div><p className="text-[7px] text-slate-400 font-black uppercase italic">Modelo</p><p className="text-[10px] font-black text-slate-700 dark:text-white uppercase italic">{data.router_modelo}</p></div>}
                                                {data.router_tipo && <div><p className="text-[7px] text-slate-400 font-black uppercase italic">Tipo</p><p className="text-[10px] font-black text-slate-700 dark:text-white uppercase italic">{data.router_tipo}</p></div>}
                                                {data.router_version && <div><p className="text-[7px] text-slate-400 font-black uppercase italic">Versión</p><p className="text-[10px] font-black text-slate-700 dark:text-white uppercase italic">{data.router_version}</p></div>}
                                                {data.puerto_forward && <div><p className="text-[7px] text-slate-400 font-black uppercase italic">Puerto Forward</p><p className="text-[10px] font-black text-fuchsia-600 dark:text-fuchsia-400 uppercase italic font-mono">{data.puerto_forward}</p></div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Servicio */}
                                    {data.servicio_requerido && (
                                        <div className="bg-orange-50 dark:bg-orange-500/5 px-4 py-3 rounded-2xl border border-orange-100 dark:border-orange-500/20 flex justify-between items-center">
                                            <p className="text-[8px] font-black text-orange-600 uppercase italic">Servicio Registrado</p>
                                            <p className="text-xs font-black text-orange-700 dark:text-orange-400 uppercase italic">{data.servicio_requerido}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Historial Operativo */}
                            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                                        <ShieldCheck size={14} className="text-orange-500"/> Historial Operativo
                                    </h4>
                                    <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded-full font-black italic uppercase">Verificado</span>
                                </div>
                                <div className="space-y-3 opacity-80">
                                    <div className="border-l-2 border-orange-500 pl-4 py-1 text-left">
                                        <p className="text-[10px] font-black uppercase italic">Estado Maestro</p>
                                        <p className="text-[8px] font-bold text-slate-400">Cliente activo en base de datos</p>
                                    </div>
                                    <p className="text-[9px] leading-relaxed font-medium italic text-left">
                                        Este perfil cuenta con respaldo auditado en la red local. Se recomienda verificación de datos cada 6 meses.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex gap-3 shrink-0">
                    <button 
                        onClick={() => onPrint?.(data)}
                        className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 italic"
                    >
                        <Printer size={16}/> Imprimir Ficha
                    </button>
                    <button 
                        onClick={() => onSave?.(data, clientInfo)}
                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 italic"
                    >
                        <Download size={16}/> Guardar Digital
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComprehensiveDetailModal;
