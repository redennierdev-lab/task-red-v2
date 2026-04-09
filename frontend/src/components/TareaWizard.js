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
        instalador_id: '',
        monto: ''
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
            instalador_id: '',
            monto: ''
        });
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
                await db.tasks.update(editingId, finalData);
                await logAction('Admin', 'EDICIÓN', 'Tasks', editingId, `Ticket actualizado: ${form.titulo}`);
            } else {
                const id = await db.tasks.add({
                    ...finalData,
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
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                    
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
                                    className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none shadow-inner text-sm italic"
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
                                    className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-inner text-sm"
                                    value={form.titulo}
                                    onChange={e => setForm({...form, titulo: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Hoja de Trabajo */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Información Técnica & Comercial</h3>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Descripción de Alcance</label>
                                <textarea 
                                    rows="4"
                                    placeholder="Detalles sobre materiales, equipos a usar, configuración IP..."
                                    className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[1.2rem] focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none resize-none shadow-inner text-sm italic"
                                    value={form.descripcion}
                                    onChange={e => setForm({...form, descripcion: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Remuneración ($)</label>
                                    <input 
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 transition-all font-black text-slate-700 dark:text-slate-200 outline-none shadow-inner text-sm italic"
                                        value={form.monto}
                                        onChange={e => setForm({...form, monto: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Estado Inicial</label>
                                    <select 
                                        className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none shadow-inner text-sm italic"
                                        value={form.estado}
                                        onChange={e => setForm({...form, estado: e.target.value})}
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En proceso">En proceso</option>
                                        <option value="Completada">Completada</option>
                                    </select>
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
                                        className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none shadow-inner text-sm italic"
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
                                        className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none shadow-inner text-sm italic"
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
                <div className="p-5 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center shrink-0 border-t border-slate-200 dark:border-slate-800 rounded-b-3xl transition-colors">
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
