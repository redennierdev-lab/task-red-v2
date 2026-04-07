import React, { useState, useContext, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Send, Layers, User, Wrench, ShieldCheck, FileText, CheckCircle2, CircleDashed } from 'lucide-react';
import { db, logAction } from '../db/db';
import { AppContext } from '../context/AppContext';

const TareaWizard = ({ isOpen, setIsOpen, editingId, setEditingId }) => {
    const { refreshAll, clientes, tecnicos } = useContext(AppContext);
    const [step, setStep] = useState(1);
    
    // Form State
    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        estado: 'Pendiente',
        cliente_id: '',
        tecnico_admin_id: '',
        instalador_id: ''
    });

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
            instalador_id: ''
        });
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(resetFlow, 500);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        try {
            if (editingId) {
                await db.tasks.update(editingId, form);
                await logAction('Admin', 'EDICIÓN', 'Tasks', editingId, `Ticket actualizado: ${form.titulo}`);
            } else {
                const id = await db.tasks.add({
                    ...form,
                    ticket_id: `TSK-${Date.now().toString().slice(-6)}`,
                    fecha_creacion: new Date().toISOString()
                });
                await logAction('Admin', 'CREACIÓN', 'Tasks', id, `Ticket generado: ${form.titulo}`);
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
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh] border border-white/20 transition-colors">
                
                {/* Header Area */}
                <div className="bg-logo-gradient p-8 text-white relative shrink-0">
                    <button onClick={handleClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">
                                {editingId ? 'Ajustar Ticket' : 'Despliegue Operativo'}
                            </h2>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] italic">Secuencia de Trabajo RED</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    
                    {/* Step 1: Objetivo */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Objetivo & Cliente</h3>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                    <User size={10}/> Cliente Asignado
                                </label>
                                <select 
                                    required 
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none shadow-inner"
                                    value={form.cliente_id}
                                    onChange={e => setForm({...form, cliente_id: e.target.value})}
                                >
                                    <option value="">Seleccionar Cliente Objetivo...</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre} {c.apellidos} ({c.cedula})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                    <FileText size={10}/> Asunto del Ticket
                                </label>
                                <input 
                                    required 
                                    placeholder="Ej: Instalación Antena sector Norte"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-inner"
                                    value={form.titulo}
                                    onChange={e => setForm({...form, titulo: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Hoja de Trabajo */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Información Técnica</h3>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Descripción de Alcance</label>
                                <textarea 
                                    rows="6"
                                    placeholder="Detalles sobre materiales, equipos a usar, configuración IP..."
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none resize-none shadow-inner italic"
                                    value={form.descripcion}
                                    onChange={e => setForm({...form, descripcion: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1.5 pt-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Estado del Ticket</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Pendiente', 'En proceso', 'Completada'].map(est => (
                                        <button
                                            key={est}
                                            type="button"
                                            onClick={() => setForm({...form, estado: est})}
                                            className={`py-3 rounded-full border-2 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${form.estado === est ? 'bg-slate-900 dark:bg-fuchsia-600 border-slate-900 dark:border-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20' : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600'}`}
                                        >
                                            {est === 'Pendiente' ? <CircleDashed size={10} /> : <CheckCircle2 size={10} />}
                                            {est}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Staff */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Asignación de Personal</h3>
                            
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                        <ShieldCheck size={10} className="text-fuchsia-500"/> Supervisor Administrativo
                                    </label>
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none shadow-inner"
                                        value={form.tecnico_admin_id}
                                        onChange={e => setForm({...form, tecnico_admin_id: e.target.value})}
                                    >
                                        <option value="">Seleccionar Supervisor...</option>
                                        {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                        <Wrench size={10} className="text-orange-500"/> Instalador en Campo
                                    </label>
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none shadow-inner"
                                        value={form.instalador_id}
                                        onChange={e => setForm({...form, instalador_id: e.target.value})}
                                    >
                                        <option value="">Seleccionar Instalador...</option>
                                        {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
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
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center shrink-0 border-t border-slate-200 dark:border-slate-800 rounded-b-[2.5rem] transition-colors">
                    <button 
                        type="button"
                        onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                        className="px-6 py-3 font-bold text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all italic"
                    >
                        {step === 1 ? 'Cancelar' : <><ArrowLeft size={14}/> Atrás</>}
                    </button>
                    
                    {step < 3 ? (
                        <button 
                            type="button" 
                            disabled={step === 1 && (!form.cliente_id || !form.titulo)}
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
                </div>
            </div>
        </div>
    );
};

export default TareaWizard;
