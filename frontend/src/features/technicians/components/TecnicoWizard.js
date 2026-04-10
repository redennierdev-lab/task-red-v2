import React, { useState, useContext, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Send, UserPlus, Wrench, Phone, Award, ShieldCheck, ChevronDown } from 'lucide-react';
import { db, logAction } from '../../../services/database';

import { AppContext } from '../../../context/AppContext';


const TecnicoWizard = ({ isOpen, setIsOpen, editingId, setEditingId }) => {
    const { refreshAll } = useContext(AppContext);
    const [step, setStep] = useState(1);
    
    // Form State
    const [form, setForm] = useState({
        nombre: '',
        especialidad: '',
        status: 'Activo'
    });

    const [phoneCode, setPhoneCode] = useState('+58');
    const [phoneOperator, setPhoneOperator] = useState('414');
    const [phoneNumber, setPhoneNumber] = useState('');

    const countries = [
        { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
        { code: '+1', flag: '🇺🇸', name: 'USA' },
        { code: '+57', flag: '🇨🇴', name: 'Colombia' },
        { code: '+34', flag: '🇪🇸', name: 'España' },
        { code: '+507', flag: '🇵🇦', name: 'Panamá' },
    ];

    const vzlaOperators = [
        { value: '414', label: '0414' },
        { value: '424', label: '0424' },
        { value: '412', label: '0412' },
        { value: '416', label: '0416' },
        { value: '426', label: '0426' },
        { value: '286', label: '0286' },
        { value: '212', label: '0212' },
    ];

    useEffect(() => {
        if (editingId) {
            const load = async () => {
                const data = await db.technicians.get(editingId);
                if (data) {
                    setForm({ nombre: data.nombre, especialidad: data.especialidad, status: data.status });
                    // Basic parsing for phone to populate back
                    if (data.telefono) {
                        if (data.telefono.startsWith('+58')) {
                            setPhoneCode('+58');
                            const rest = data.telefono.replace('+58', '');
                            setPhoneOperator(rest.substring(0,3));
                            setPhoneNumber(rest.substring(3));
                        } else {
                            // find if it matches another code, otherwise just throw it all in phoneNumber
                            const match = countries.find(c => c.code !== '+58' && data.telefono.startsWith(c.code));
                            if (match) {
                                setPhoneCode(match.code);
                                setPhoneNumber(data.telefono.replace(match.code, ''));
                            } else {
                                setPhoneCode('+58');
                                setPhoneNumber(data.telefono);
                            }
                        }
                    }
                }
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
            status: 'Activo'
        });
        setPhoneCode('+58');
        setPhoneOperator('414');
        setPhoneNumber('');
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(resetFlow, 500);
    };

    const isValidPhone = () => {
        if (phoneCode !== '+58') return phoneNumber.length >= 7; 
        return phoneNumber.length === 7;
    };

    const handlePhoneChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 7) val = val.substring(0, 7);
        setPhoneNumber(val);
    };

    const formatPhoneLocal = (num) => {
        if (num.length > 3) {
            return num.slice(0, 3) + "-" + num.slice(3);
        }
        return num;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!isValidPhone()) {
            alert("⚠️ El número telefónico debe tener el formato válido.");
            return;
        }

        const fullPhone = `${phoneCode}${phoneCode === '+58' ? phoneOperator : ''}${phoneNumber}`;
        const finalData = { ...form, telefono: fullPhone };

        try {
            if (editingId) {
                await db.technicians.update(editingId, finalData);
                await logAction('Admin', 'EDICIÓN', 'Technicians', editingId, `Técnico actualizado: ${form.nombre}`);
            } else {
                const id = await db.technicians.add(finalData);
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
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-white/20 transition-colors">
                
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
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">
                                {editingId ? 'Perfil Técnico' : 'Alta de Técnico'}
                            </h2>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] italic">Gestión de Personal Verificado</p>
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
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Identificación</h3>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                    <Award size={10}/> Nombre Completo
                                </label>
                                <input 
                                    required 
                                    placeholder="Ej: Carlos Rodriguez"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-inner"
                                    value={form.nombre}
                                    onChange={e => setForm({...form, nombre: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic justify-between">
                                    <div className="flex gap-2 items-center"><Phone size={10}/> Contacto Celular</div>
                                    {!isValidPhone() && phoneNumber.length > 0 && <span className="text-red-500">Incompleto</span>}
                                </label>
                                <div className={`flex items-center bg-slate-50 dark:bg-slate-800/50 border rounded-full focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-inner overflow-hidden ${!isValidPhone() && phoneNumber.length > 0 ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus-within:border-orange-500'}`}>
                                    <div className="relative border-r border-slate-200 dark:border-slate-700">
                                        <select 
                                            className="appearance-none bg-transparent pl-4 pr-8 py-4 font-black text-slate-600 dark:text-slate-400 outline-none" 
                                            value={phoneCode} 
                                            onChange={e => { setPhoneCode(e.target.value); setPhoneNumber(''); }}
                                        >
                                            {countries.map(c => (
                                                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                    </div>

                                    {phoneCode === '+58' && (
                                        <div className="relative border-r border-slate-200 dark:border-slate-700 bg-orange-500/5">
                                            <select 
                                                className="appearance-none bg-transparent pl-4 pr-8 py-4 font-black text-orange-600 dark:text-orange-400 outline-none" 
                                                value={phoneOperator} 
                                                onChange={e => setPhoneOperator(e.target.value)}
                                            >
                                                {vzlaOperators.map(o => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400" />
                                        </div>
                                    )}

                                    <input 
                                        required 
                                        type="text" 
                                        placeholder={phoneCode === '+58' ? "123-4567" : "1234567890"} 
                                        className="flex-1 bg-transparent px-4 py-4 outline-none font-black text-slate-700 dark:text-slate-200 tracking-widest" 
                                        value={phoneCode === '+58' ? formatPhoneLocal(phoneNumber) : phoneNumber} 
                                        onChange={handlePhoneChange} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Especialidades */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Especialización</h3>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-2 italic">
                                    <Wrench size={10}/> Rama Técnica
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Redes', 'Cámaras', 'Software', 'Instalador', 'Soporte'].map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => setForm({...form, especialidad: tag})}
                                            className={`py-3 rounded-full border-2 font-black text-[10px] uppercase tracking-widest transition-all ${form.especialidad === tag ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-orange-200 italic'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {editingId && (
                                <div className="space-y-1.5 pt-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Estado Actual</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-full font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest text-xs outline-none italic"
                                        value={form.status}
                                        onChange={e => setForm({...form, status: e.target.value})}
                                    >
                                        <option value="Activo">✓ Activo</option>
                                        <option value="Inactivo">× Inactivo / Vacaciones</option>
                                    </select>
                                </div>
                            )}

                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-3 transition-colors">
                                <ShieldCheck className="text-emerald-500 dark:text-emerald-400 shrink-0" size={24} />
                                <p className="text-[9px] font-bold text-emerald-800 dark:text-emerald-400 uppercase leading-relaxed italic">
                                    Este perfil será elegible para asignación automática de tickets en el Centro de Mando.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center shrink-0 border-t border-slate-200 dark:border-t-slate-800 rounded-b-[2.5rem] transition-colors">
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
                            disabled={!form.nombre || !isValidPhone()}
                            onClick={() => setStep(step + 1)} 
                            className="bg-slate-900 dark:bg-fuchsia-600 text-white rounded-full px-8 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl hover:bg-slate-800 dark:hover:bg-fuchsia-700 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 italic"
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
