import React, { useState, useEffect } from 'react';
import { Bluetooth, XCircle, RefreshCw, Check, Printer, ChevronRight, Play, X } from 'lucide-react';
import BluetoothPrinter from '../services/BluetoothPrinter';


const PrinterModal = ({ isOpen, onClose, onSelect, selectedAddress }) => {
    const [printers, setPrinters] = useState({ paired: [], unpaired: [] });
    const [isScanning, setIsScanning] = useState(false);
    const [isBtEnabled, setIsBtEnabled] = useState(true);

    const checkBtStatus = async () => {
        const enabled = await BluetoothPrinter.checkBT();
        setIsBtEnabled(enabled);
        return enabled;
    };

    const scanPrinters = async () => {
        setIsScanning(true);
        const btOn = await checkBtStatus();
        if (!btOn) {
            setIsScanning(false);
            return;
        }

        setPrinters({ paired: [], unpaired: [] });
        try {
            const ready = await BluetoothPrinter.prepareSystem();
            if (!ready) {
                setIsScanning(false);
                return;
            }

            // Iniciar ambas búsquedas
            const paired = await BluetoothPrinter.listDevices();
            setPrinters(prev => ({ ...prev, paired: paired || [] }));
            
            // Buscar nuevos (esto toma más tiempo)
            const unpaired = await BluetoothPrinter.discoverNew();
            setPrinters(prev => ({ ...prev, unpaired: unpaired || [] }));
        } catch (err) {
            console.error("Bluetooth Scan Error:", err);
        }
        setIsScanning(false);
    };

    const handleEnableBt = async () => {
        const success = await BluetoothPrinter.enable();
        if (success) {
            setIsBtEnabled(true);
            scanPrinters();
        }
    };

    useEffect(() => {
        if (isOpen) {
            scanPrinters();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const hasDevices = printers.paired.length > 0 || printers.unpaired.length > 0;

    return (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                {/* Header */}
                <div className="p-8 bg-gradient-to-br from-slate-900 to-black text-white relative">
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                <Bluetooth size={20} className="text-orange-500 animate-pulse" />
                                Terminal de Impresión
                            </h3>
                            <p className="text-[10px] text-orange-400 uppercase tracking-widest font-black italic mt-1 animate-pulse">Sincronización de Dispositivos Cercanos</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                            <XCircle size={20} />
                        </button>
                    </div>
                </div>

                {/* List Area */}
                <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {!isBtEnabled ? (
                        <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                             <div className="w-24 h-24 bg-orange-100 dark:bg-orange-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-orange-500 border-2 border-orange-200 dark:border-orange-500/20">
                                <Bluetooth size={48} className="animate-pulse" />
                             </div>
                             <div className="space-y-2">
                                <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">Bluetooth Desactivado</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase italic px-10 leading-relaxed">
                                    Para sincronizar la impresora real de RED ENNIER, activa el Bluetooth del dispositivo.
                                </p>
                             </div>
                             <button 
                                onClick={handleEnableBt}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-orange-500 text-white rounded-full font-black uppercase italic tracking-widest text-xs shadow-xl shadow-orange-500/30 active:scale-95 transition-all"
                             >
                                <Play size={16} fill="white" />
                                Activar Ahora
                             </button>
                        </div>
                    ) : hasDevices ? (
                        <div className="space-y-6">
                            {/* Dispositivos Vinculados */}
                            {printers.paired.length > 0 && (
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2 italic">Dispositivos Vinculados</p>
                                    <div className="space-y-2">
                                        {printers.paired.map(p => (
                                            <button 
                                                key={p.address} 
                                                onClick={() => onSelect(p.address, p.name)}
                                                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group
                                                    ${selectedAddress === p.address ? 'border-orange-500 bg-orange-500/5' : 'border-slate-100 dark:border-slate-800 hover:border-orange-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl transition-colors ${selectedAddress === p.address ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500'}`}>
                                                        <Printer size={16} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-black text-slate-900 dark:text-white uppercase italic text-[11px] leading-tight">{p.name || 'Dispositivo'}</p>
                                                        <p className="text-[8px] font-mono text-slate-400 font-bold tracking-widest">{p.address}</p>
                                                    </div>
                                                </div>
                                                {selectedAddress === p.address ? (
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white scale-110">
                                                        <Check size={12} />
                                                    </div>
                                                ) : (
                                                    <ChevronRight size={14} className="text-slate-200 group-hover:text-orange-400 transition-all transform group-hover:translate-x-1" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Nuevos Dispositivos (No vinculados) */}
                            {printers.unpaired.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-700 delay-300">
                                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mb-3 ml-2 italic flex items-center gap-2">
                                        <div className="w-1 h-1 bg-orange-500 rounded-full animate-ping"></div>
                                        Señal Detectada (Emparejar)
                                    </p>
                                    <div className="space-y-2">
                                        {printers.unpaired.map(p => (
                                            <button 
                                                key={p.address} 
                                                onClick={() => onSelect(p.address, p.name)}
                                                className="w-full p-4 rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-900/30 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-400">
                                                        <Bluetooth size={16} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-black text-slate-900 dark:text-white uppercase italic text-[11px] leading-tight">{p.name || 'Desconocido'}</p>
                                                        <p className="text-[8px] font-mono text-slate-400 font-bold tracking-widest">{p.address}</p>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 bg-orange-500 text-white text-[7px] font-black uppercase italic rounded-full shadow-lg shadow-orange-500/20">Vincular</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-16 text-center space-y-6">
                            {isScanning ? (
                                <div className="space-y-4">
                                    <div className="relative w-24 h-24 mx-auto">
                                        <div className="absolute inset-0 border-4 border-orange-500/10 rounded-[2.5rem]"></div>
                                        <div className="absolute inset-0 border-4 border-t-orange-500 rounded-[2.5rem] animate-spin"></div>
                                        <Bluetooth size={32} className="absolute inset-0 m-auto text-orange-500 animate-pulse" />
                                    </div>
                                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] italic">Rastreando dispositivos RED ENNIER...</p>
                                </div>
                            ) : (
                                <div className="space-y-4 opacity-100 animate-in fade-in zoom-in duration-500">
                                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200 dark:text-slate-700">
                                        <Bluetooth size={48} />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest italic mb-1">Sin dispositivos a la vista</p>
                                        <p className="text-[9px] text-slate-300 dark:text-slate-600 font-bold uppercase italic px-10 leading-relaxed">
                                            Asegúrate de tener la impresora encendida y el Bluetooth activo.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <button 
                        onClick={scanPrinters}
                        disabled={isScanning}
                        className="w-full btn-gradient p-5 flex items-center justify-center gap-3 font-black uppercase italic tracking-widest text-sm shadow-xl shadow-orange-500/20 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={isScanning ? 'animate-spin' : ''} />
                        <span>{isScanning ? 'Escaneando...' : 'Buscar Dispositivos Cercanos'}</span>
                    </button>
                    <p className="text-center text-[8px] font-black text-slate-400 dark:text-slate-600 mt-4 uppercase tracking-[0.3em] italic">Compatible con iOS/Android - 58mm Thermal</p>
                </div>
            </div>
        </div>
    );
};

export default PrinterModal;
