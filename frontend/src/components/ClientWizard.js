import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Plus, X, ArrowRight, ArrowLeft, Send, CheckCircle2, UserCircle, Building2, MapPin, ShieldCheck, Wifi, Map as MapIcon } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const ClientWizard = () => {
    const { fetchClientes } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);
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
        // Permitir solo números y forzar longitud maxima de 10 dígitos (ej: 4141234567)
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 10) val = val.substring(0, 10);
        setPhoneNumber(val);
    };

    const isValidPhone = () => {
        if (phoneCode !== '+58') return true; // Asums valid if external country selected maybe
        return /^(412|414|424|416|426|422|286)\d{7}$/.test(phoneNumber);
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
            const payload = {
                tipo, 
                clasificacion, 
                nombre: customer.nombre,
                apellidos: customer.apellidos,
                correo: customer.correo,
                whatsapp: customer.whatsapp, // Extra whatsapp si es interno
                direccion: customer.direccion,
                cedula: `${prefijoId}-${idNumber}`,
                telefono: `${phoneCode}${phoneNumber}`,
                coordenadas: `${lat}, ${lon}`,
                equipments: servicioRequerido ? {
                    servicio_requerido: servicioRequerido,
                    tipo_instalacion: tipoInstalacion,
                    tipo_soporte: tipoSoporte,
                    soporte_fallas: soporteFallas,
                    soporte_fecha_hora: soporteFechaHora,
                    ...eq
                } : null
            };
            
            await axios.post('http://10.51.182.11:5000/api/customers', payload);
            
            fetchClientes();
            alert('¡Cliente y Ficha Técnica guardados con éxito!');
            handleClose();
        } catch (error) {
            console.error('Error guardando cliente:', error);
            alert('Ocurrió un error al procesar la alta de cliente.');
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 w-16 h-16 rounded-full bg-logo-gradient text-white shadow-[0_10px_40px_rgba(217,70,239,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border-[3px] border-white/20"
                title="Añadir Cliente"
            >
                <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose}></div>
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="bg-logo-gradient p-8 text-white relative shrink-0">
                    <button onClick={handleClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-black uppercase tracking-widest mb-1">Registro Nuevo</h2>
                    <p className="text-white/80 text-sm font-medium tracking-widest uppercase">Ficha Técnica & Administrativa</p>
                    
                    <div className="flex gap-2 mt-6">
                        {[1,2,3,4,5].map(s => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    
                    {step === 1 && (
                        <div className="space-y-6 page-transition">
                            <h3 className="text-xl font-black text-slate-800 text-center mb-8 uppercase tracking-widest">¿Qué tipo de cliente es?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => { setTipo('Interno'); setStep(2); }} className="p-8 rounded-[2rem] border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 flex flex-col items-center gap-4 transition-all">
                                    <ShieldCheck size={48} className="text-orange-500" />
                                    <span className="font-black text-slate-700 uppercase tracking-widest">Interno</span>
                                </button>
                                <button onClick={() => { setTipo('Externo'); setStep(2); }} className="p-8 rounded-[2rem] border-2 border-slate-100 hover:border-fuchsia-500 hover:bg-fuchsia-50 flex flex-col items-center gap-4 transition-all">
                                    <Building2 size={48} className="text-fuchsia-500" />
                                    <span className="font-black text-slate-700 uppercase tracking-widest">Externo</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 page-transition">
                            {tipo === 'Externo' ? (
                                <>
                                    <h3 className="text-xl font-black text-slate-800 text-center mb-8 uppercase tracking-widest">Clasificación de Empresa</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => { setClasificacion('Juridico'); setStep(3); }} className="p-8 rounded-[2rem] border-2 border-slate-100 hover:border-violet hover:bg-violet/5 flex flex-col items-center gap-4 transition-all">
                                            <Building2 size={48} className="text-accent" />
                                            <span className="font-black text-slate-700 uppercase tracking-widest text-center">Cliente<br/>Jurídico</span>
                                        </button>
                                        <button onClick={() => { setClasificacion('Natural'); setStep(3); }} className="p-8 rounded-[2rem] border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 flex flex-col items-center gap-4 transition-all">
                                            <UserCircle size={48} className="text-orange-500" />
                                            <span className="font-black text-slate-700 uppercase tracking-widest text-center">Persona<br/>Natural</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <CheckCircle2 size={64} className="mx-auto text-emerald-500 animate-bounce mb-4" />
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Cliente Interno Registrado</h3>
                                    <button onClick={() => { setClasificacion('Natural'); setStep(3); }} className="mt-8 btn-gradient w-48 mx-auto rounded-full">Continuar <ArrowRight size={18}/></button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <form className="space-y-5 page-transition" onSubmit={(e) => { e.preventDefault(); setStep(4); }}>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest border-b pb-4">
                                Datos Base {clasificacion === 'Juridico' ? '(Persona Jurídica)' : '(Persona Natural)'}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{clasificacion === 'Juridico' ? 'Nombre de la Empresa' : 'Nombres'}</label>
                                    <input required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 outline-none shadow-inner" value={customer.nombre} onChange={e=>setCustomer({...customer, nombre: e.target.value})} />
                                </div>
                                
                                {clasificacion === 'Natural' && (
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Apellidos</label>
                                        <input required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 outline-none shadow-inner" value={customer.apellidos} onChange={e=>setCustomer({...customer, apellidos: e.target.value})} />
                                    </div>
                                )}
                                
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{clasificacion === 'Juridico' ? 'RIF Fiscal' : 'Cédula de Identidad'}</label>
                                    <div className="flex bg-slate-50 border border-slate-200 rounded-full focus-within:bg-white focus-within:border-orange-500 transition-all shadow-inner overflow-hidden">
                                        <select className="bg-transparent pl-4 pr-1 font-black text-slate-600 outline-none border-r border-slate-200" value={prefijoId} onChange={e => setPrefijoId(e.target.value)}>
                                            <option value="V">V</option>
                                            <option value="E">E</option>
                                            <option value="J">J</option>
                                            <option value="G">G</option>
                                            <option value="P">P</option>
                                        </select>
                                        <div className="flex items-center text-slate-400 font-black pl-2">-</div>
                                        <input required type="text" placeholder="12345678" className="flex-1 bg-transparent px-3 py-4 outline-none font-black text-slate-700 tracking-wider" value={idNumber} onChange={e=>setIdNumber(e.target.value.replace(/\D/g, ''))} />
                                    </div>
                                </div>

                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 pl-1 flex justify-between">
                                        <span>Teléfono Configurado (WhatsApp)</span>
                                        {!isValidPhone() && phoneNumber.length >= 3 && <span className="text-red-500">Prefijo Invalido</span>}
                                    </label>
                                    <div className={`flex bg-slate-50 border rounded-full focus-within:bg-white transition-all shadow-inner overflow-hidden ${!isValidPhone() && phoneNumber.length > 3 ? 'border-red-400' : 'border-slate-200 focus-within:border-orange-500'}`}>
                                        <select className="bg-transparent pl-4 pr-1 font-black text-slate-600 outline-none border-r border-slate-200" value={phoneCode} onChange={e => setPhoneCode(e.target.value)}>
                                            <option value="+58">🇻🇪 +58</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+57">🇨🇴 +57</option>
                                        </select>
                                        <input required type="text" placeholder="4141234567" className="flex-1 bg-transparent px-3 py-4 outline-none font-black text-slate-700 tracking-wider" value={phoneNumber} onChange={handlePhoneChange} />
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{clasificacion === 'Juridico' ? 'Correo Electrónico (Obligatorio)' : 'Correo (Opcional)'}</label>
                                    <input required={clasificacion==='Juridico'} type="email" placeholder="ejemplo@google.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 outline-none shadow-inner" value={customer.correo} onChange={e=>setCustomer({...customer, correo: e.target.value})}/>
                                </div>

                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Dirección Exacta</label>
                                    <div className="flex items-center gap-2">
                                        <input required type="text" placeholder="Ej: Villa Alianza, Puerto Ordaz" className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 outline-none shadow-inner" value={customer.direccion} onChange={e=>setCustomer({...customer, direccion: e.target.value})} />
                                        <button type="button" onClick={openGoogleMaps} title="Buscar en Google Maps" className="w-14 h-14 shrink-0 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-full flex items-center justify-center transition-all shadow-sm">
                                            <MapIcon size={24} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1 flex items-center gap-1"><MapPin size={12}/> Latitud</label>
                                        <input required type="text" placeholder="8.293..." className="w-full px-5 py-3 bg-white border border-slate-200 rounded-full focus:border-orange-500 transition-all font-bold text-slate-700 outline-none shadow-inner text-sm" value={lat} onChange={e=>setLat(e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1 flex items-center gap-1"><MapPin size={12}/> Longitud</label>
                                        <input required type="text" placeholder="-62.730..." className="w-full px-5 py-3 bg-white border border-slate-200 rounded-full focus:border-orange-500 transition-all font-bold text-slate-700 outline-none shadow-inner text-sm" value={lon} onChange={e=>setLon(e.target.value)} />
                                    </div>
                                    <p className="col-span-2 text-center text-[9px] text-slate-400 font-bold uppercase mt-1">Busca la caja en Google Maps, haz clic derecho sobre el mapa y copia los dos valores numéricos.</p>
                                </div>
                                
                                <button type="submit" className="hidden" id="submit-step3">HiddenSubmit</button>
                            </div>
                        </form>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 page-transition">
                            <h3 className="text-xl font-black text-slate-800 text-center mb-8 uppercase tracking-widest">¿Qué servicio requiere?</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <button onClick={() => { setServicioRequerido('Acceso a internet'); setStep(5); }} className="p-8 lg:p-6 rounded-[2rem] border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 flex flex-col items-center gap-4 transition-all">
                                    <Wifi size={48} className="text-emerald-500" />
                                    <span className="font-black text-xs text-slate-700 uppercase tracking-widest text-center">Acceso a<br/>Internet</span>
                                </button>
                                <button onClick={() => { setServicioRequerido('Cámaras de seguridad'); setStep(6); }} className="p-8 lg:p-6 rounded-[2rem] border-2 border-slate-100 hover:border-slate-500 hover:bg-slate-50 flex flex-col items-center gap-4 transition-all">
                                    <ShieldCheck size={48} className="text-slate-500" />
                                    <span className="font-black text-xs text-slate-700 uppercase tracking-widest text-center">Cámaras de<br/>Seguridad</span>
                                </button>
                                <button onClick={() => { setServicioRequerido('Soporte Técnico'); setStep(7); }} className="p-8 lg:p-6 rounded-[2rem] border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center gap-4 transition-all col-span-2 lg:col-span-1">
                                    <ShieldCheck size={48} className="text-blue-500" />
                                    <span className="font-black text-xs text-slate-700 uppercase tracking-widest text-center">Soporte<br/>Técnico</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 5 && servicioRequerido === 'Acceso a internet' && (
                        <div className="space-y-6 page-transition">
                            <div className="space-y-1.5 flex flex-col mb-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 pl-1 text-center">Tipo de Instalación</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Instalación nueva desde cero', 'Alquiler de equipos', 'Migración'].map(t => (
                                        <button key={t} onClick={() => setTipoInstalacion(t)} className={`p-3 rounded-full border-2 font-bold text-[10px] uppercase tracking-wider transition-all ${tipoInstalacion === t ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-orange-200'}`}>
                                            {t.replace(" desde cero", "")}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4 border border-slate-200 shadow-inner">
                                <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs border-b border-slate-200 pb-2">Información de Antena</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="Tipo Antena" className="px-4 py-3 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_tipo} onChange={e=>setEq({...eq, antena_tipo: e.target.value})} />
                                    <input placeholder="Marca" className="px-4 py-3 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_marca} onChange={e=>setEq({...eq, antena_marca: e.target.value})} />
                                    <input placeholder="Modelo" className="px-4 py-3 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_modelo} onChange={e=>setEq({...eq, antena_modelo: e.target.value})} />
                                    <input placeholder="Serial" className="px-4 py-3 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_serial} onChange={e=>setEq({...eq, antena_serial: e.target.value})} />
                                    <input placeholder="Login / Usuario" className="px-4 py-3 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_usuario} onChange={e=>setEq({...eq, antena_usuario: e.target.value})} />
                                    <input placeholder="Password" type="text" className="px-4 py-3 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm" value={eq.antena_password} onChange={e=>setEq({...eq, antena_password: e.target.value})} />
                                    <input placeholder="Dirección IP Antena" className="col-span-2 px-5 py-4 border-2 border-emerald-100 rounded-full text-sm tracking-widest font-black text-emerald-700 outline-none focus:border-emerald-500 shadow-sm bg-emerald-50" value={eq.antena_ip} onChange={e=>setEq({...eq, antena_ip: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4 border border-slate-200 shadow-inner">
                                <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs border-b border-slate-200 pb-2">Información de Router</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="Modelo Router" className="px-4 py-3 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-700 outline-none focus:border-fuchsia-500 shadow-sm" value={eq.router_modelo} onChange={e=>setEq({...eq, router_modelo: e.target.value})} />
                                    <input placeholder="Tipo Router" className="px-4 py-3 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-700 outline-none focus:border-fuchsia-500 shadow-sm" value={eq.router_tipo} onChange={e=>setEq({...eq, router_tipo: e.target.value})} />
                                    <input placeholder="Versión" className="px-4 py-3 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-700 outline-none focus:border-fuchsia-500 shadow-sm" value={eq.router_version} onChange={e=>setEq({...eq, router_version: e.target.value})} />
                                    <input placeholder="Puerto Forward" className="px-4 py-3 bg-fuchsia-50 border-2 border-fuchsia-100 rounded-full text-xs font-black text-fuchsia-600 outline-none focus:border-fuchsia-500 shadow-sm" value={eq.puerto_forward} onChange={e=>setEq({...eq, puerto_forward: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="text-center py-10 page-transition">
                            <ShieldCheck size={64} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Servicio Estandar de Cámaras</h3>
                            <p className="text-xs font-medium text-slate-400 mt-2">Los metadatos y material de instalación se definirán en el Ticket del Técnico.</p>
                        </div>
                    )}

                    {step === 7 && servicioRequerido === 'Soporte Técnico' && (
                        <div className="space-y-6 page-transition">
                            <h3 className="text-xl font-black text-slate-800 text-center mb-8 uppercase tracking-widest">¿Qué tipo de soporte necesita?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {['Internet', 'Cámaras', 'Hardware', 'Software'].map(ts => (
                                    <button key={ts} onClick={() => { setTipoSoporte(ts); setStep(8); }} className="p-4 rounded-[2rem] border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center gap-2 transition-all">
                                        <span className="font-black text-xs text-slate-700 uppercase tracking-widest text-center">Soporte de<br/>{ts}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 8 && servicioRequerido === 'Soporte Técnico' && (
                        <div className="space-y-6 page-transition">
                            <h3 className="text-xl font-black text-slate-800 text-center mb-6 uppercase tracking-widest border-b border-slate-100 pb-4">Detalles del Soporte ({tipoSoporte})</h3>
                            
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Agenda: ¿Para cuándo lo necesita?</label>
                                <input required type="datetime-local" className="px-5 py-4 bg-slate-50 border border-transparent rounded-full focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700 outline-none shadow-sm text-sm" value={soporteFechaHora} onChange={e=>setSoporteFechaHora(e.target.value)} />
                            </div>

                            <div className="space-y-1.5 flex flex-col mt-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 pl-1 mt-2">
                                    {tipoSoporte === 'Internet' && '¿Qué fallas presenta? (Ej: Lentitud, caída total)'}
                                    {tipoSoporte === 'Cámaras' && 'Detalles (Ej: Sin acceso remoto, no se ven cámaras)'}
                                    {tipoSoporte === 'Hardware' && 'Especificaciones (Ej: Mantenimiento de PC, Cambio disco)'}
                                    {tipoSoporte === 'Software' && 'Requerimientos (Ej: ¿Qué tipo de software desarrollar?)'}
                                </label>
                                <input required type="text" placeholder="Describa el requerimiento del cliente..." className="px-5 py-4 bg-slate-50 border border-transparent rounded-full focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700 outline-none shadow-sm text-sm" value={soporteFallas} onChange={e=>setSoporteFallas(e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 flex justify-between items-center shrink-0 border-t border-slate-200 rounded-b-[2.5rem]">
                    <button 
                        type="button"
                        onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                        className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs flex items-center gap-2 rounded-full hover:bg-slate-100 transition-all"
                    >
                        {step === 1 ? 'Cancelar' : <><ArrowLeft size={14}/> Atrás</>}
                    </button>
                    
                    {step === 3 && (
                        <button type="button" onClick={() => document.getElementById('submit-step3').click()} className="btn-gradient bg-emerald-500 rounded-full px-8">
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
