import React, { useState, useContext, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Send, Sparkles, FileText, DollarSign, Info, ShieldCheck } from 'lucide-react';
import { db, logAction } from '../db/db';
import { AppContext } from '../context/AppContext';

const ServicioWizard = ({ isOpen, setIsOpen, editingId, setEditingId }) => {
    const { refreshAll } = useContext(AppContext);
    const [step, setStep] = useState(1);
    
    // Form State
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: ''
    });

    useEffect(() => {
        if (editingId) {
            const load = async () => {
                const data = await db.services.get(editingId);
                if (data) setForm({ ...data, precio: String(data.precio) });
            };
            load();
        }
    }, [editingId]);

    const resetFlow = () => {
        setStep(1);
        setEditingId?.(null);
        setForm({
            nombre: '',
            descripcion: '',
            precio: ''
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
                precio: parseFloat(form.precio) || 0
            };

            if (editingId) {
                await db.services.update(editingId, finalData);
                await logAction('Admin', 'EDICIÓN', 'Services', editingId, `Servicio actualizado: ${form.nombre}`);
            } else {
                const id = await db.services.add(finalData);
                await logAction('Admin', 'CREACIÓN', 'Services', id, `Servicio registrado: ${form.nombre}`);
            }
            
            refreshAll();
            alert(`¡Servicio ${editingId ? 'actualizado' : 'registrado'} con éxito!`);
            handleClose();
        } catch (error) {
            console.error('Error guardando servicio:', error);
            alert('Error al gestionar el servicio localmente.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={handleClose}></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-white/20 transition-colors">
                
                {/* Header Area */}
                <div className="bg-logo-gradient p-8 text-white relative shrink-0">
                    <button onClick={handleClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">
                                {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
                            </h2>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] italic">Configuración de Catálogo</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                        {[1, 2].map(s => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    
                    {/* Step 1: Info General */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Generalidades</h3>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                    <FileText size={10}/> Nombre del Servicio
                                </label>
                                <input 
                                    required 
                                    placeholder="Ej: Instalación Antena 5G"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-inner"
                                    value={form.nombre}
                                    onChange={e => setForm({...form, nombre: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                    <Info size={10}/> Descripción / Detalles
                                </label>
                                <textarea 
                                    rows="4"
                                    placeholder="Describe en qué consiste este servicio..."
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none resize-none shadow-inner italic"
                                    value={form.descripcion}
                                    onChange={e => setForm({...form, descripcion: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Tarifas */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Valorización</h3>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                    <DollarSign size={10}/> Precio Base ($ USD)
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors">$</span>
                                    <input 
                                        required 
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full pl-10 pr-6 py-5 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-100 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 transition-all font-black text-2xl text-slate-800 dark:text-white outline-none shadow-inner"
                                        value={form.precio}
                                        onChange={e => setForm({...form, precio: e.target.value})}
                                    />
                                </div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase text-center mt-2 px-4 italic">
                                    Este precio se utilizará como referencia en la facturación y reportes de rentabilidad.
                                </p>
                            </div>

                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-3 mt-10 transition-colors">
                                <ShieldCheck className="text-emerald-500 dark:text-emerald-400 shrink-0" size={24} />
                                <p className="text-[9px] font-bold text-emerald-800 dark:text-emerald-400 uppercase leading-relaxed italic">
                                    Los servicios en el catálogo local ayudan a estandarizar los cobros en campo.
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
                    
                    {step < 2 ? (
                        <button 
                            type="button" 
                            disabled={!form.nombre}
                            onClick={() => setStep(step + 1)} 
                            className="bg-slate-900 dark:bg-fuchsia-600 text-white rounded-full px-8 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl hover:bg-slate-800 dark:hover:bg-fuchsia-700 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 italic"
                        >
                            Siguiente <ArrowRight size={14}/>
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            disabled={!form.precio}
                            onClick={handleSubmit} 
                            className="btn-gradient shadow-secondary/20 bg-secondary hover:shadow-secondary/40 rounded-full px-10 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all active:scale-95 text-white"
                        >
                            {editingId ? 'Actualizar Servicio' : 'Guardar en Catálogo'} <Send size={14}/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServicioWizard;
