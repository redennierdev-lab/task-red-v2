import React, { useState, useContext, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Send, UserPlus, Wrench, Phone, Award, ShieldCheck } from 'lucide-react';
import { db, logAction } from '../db/db';
import { AppContext } from '../context/AppContext';

const TecnicoWizard = ({ isOpen, setIsOpen, editingId, setEditingId }) => {
    const { refreshAll } = useContext(AppContext);
    const [step, setStep] = useState(1);
    
    // Form State
    const [form, setForm] = useState({
        nombre: '',
        especialidad: '',
        telefono: '',
        status: 'Activo'
    });

    useEffect(() => {
        if (editingId) {
            const load = async () => {
                const data = await db.technicians.get(editingId);
                if (data) setForm(data);
            };
            load();
        }
    }, [editingId]);

    const resetFlow = () => {
        setStep(1);
        setEditingId?.(null);
        setForm({
            nombre: '',
            especialidad: '',
            telefono: '',
            status: 'Activo'
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
                await db.technicians.update(editingId, form);
                await logAction('Admin', 'EDICIÓN', 'Technicians', editingId, `Técnico actualizado: ${form.nombre}`);
            } else {
                const id = await db.technicians.add(form);
                await logAction('Admin', 'CREACIÓN', 'Technicians', id, `Técnico registrado: ${form.nombre}`);
            }
            
            refreshAll();
            alert(`¡Técnico ${editingId ? 'actualizado' : 'registrado'} con éxito!`);
            handleClose();
        } catch (error) {
            console.error('Error guardando técnico:', error);
            alert('Error al procesar el técnico localmente.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={handleClose}></div>
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                
                {/* Header Area */}
                <div className="bg-logo-gradient p-8 text-white relative shrink-0">
                    <button onClick={handleClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">
                                {editingId ? 'Perfil Técnico' : 'Alta de Técnico'}
                            </h2>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">Gestión de Personal Verificado</p>
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
                    
                    {/* Step 1: Identidad */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 text-center mb-8 uppercase tracking-widest">Identificación</h3>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 pl-4 flex items-center gap-2">
                                    <Award size={10}/> Nombre Completo
                                </label>
                                <input 
                                    required 
                                    placeholder="Ej: Carlos Rodriguez"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 outline-none shadow-inner"
                                    value={form.nombre}
                                    onChange={e => setForm({...form, nombre: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 pl-4 flex items-center gap-2">
                                    <Phone size={10}/> Contacto Celular
                                </label>
                                <input 
                                    required 
                                    placeholder="4141234567"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 outline-none shadow-inner tracking-widest"
                                    value={form.telefono}
                                    onChange={e => setForm({...form, telefono: e.target.value.replace(/\D/g, '')})}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Especialidades */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 text-center mb-8 uppercase tracking-widest">Especialización</h3>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 pl-4 flex items-center gap-2">
                                    <Wrench size={10}/> Rama Técnica
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Redes', 'Cámaras', 'Software', 'Instalador', 'Soporte'].map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => setForm({...form, especialidad: tag})}
                                            className={`py-3 rounded-full border-2 font-black text-[10px] uppercase tracking-widest transition-all ${form.especialidad === tag ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {editingId && (
                                <div className="space-y-1.5 pt-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400 pl-4">Estado Actual</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-100 border-none rounded-full font-black text-slate-700 uppercase tracking-widest text-xs outline-none"
                                        value={form.status}
                                        onChange={e => setForm({...form, status: e.target.value})}
                                    >
                                        <option value="Activo">✓ Activo</option>
                                        <option value="Inactivo">× Inactivo / Vacaciones</option>
                                    </select>
                                </div>
                            )}

                            <div className="bg-emerald-50 p-4 rounded-[1.5rem] border border-emerald-100 flex items-center gap-3">
                                <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
                                <p className="text-[9px] font-bold text-emerald-800 uppercase leading-relaxed">
                                    Este perfil será elegible para asignación automática de tickets en el Centro de Mando.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 flex justify-between items-center shrink-0 border-t border-slate-200 rounded-b-[2.5rem]">
                    <button 
                        type="button"
                        onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                        className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest text-[10px] flex items-center gap-2 rounded-full hover:bg-slate-200/50 transition-all"
                    >
                        {step === 1 ? 'Cancelar' : <><ArrowLeft size={14}/> Atrás</>}
                    </button>
                    
                    {step < 2 ? (
                        <button 
                            type="button" 
                            disabled={!form.nombre || !form.telefono}
                            onClick={() => setStep(step + 1)} 
                            className="bg-slate-900 text-white rounded-full px-8 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl hover:bg-slate-800 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                        >
                            Siguiente <ArrowRight size={14}/>
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            disabled={!form.especialidad}
                            onClick={handleSubmit} 
                            className="btn-gradient shadow-secondary/20 bg-secondary hover:shadow-secondary/40 rounded-full px-10 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all active:scale-95 text-white"
                        >
                            {editingId ? 'Actualizar Staff' : 'Registrar Técnico'} <Send size={14}/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TecnicoWizard;
