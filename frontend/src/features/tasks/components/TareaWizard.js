import React, { useState, useContext, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Send, Layers, User, Wrench, ShieldCheck, FileText, CheckCircle2, CircleDashed } from 'lucide-react';
import { db, logAction } from '../../../services/database';
import { AppContext } from '../../../context/AppContext';


const TareaWizard = ({ isOpen, setIsOpen, editingId, setEditingId }) => {
    const { refreshAll, clientes, tecnicos, addRecord, updateRecord } = useContext(AppContext);
    const [step, setStep] = useState(1);
    
    // Form State
    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        estado: 'Pendiente',
        cliente_id: '',
        tecnico_admin_id: '',
        instalador_id: '',
        monto: '',
        servicio_tipo: '',
        fecha_programada: '',
        equipos: [],
        materiales: [],
        herramientas: []
    });

    const [tempInputs, setTempInputs] = useState({ equipo: '', material: '', herramienta: '' });

    useEffect(() => {
        if (editingId) {
            const load = async () => {
                const data = await db.tasks.get(editingId);
                if (data) setForm(data);
            };
            load();
        }
    }, [editingId]);

    const resetFlow = () => {
        setStep(1);
        setEditingId?.(null);
        setForm({
            titulo: '',
            descripcion: '',
            estado: 'Pendiente',
            cliente_id: '',
            tecnico_admin_id: '',
            instalador_id: '',
            monto: '',
            servicio_tipo: '',
            fecha_programada: '',
            equipos: [],
            materiales: [],
            herramientas: []
        });
        setTempInputs({ equipo: '', material: '', herramienta: '' });
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(resetFlow, 500);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        try {
            const finalData = {
                ...form,
                monto: parseFloat(form.monto) || 0
            };

            if (editingId) {
                await updateRecord('tasks', editingId, finalData);
            } else {
                await addRecord('tasks', {
                    ...finalData,
                    ticket_id: `TSK-${Date.now().toString().slice(-6)}`,
                    fecha_creacion: new Date().toISOString()
                });
            }
            
            refreshAll();
            alert(`¡Ticket ${editingId ? 'actualizado' : 'desplegado'} con éxito!`);
            handleClose();
        } catch (error) {
            console.error('Error guardando ticket:', error);
            alert('Error al gestionar el ticket localmente.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={handleClose}></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh] border border-white/20 transition-colors">
                
                {/* Header Area */}
                <div className="bg-logo-gradient p-5 text-white relative shrink-0">
                    <button onClick={handleClose} className="absolute top-4 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
                        <X size={16} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                            <Layers size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight italic leading-tight">
                                {editingId ? 'Ajustar Ticket' : 'Despliegue Operativo'}
                            </h2>
                            <p className="text-white/70 text-[9px] font-bold uppercase tracking-[0.2em] italic">Secuencia de Trabajo RED</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-1.5 mt-4">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                    {/* Step 1: Identificación (Restaurado) */}
                    {(!editingId && step === 1) && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Identificación del Ticket</h3>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Título del Ticket / Servicio</label>
                                <input 
                                    type="text"
                                    placeholder="Ej. Soporte VIP..."
                                    className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 transition-all font-black text-slate-700 dark:text-slate-200 outline-none shadow-inner text-sm italic"
                                    value={form.titulo}
                                    onChange={e => setForm({...form, titulo: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                    <User size={10} className="text-orange-500"/> Selección de Cliente
                                </label>
                                <select 
                                    className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none shadow-inner text-sm italic"
                                    value={form.cliente_id}
                                    onChange={e => setForm({...form, cliente_id: e.target.value})}
                                >
                                    <option value="">Seleccionar Cliente...</option>
                                    {(clientes || []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>

                            <div className="bg-orange-500/5 p-4 rounded-3xl border border-orange-500/10">
                                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest leading-loose italic text-center">
                                    Complete los datos básicos para iniciar la secuencia operativa.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Tipo de Servicio */}
                    {(!editingId && step === 2) && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">¿Qué servicio requiere?</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { id: 'Internet', label: 'Acceso a Internet', icon: <ArrowRight className="text-emerald-500" />, color: 'emerald' },
                                    { id: 'Cámaras', label: 'Cámaras de Seguridad', icon: <ShieldCheck className="text-slate-500" />, color: 'slate' },
                                    { id: 'Soporte', label: 'Soporte Técnico', icon: <Wrench className="text-blue-500" />, color: 'blue' }
                                ].map(s => (
                                    <button 
                                        key={s.id}
                                        type="button"
                                        onClick={() => setForm({...form, servicio_tipo: s.id})}
                                        className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all group ${form.servicio_tipo === s.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                            {s.icon}
                                        </div>
                                        <span className={`font-black text-[10px] uppercase tracking-widest text-center italic ${form.servicio_tipo === s.id ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500'}`}>
                                            {s.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Hoja de Trabajo Avanzada */}
                    {(!editingId && step === 3) && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Información Técnica & Comercial</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Remuneración ($)</label>
                                    <input 
                                        type="number"
                                        className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 transition-all font-black text-slate-700 dark:text-slate-200 outline-none shadow-inner text-sm italic"
                                        value={form.monto}
                                        onChange={e => setForm({...form, monto: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Fecha Programada</label>
                                    <input 
                                        type="date"
                                        className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 transition-all font-black text-slate-700 dark:text-slate-200 outline-none shadow-inner text-sm italic"
                                        value={form.fecha_programada}
                                        onChange={e => setForm({...form, fecha_programada: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Listas Dinámicas */}
                            <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                                {['equipo', 'material', 'herramienta'].map(type => (
                                    <div key={type} className="space-y-2">
                                        <div className="flex items-center justify-between px-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 italic flex items-center gap-1.5">
                                                {type === 'equipo' ? <Layers size={10}/> : type === 'material' ? <CheckCircle2 size={10}/> : <Wrench size={10}/>}
                                                {type}s
                                            </label>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    if (tempInputs[type].trim()) {
                                                        const listKey = type + 's';
                                                        const currentList = Array.isArray(form[listKey]) ? form[listKey] : [];
                                                        setForm({...form, [listKey]: [...currentList, tempInputs[type].trim()]});
                                                        setTempInputs({...tempInputs, [type]: ''});
                                                    }
                                                }}
                                                className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <input 
                                            placeholder={`Agregar ${type}...`}
                                            className="w-full px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] italic font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-orange-500/30 transition-all"
                                            value={tempInputs[type]}
                                            onChange={e => setTempInputs({...tempInputs, [type]: e.target.value})}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (tempInputs[type].trim()) {
                                                        const listKey = type + 's';
                                                        const currentList = Array.isArray(form[listKey]) ? form[listKey] : [];
                                                        setForm({...form, [listKey]: [...currentList, tempInputs[type].trim()]});
                                                        setTempInputs({...tempInputs, [type]: ''});
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="flex flex-wrap gap-1 px-1">
                                            {(form[type + 's'] || []).map((item, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[8px] font-black uppercase rounded-lg border border-orange-100 dark:border-orange-900/50 flex items-center gap-1 italic">
                                                    {item}
                                                    <X size={8} className="cursor-pointer" onClick={() => {
                                                        const listKey = type + 's';
                                                        setForm({...form, [listKey]: (form[listKey] || []).filter((_, i) => i !== idx)});
                                                    }}/>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Detalles Adicionales / Alcance</label>
                                <textarea 
                                    rows="3"
                                    className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[1.2rem] focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none resize-none shadow-inner text-sm italic"
                                    value={form.descripcion}
                                    onChange={e => setForm({...form, descripcion: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Staff */}
                    {(!editingId && step === 4) && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Asignación de Personal</h3>
                            
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                        <ShieldCheck size={10} className="text-fuchsia-500"/> Supervisor Administrativo
                                    </label>
                                    <select 
                                        className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none shadow-inner text-sm italic"
                                        value={form.tecnico_admin_id}
                                        onChange={e => setForm({...form, tecnico_admin_id: e.target.value})}
                                    >
                                        <option value="">Seleccionar Supervisor...</option>
                                        {(tecnicos || []).map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                        <Wrench size={10} className="text-orange-500"/> Instalador en Campo
                                    </label>
                                    <select 
                                        className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none shadow-inner text-sm italic"
                                        value={form.instalador_id}
                                        onChange={e => setForm({...form, instalador_id: e.target.value})}
                                    >
                                        <option value="">Seleccionar Instalador...</option>
                                        {(tecnicos || []).map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-slate-900 dark:bg-black/60 p-5 rounded-[2rem] border border-white/10 mt-10 shadow-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-[10px]">!</div>
                                    <p className="text-[9px] font-black text-white uppercase tracking-widest italic">Confirmación de Despliegue</p>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed italic">
                                    Al procesar, los técnicos asignados recibirán el ticket en su centro de mando local. Asegúrese de tener los materiales cargados.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* View: Unified Edit Form (All fields in one page) */}
                    {editingId && (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-10">
                            {/* Sección 1: Identificación */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500"><FileText size={12}/></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Datos Principales</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-slate-400 pl-4 italic">Título</label>
                                        <input 
                                            type="text"
                                            className="w-full px-5 py-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none text-xs italic"
                                            value={form.titulo}
                                            onChange={e => setForm({...form, titulo: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase text-slate-400 pl-4 italic">Cliente</label>
                                            <select 
                                                className="w-full px-5 py-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none text-xs italic"
                                                value={form.cliente_id}
                                                onChange={e => setForm({...form, cliente_id: e.target.value})}
                                            >
                                                {(clientes || []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase text-slate-400 pl-4 italic">Tipo de Servicio</label>
                                            <select 
                                                className="w-full px-5 py-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none text-xs italic"
                                                value={form.servicio_tipo}
                                                onChange={e => setForm({...form, servicio_tipo: e.target.value})}
                                            >
                                                <option value="Internet">Internet</option>
                                                <option value="Cámaras">Cámaras</option>
                                                <option value="Soporte">Soporte</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección 2: Programación y Monto */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><CheckCircle2 size={12}/></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Programación & Costos</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-slate-400 pl-4 italic">Monto ($)</label>
                                        <input 
                                            type="number"
                                            className="w-full px-5 py-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none text-xs italic"
                                            value={form.monto}
                                            onChange={e => setForm({...form, monto: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-slate-400 pl-4 italic">Fecha</label>
                                        <input 
                                            type="date"
                                            className="w-full px-5 py-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none text-xs italic"
                                            value={form.fecha_programada}
                                            onChange={e => setForm({...form, fecha_programada: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sección 3: Staff Assignment */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <div className="w-6 h-6 rounded-lg bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500"><ShieldCheck size={12}/></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asignación de Staff</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-slate-400 pl-4 italic">Supervisor</label>
                                        <select 
                                            className="w-full px-5 py-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none text-xs italic"
                                            value={form.tecnico_admin_id}
                                            onChange={e => setForm({...form, tecnico_admin_id: e.target.value})}
                                        >
                                            {(tecnicos || []).map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-slate-400 pl-4 italic">Instalador</label>
                                        <select 
                                            className="w-full px-5 py-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none text-xs italic"
                                            value={form.instalador_id}
                                            onChange={e => setForm({...form, instalador_id: e.target.value})}
                                        >
                                            {(tecnicos || []).map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Sección 4: Descripción */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Layers size={12}/></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción del Trabajo</h4>
                                </div>
                                <textarea 
                                    rows="3"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-3xl font-bold text-slate-700 dark:text-slate-200 outline-none text-xs italic resize-none shadow-inner"
                                    value={form.descripcion}
                                    onChange={e => setForm({...form, descripcion: e.target.value})}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center shrink-0 border-t border-slate-200 dark:border-slate-800 rounded-b-3xl transition-colors">
                    {editingId ? (
                        <>
                            <button 
                                onClick={handleClose}
                                className="px-4 py-1.5 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-[8px] rounded-full hover:bg-slate-200/50 transition-all italic border border-slate-200 dark:border-slate-800"
                            >
                                CANCELAR
                            </button>
                            <button 
                                onClick={handleSubmit}
                                className="bg-orange-500 text-white shadow-lg shadow-orange-500/10 px-6 py-2 font-black uppercase tracking-widest text-[8px] rounded-full hover:bg-orange-600 transition-all active:scale-95 italic border border-orange-400"
                            >
                                GUARDAR
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                type="button"
                                onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                                className="px-6 py-3 font-bold text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all italic"
                            >
                                {step === 1 ? 'Cancelar' : <><ArrowLeft size={14}/> Atrás</>}
                            </button>
                            
                            {step < 4 ? (
                                <button 
                                    type="button" 
                                    disabled={(step === 1 && (!form.cliente_id || !form.titulo)) || (step === 2 && !form.servicio_tipo)}
                                    onClick={() => setStep(step + 1)} 
                                    className="bg-slate-900 dark:bg-fuchsia-600 text-white rounded-full px-8 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl hover:bg-slate-800 dark:hover:bg-fuchsia-700 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 italic"
                                >
                                    Siguiente <ArrowRight size={14}/>
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    disabled={!form.tecnico_admin_id || !form.instalador_id}
                                    onClick={handleSubmit} 
                                    className="btn-gradient shadow-orange-500/20 bg-orange-500 hover:shadow-orange-500/40 rounded-full px-10 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all active:scale-95 text-white"
                                >
                                    {editingId ? 'Actualizar Ticket' : 'Desplegar Secuencia'} <Send size={14}/>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TareaWizard;
