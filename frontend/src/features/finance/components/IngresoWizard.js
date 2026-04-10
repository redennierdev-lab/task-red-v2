import React, { useState, useContext } from 'react';
import { X, ArrowRight, ArrowLeft, Send, DollarSign, Wallet, CreditCard, Calendar, Clock, Tag, UserCheck, TrendingUp, Landmark, History } from 'lucide-react';
import { db, logAction } from '../../../services/database';
import { AppContext } from '../../../context/AppContext';


const IngresoWizard = ({ isOpen, setIsOpen, editingId, setEditingId }) => {
    const { refreshAll } = useContext(AppContext);
    const [step, setStep] = useState(1);
    
    // Ingreso category
    const [categoria, setCategoria] = useState('');
    
    // Form State
    const [form, setForm] = useState({
        monto: '',
        metodo_pago: 'Efectivo', // Zelle, Efectivo, Pago Móvil, Binance
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        descripcion: '',
        tipo_origen: 'Manual'
    });

    React.useEffect(() => {
        if (editingId && isOpen) {
            const load = async () => {
                const data = await db.incomes.get(editingId);
                if (data) {
                    setForm(data);
                    setCategoria(data.categoria);
                    setStep(2);
                }
            };
            load();
        }
    }, [editingId, isOpen]);

    const resetFlow = () => {
        setStep(1);
        setCategoria('');
        setEditingId?.(null);
        setForm({
            monto: '',
            metodo_pago: 'Efectivo',
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            descripcion: '',
            tipo_origen: 'Manual'
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
                categoria,
                ...form,
                monto: parseFloat(form.monto) || 0
            };
            
            if (editingId) {
                await db.incomes.update(editingId, finalData);
                await logAction('Admin', 'EDICIÓN', 'Incomes', editingId, `Ingreso actualizado: ${categoria} - ${form.descripcion}`);
            } else {
                const id = await db.incomes.add(finalData);
                await logAction('Admin', 'CREACIÓN', 'Incomes', id, `Ingreso registrado: ${categoria} - ${form.descripcion}`);
            }
            
            refreshAll();
            alert('¡Ingreso registrado con éxito!');
            handleClose();
        } catch (error) {
            console.error('Error guardando ingreso:', error);
            alert('Error al guardar el ingreso localmente.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 dark:bg-black/80 backdrop-blur-md" onClick={handleClose}></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-white/20 dark:border-slate-800 transition-colors">
                
                {/* Header Area */}
                <div className="bg-logo-gradient p-5 text-white relative shrink-0">
                    <button onClick={handleClose} className="absolute top-5 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <X size={16} />
                    </button>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight italic text-white leading-tight">
                                {editingId ? 'Editar Ingreso' : 'Captación de Ingreso'}
                            </h2>
                            <p className="text-white/70 text-[8px] font-bold uppercase tracking-[0.2em] italic">Flujo de Caja RED ENNIER</p>
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
                    
                    {/* Step 1: Category Selection */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">¿Origen del Capital?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => { setCategoria('Mensualidad'); setStep(2); }}
                                    className={`group p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-orange-500 transition-all flex flex-col items-center gap-3`}
                                >
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                        <Wallet size={24} />
                                    </div>
                                    <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px] italic">Mensualidad</span>
                                </button>
                                <button 
                                    onClick={() => { setCategoria('Deuda Vieja'); setStep(2); }}
                                    className="group p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-fuchsia-500 transition-all flex flex-col items-center gap-3"
                                >
                                    <div className="w-12 h-12 bg-fuchsia-100 dark:bg-fuchsia-500/10 rounded-2xl flex items-center justify-center text-fuchsia-500 group-hover:scale-110 transition-transform">
                                        <History size={24} />
                                    </div>
                                    <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px] italic">Deuda Cobrada</span>
                                </button>
                                <button 
                                    onClick={() => { setCategoria('Venta Equipo'); setStep(2); }}
                                    className="group p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-3"
                                >
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                        <Landmark size={24} />
                                    </div>
                                    <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px] italic">Venta Equipo</span>
                                </button>
                                <button 
                                    onClick={() => { setCategoria('Otros'); setStep(2); }}
                                    className="group p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-slate-400 transition-all flex flex-col items-center gap-3"
                                >
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                                        <TrendingUp size={24} />
                                    </div>
                                    <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px] italic">Otro Ingreso</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Specific Data */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 italic">
                                <Tag size={14} /> Detalles de Operación ({categoria})
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Justificación / Descripción</label>
                                        <textarea 
                                            rows="4"
                                            placeholder="Ej: Pago mensualidad Cliente Juan Pérez - Marzo 2026..."
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none resize-none italic shadow-inner"
                                            value={form.descripcion}
                                            onChange={e => setForm({...form, descripcion: e.target.value})}
                                        />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-1 italic"><Calendar size={10}/> Fecha</label>
                                        <input 
                                            type="date"
                                            className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-200 text-xs outline-none italic"
                                            value={form.fecha}
                                            onChange={e => setForm({...form, fecha: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 flex items-center gap-1 italic"><Clock size={10}/> Hora</label>
                                        <input 
                                            type="time"
                                            className="w-full px-6 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-200 text-xs outline-none italic"
                                            value={form.hora}
                                            onChange={e => setForm({...form, hora: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Financials */}
                    {step === 3 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 italic">
                                <DollarSign size={14} /> Conciliación Bancaria
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Monto a Abonar ($)</label>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors">$</span>
                                        <input 
                                            required 
                                            type="number"
                                            step="0.01"
                                            placeholder="50.00"
                                            className="w-full pl-10 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 transition-all font-black text-2xl text-slate-800 dark:text-white outline-none italic shadow-inner"
                                            value={form.monto}
                                            onChange={e => setForm({...form, monto: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 space-y-1.5 pt-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-4 italic">Plataforma de Cobro</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Zelle', 'Efectivo', 'Pago Móvil', 'Binance'].map(method => (
                                            <button 
                                                key={method}
                                                type="button"
                                                onClick={() => setForm({...form, metodo_pago: method})}
                                                className={`py-3 rounded-full border-2 font-black text-[10px] uppercase tracking-widest transition-all italic ${form.metodo_pago === method ? 'bg-slate-900 dark:bg-emerald-600 border-slate-900 dark:border-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>
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
                            disabled={step === 1 && !categoria}
                            onClick={() => setStep(step + 1)} 
                            className="bg-slate-900 dark:bg-fuchsia-600 text-white rounded-full px-8 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl hover:bg-slate-800 dark:hover:bg-fuchsia-700 disabled:opacity-50 transition-all active:scale-95 italic"
                        >
                            Verificar <ArrowRight size={14}/>
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            disabled={!form.monto}
                            onClick={handleSubmit} 
                            className="btn-gradient shadow-orange-500/20 bg-orange-500 hover:shadow-orange-500/40 rounded-full px-10 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all active:scale-95 text-white italic"
                        >
                            Abonar Capital <Send size={14}/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IngresoWizard;
