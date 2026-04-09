import React, { useState, useContext, useMemo } from 'react';
import { X, ArrowRight, ArrowLeft, Send, CheckCircle2, UserCircle, Building2, MapPin, ShieldCheck, Wifi, Map as MapIcon, ChevronDown } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { db, logAction } from '../db/db';

const ClientWizard = ({ isOpen, setIsOpen }) => {
    const { refreshAll } = useContext(AppContext);
    const [step, setStep] = useState(1);
    
    // States
    const [tipo, setTipo] = useState(''); // Interno | Externo
    const [clasificacion, setClasificacion] = useState(''); // Juridico | Natural
    
    // Extracted Prefix states
    const [prefijoId, setPrefijoId] = useState('V');
    const [idNumber, setIdNumber] = useState('');
    const [phoneCode, setPhoneCode] = useState('+58');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');

    const [phoneOperator, setPhoneOperator] = useState('414');

    const countries = useMemo(() => [
        { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
        { code: '+1', flag: '🇺🇸', name: 'USA' },
        { code: '+57', flag: '🇨🇴', name: 'Colombia' },
        { code: '+34', flag: '🇪🇸', name: 'España' },
        { code: '+507', flag: '🇵🇦', name: 'Panamá' },
    ], []);

    const vzlaOperators = useMemo(() => [
        { value: '414', label: '0414' },
        { value: '424', label: '0424' },
        { value: '412', label: '0412' },
        { value: '416', label: '0416' },
        { value: '426', label: '0426' },
        { value: '286', label: '0286' },
        { value: '212', label: '0212' },
    ], []);

    // Customer Info
    const [customer, setCustomer] = useState({
        nombre: '', apellidos: '', correo: '', whatsapp: '', direccion: ''
    });
    
    // Service details
    const [servicioRequerido, setServicioRequerido] = useState('');
    const [tipoInstalacion, setTipoInstalacion] = useState('');
    
    // Tech Info (Soporte)
    const [tipoSoporte, setTipoSoporte] = useState('');
    const [soporteFallas, setSoporteFallas] = useState('');
    const [soporteFechaHora, setSoporteFechaHora] = useState('');

    // Tech Info (Internet)
    const [eq, setEq] = useState({
        antena_tipo: '', antena_modelo: '', antena_marca: '', antena_serial: '', 
        antena_usuario: '', antena_password: '', antena_ip: '', 
        puerto_forward: '', router_modelo: '', router_tipo: '', router_version: ''
    });

    const resetFlow = () => {
        setStep(1); setTipo(''); setClasificacion(''); setServicioRequerido(''); setTipoInstalacion('');
        setTipoSoporte(''); setSoporteFallas(''); setSoporteFechaHora('');
        setPrefijoId('V'); setIdNumber(''); setPhoneCode('+58'); setPhoneNumber(''); setLat(''); setLon('');
        setCustomer({ nombre: '', apellidos: '', correo: '', whatsapp: '', direccion: '' });
        setEq({ antena_tipo: '', antena_modelo: '', antena_marca: '', antena_serial: '', antena_usuario: '', antena_password: '', antena_ip: '', puerto_forward: '', router_modelo: '', router_tipo: '', router_version: '' });
    };

    const handleClose = () => { setIsOpen(false); setTimeout(resetFlow, 500); };

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

    // Helper to format ID based on prefix
    const formatID = (prefijo, val) => {
        const num = val.replace(/\D/g, '');
        if (['V', 'E', 'P'].includes(prefijo)) {
            // max 8 or 9 digits, dots every 3 from right
            const limited = num.substring(0, 9);
            return limited.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        } else if (['J', 'G'].includes(prefijo)) {
            // Formato RIF: 12345678-9
            const limited = num.substring(0, 9);
            if (limited.length > 8) {
                return limited.slice(0, 8) + "-" + limited.slice(8, 9);
            }
            return limited;
        }
        return num;
    };

    const handleIdChange = (e) => {
        const val = e.target.value.replace(/[^0-9.-]/g, ''); // Allow dots/dashes temporarily
        const cleanNum = val.replace(/\D/g, '');
        setIdNumber(cleanNum); // Store clean version
    };

    const isValidPhone = () => {
        if (phoneCode !== '+58') return phoneNumber.length >= 7; 
        return phoneNumber.length === 7;
    };

    const openGoogleMaps = () => {
        if (!customer.direccion) {
            alert("Escribe una dirección primero para buscar en Maps.");
            return;
        }
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.direccion)}`, '_blank');
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        
        if (!isValidPhone()) {
            alert("⚠️ El número telefónico Venezolano debe tener el formato válido: 414, 424, 412, 416 o 426 seguido de 7 dígitos.");
            return;
        }

        if (!lat || !lon) {
            alert("⚠️ La Latitud y Longitud son campos obligatorios.");
            return;
        }

        try {
            const fullPhone = `${phoneCode}${phoneCode === '+58' ? phoneOperator : ''}${phoneNumber}`;
            const customerData = {
                tipo, 
                clasificacion, 
                nombre: customer.nombre,
                apellidos: customer.apellidos,
                correo: customer.correo,
                whatsapp: fullPhone,
                direccion: customer.direccion,
                cedula: `${prefijoId}-${formatID(prefijoId, idNumber)}`,
                telefono: fullPhone,
                coordenadas: `${lat}, ${lon}`,
                status: 'Activo'
            };
            
            // Guardar cliente en LocalDB
            const clienteId = await db.customers.add(customerData);
            
            // Guardar ficha técnica si existe equipo
            if (servicioRequerido) {
                await db.client_equipments.add({
                    cliente_id: clienteId,
                    servicio_requerido: servicioRequerido,
                    tipo_instalacion: tipoInstalacion,
                    tipo_soporte: tipoSoporte,
                    soporte_fallas: soporteFallas,
                    soporte_fecha_hora: soporteFechaHora,
                    ...eq
                });
            }

            await logAction('Admin', 'CREACIÓN', 'Customers', clienteId, `Cliente registrado: ${customer.nombre}`);
            
            refreshAll();
            alert('¡Cliente y Ficha Técnica guardados en el teléfono con éxito!');
            handleClose();
        } catch (error) {
            console.error('Error guardando cliente localmente:', error);
            alert('Ocurrió un error al procesar la alta de cliente en la memoria local.');
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose}></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] transition-colors">
                
                <div className="bg-logo-gradient p-5 text-white relative shrink-0">
                    <button onClick={handleClose} className="absolute top-4 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
                        <X size={16} />
                    </button>
                    <h2 className="text-lg font-black uppercase tracking-widest mb-0.5 italic leading-tight">Registro Nuevo</h2>
                    <p className="text-white/70 text-[9px] font-black uppercase tracking-[0.2em] italic">Ficha Técnica V3</p>
                    
                    <div className="flex gap-1.5 mt-4">
                        {[1,2,3,4,5].map(s => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                    
                    {step === 1 && (
                        <div className="space-y-6 page-transition">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">¿Qué tipo de cliente es?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => { setTipo('Interno'); setStep(2); }} className="p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <ShieldCheck size={48} className="text-orange-500 group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest italic">Interno</span>
                                </button>
                                <button onClick={() => { setTipo('Externo'); setStep(2); }} className="p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <Building2 size={48} className="text-fuchsia-500 group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest italic">Externo</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 page-transition">
                            {tipo === 'Externo' ? (
                                <>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">Clasificación de Empresa</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => { setClasificacion('Juridico'); setStep(3); }} className="p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/5 flex flex-col items-center gap-4 transition-all group">
                                            <Building2 size={48} className="text-fuchsia-500 group-hover:scale-110 transition-transform" />
                                            <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center italic">Cliente<br/>Jurídico</span>
                                        </button>
                                        <button onClick={() => { setClasificacion('Natural'); setStep(3); }} className="p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/5 flex flex-col items-center gap-4 transition-all group">
                                            <UserCircle size={48} className="text-orange-500 group-hover:scale-110 transition-transform" />
                                            <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center italic">Persona<br/>Natural</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <CheckCircle2 size={64} className="mx-auto text-emerald-500 animate-bounce mb-4" />
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest italic">Cliente Interno Registrado</h3>
                                    <button onClick={() => { setClasificacion('Natural'); setStep(3); }} className="mt-8 btn-gradient w-48 mx-auto rounded-full">Continuar <ArrowRight size={18}/></button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <form className="space-y-5 page-transition" onSubmit={(e) => { 
                            e.preventDefault(); 
                            if (!isValidPhone()) {
                                alert("⚠️ El número telefónico Venezolano debe tener 7 dígitos (ej: 123-4567).");
                                return;
                            }
                            setStep(4); 
                        }}>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest border-b dark:border-slate-800 pb-4 italic">
                                Datos Base {clasificacion === 'Juridico' ? '(Persona Jurídica)' : '(Persona Natural)'}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-1 italic">{clasificacion === 'Juridico' ? 'Nombre de la Empresa' : 'Nombres'}</label>
                                    <input required type="text" className="w-full px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-inner text-sm" value={customer.nombre} onChange={e=>setCustomer({...customer, nombre: e.target.value})} />
                                </div>
                                
                                {clasificacion === 'Natural' && (
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-1 italic">Apellidos</label>
                                        <input required type="text" className="w-full px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-inner text-sm" value={customer.apellidos} onChange={e=>setCustomer({...customer, apellidos: e.target.value})} />
                                    </div>
                                )}
                                
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-1 italic">{clasificacion === 'Juridico' ? 'RIF Fiscal' : 'Cédula de Identidad'}</label>
                                    <div className="flex bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-orange-500 transition-all shadow-inner overflow-hidden">
                                        <select className="bg-transparent pl-4 pr-1 font-black text-slate-600 dark:text-slate-400 outline-none border-r border-slate-200 dark:border-slate-700" value={prefijoId} onChange={e => { setPrefijoId(e.target.value); setIdNumber(''); }}>
                                            <option value="V">V</option>
                                            <option value="E">E</option>
                                            <option value="J">J</option>
                                            <option value="G">G</option>
                                            <option value="P">P</option>
                                        </select>
                                        <div className="flex items-center text-slate-400 font-black pl-2">-</div>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder={['J','G'].includes(prefijoId) ? "12345678-9" : "12.345.678"} 
                                            className="flex-1 bg-transparent px-3 py-2.5 outline-none font-black text-slate-700 dark:text-slate-200 tracking-wider text-sm" 
                                            value={formatID(prefijoId, idNumber)} 
                                            onChange={handleIdChange} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-1 flex justify-between italic">
                                        <span>Teléfono Configurado (WhatsApp)</span>
                                        {!isValidPhone() && phoneNumber.length > 0 && <span className="text-red-500">Número incompleto</span>}
                                    </label>
                                    <div className={`flex items-center bg-slate-50 dark:bg-slate-800/50 border rounded-full focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-inner overflow-hidden ${!isValidPhone() && phoneNumber.length > 0 ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 focus-within:border-orange-500'}`}>
                                        <div className="relative border-r border-slate-200 dark:border-slate-700">
                                            <select 
                                                className="appearance-none bg-transparent pl-4 pr-8 py-2.5 font-black text-slate-600 dark:text-slate-400 outline-none text-xs" 
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
                                            className="flex-1 bg-transparent px-4 py-2.5 outline-none font-black text-slate-700 dark:text-slate-200 tracking-widest text-sm" 
                                            value={phoneCode === '+58' ? formatPhoneLocal(phoneNumber) : phoneNumber} 
                                            onChange={handlePhoneChange} 
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-1 italic">{clasificacion === 'Juridico' ? 'Correo Electrónico (Obligatorio)' : 'Correo (Opcional)'}</label>
                                    <input required={clasificacion==='Juridico'} type="email" placeholder="ejemplo@google.com" className="w-full px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-inner text-sm" value={customer.correo} onChange={e=>setCustomer({...customer, correo: e.target.value})}/>
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 pl-1 italic">Dirección Exacta</label>
                                    <div className="flex items-center gap-2">
                                        <input required type="text" placeholder="Ej: Villa Alianza, Puerto Ordaz" className="flex-1 px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-inner text-sm" value={customer.direccion} onChange={e=>setCustomer({...customer, direccion: e.target.value})} />
                                        <button type="button" onClick={openGoogleMaps} title="Buscar en Google Maps" className="w-14 h-14 shrink-0 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center transition-all shadow-sm">
                                            <MapIcon size={24} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-colors">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 pl-1 flex items-center gap-1 italic"><MapPin size={12}/> Latitud</label>
                                        <input required type="text" placeholder="8.293..." className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-inner text-sm" value={lat} onChange={e=>setLat(e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 pl-1 flex items-center gap-1 italic"><MapPin size={12}/> Longitud</label>
                                        <input required type="text" placeholder="-62.730..." className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:border-orange-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-inner text-sm" value={lon} onChange={e=>setLon(e.target.value)} />
                                    </div>
                                    <p className="col-span-2 text-center text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase mt-1 italic">Busca la caja en Google Maps, haz clic derecho sobre el mapa y copia los dos valores numéricos.</p>
                                </div>
                                
                                <button type="submit" className="hidden" id="submit-step3">HiddenSubmit</button>
                            </div>
                        </form>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 page-transition">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">¿Qué servicio requiere?</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <button onClick={() => { setServicioRequerido('Acceso a internet'); setStep(5); }} className="p-8 lg:p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <Wifi size={48} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center italic">Acceso a<br/>Internet</span>
                                </button>
                                <button onClick={() => { setServicioRequerido('Cámaras de seguridad'); setStep(6); }} className="p-8 lg:p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col items-center gap-4 transition-all group">
                                    <ShieldCheck size={48} className="text-slate-500 group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center italic">Cámaras de<br/>Seguridad</span>
                                </button>
                                <button onClick={() => { setServicioRequerido('Soporte Técnico'); setStep(7); }} className="p-8 lg:p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/5 flex flex-col items-center gap-4 transition-all col-span-2 lg:col-span-1 group">
                                    <ShieldCheck size={48} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center italic">Soporte<br/>Técnico</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 5 && servicioRequerido === 'Acceso a internet' && (
                        <div className="space-y-6 page-transition">
                            <div className="space-y-1.5 flex flex-col mb-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 pl-1 text-center italic">Tipo de Instalación</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Instalación nueva desde cero', 'Alquiler de equipos', 'Migración'].map(t => (
                                        <button key={t} onClick={() => setTipoInstalacion(t)} className={`p-3 rounded-full border-2 font-bold text-[10px] uppercase tracking-wider transition-all ${tipoInstalacion === t ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-orange-200 italic'}`}>
                                            {t.replace(" desde cero", "")}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-950/20 p-6 rounded-[2rem] space-y-4 border border-slate-200 dark:border-slate-800 shadow-inner">
                                <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs border-b border-slate-200 dark:border-slate-800 pb-2 italic">Información de Antena</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="Tipo Antena" className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_tipo} onChange={e=>setEq({...eq, antena_tipo: e.target.value})} />
                                    <input placeholder="Marca" className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_marca} onChange={e=>setEq({...eq, antena_marca: e.target.value})} />
                                    <input placeholder="Modelo" className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_modelo} onChange={e=>setEq({...eq, antena_modelo: e.target.value})} />
                                    <input placeholder="Serial" className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_serial} onChange={e=>setEq({...eq, antena_serial: e.target.value})} />
                                    <input placeholder="Login / Usuario" className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_usuario} onChange={e=>setEq({...eq, antena_usuario: e.target.value})} />
                                    <input placeholder="Password" type="text" className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_password} onChange={e=>setEq({...eq, antena_password: e.target.value})} />
                                    <input placeholder="Dirección IP Antena" className="col-span-2 px-5 py-4 border-2 border-emerald-100 dark:border-emerald-500/20 rounded-full text-sm tracking-widest font-black text-emerald-700 dark:text-emerald-400 outline-none focus:border-emerald-500 shadow-sm bg-emerald-50 dark:bg-emerald-500/10 italic" value={eq.antena_ip} onChange={e=>setEq({...eq, antena_ip: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-950/20 p-6 rounded-[2rem] space-y-4 border border-slate-200 dark:border-slate-800 shadow-inner">
                                <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs border-b border-slate-200 dark:border-slate-800 pb-2 italic">Información de Router</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="Modelo Router" className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-fuchsia-500 shadow-sm" value={eq.router_modelo} onChange={e=>setEq({...eq, router_modelo: e.target.value})} />
                                    <input placeholder="Tipo Router" className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-fuchsia-500 shadow-sm" value={eq.router_tipo} onChange={e=>setEq({...eq, router_tipo: e.target.value})} />
                                    <input placeholder="Versión" className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-fuchsia-500 shadow-sm" value={eq.router_version} onChange={e=>setEq({...eq, router_version: e.target.value})} />
                                    <input placeholder="Puerto Forward" className="px-4 py-3 bg-fuchsia-50 dark:bg-fuchsia-500/10 border-2 border-fuchsia-100 dark:border-fuchsia-500/20 rounded-full text-xs font-black text-fuchsia-600 dark:text-fuchsia-400 outline-none focus:border-fuchsia-500 shadow-sm italic" value={eq.puerto_forward} onChange={e=>setEq({...eq, puerto_forward: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="text-center py-10 page-transition">
                            <ShieldCheck size={64} className="mx-auto text-slate-300 dark:text-slate-800 mb-4" />
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest italic">Servicio Estandar de Cámaras</h3>
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-600 mt-2 italic">Los metadatos y material de instalación se definirán en el Ticket del Técnico.</p>
                        </div>
                    )}

                    {step === 7 && servicioRequerido === 'Soporte Técnico' && (
                        <div className="space-y-6 page-transition">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white text-center mb-8 uppercase tracking-widest italic">¿Qué tipo de soporte necesita?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {['Internet', 'Cámaras', 'Hardware', 'Software'].map(ts => (
                                    <button key={ts} onClick={() => { setTipoSoporte(ts); setStep(8); }} className="p-4 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/5 flex flex-col items-center gap-2 transition-all group">
                                        <span className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center group-hover:text-blue-500 transition-colors italic">Soporte de<br/>{ts}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 8 && servicioRequerido === 'Soporte Técnico' && (
                        <div className="space-y-6 page-transition">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white text-center mb-6 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-4 italic">Detalles del Soporte ({tipoSoporte})</h3>
                            
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 pl-1 italic">Agenda: ¿Para cuándo lo necesita?</label>
                                <input required type="datetime-local" className="px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-full focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm text-sm" value={soporteFechaHora} onChange={e=>setSoporteFechaHora(e.target.value)} />
                            </div>

                            <div className="space-y-1.5 flex flex-col mt-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 pl-1 mt-2 italic">
                                    {tipoSoporte === 'Internet' && '¿Qué fallas presenta? (Ej: Lentitud, caída total)'}
                                    {tipoSoporte === 'Cámaras' && 'Detalles (Ej: Sin acceso remoto, no se ven cámaras)'}
                                    {tipoSoporte === 'Hardware' && 'Especificaciones (Ej: Mantenimiento de PC, Cambio disco)'}
                                    {tipoSoporte === 'Software' && 'Requerimientos (Ej: ¿Qué tipo de software desarrollar?)'}
                                </label>
                                <input required type="text" placeholder="Describa el requerimiento del cliente..." className="px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-full focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm text-sm" value={soporteFallas} onChange={e=>setSoporteFallas(e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center shrink-0 border-t border-slate-200 dark:border-slate-800 rounded-b-3xl transition-colors">
                    <button 
                        type="button"
                        onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                        className="px-6 py-3 font-bold text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 uppercase tracking-widest text-xs flex items-center gap-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all italic"
                    >
                        {step === 1 ? 'Cancelar' : <><ArrowLeft size={14}/> Atrás</>}
                    </button>
                    
                    {step === 3 && (
                        <button type="button" onClick={() => document.getElementById('submit-step3').click()} className="btn-gradient bg-emerald-500 rounded-full px-8 shadow-lg shadow-emerald-500/20">
                            Continuar <ArrowRight size={16}/>
                        </button>
                    )}
                    {(step === 5 || step === 6 || step === 8) && (
                        <button type="button" onClick={handleSubmit} className="btn-gradient shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 rounded-full px-8">
                            Guardar Cliente <Send size={16}/>
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ClientWizard;
