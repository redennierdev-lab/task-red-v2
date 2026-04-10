import React, { useState, useEffect } from 'react';
import { Bluetooth, Settings2, Printer, Trash2, Check, RefreshCw, ChevronRight, Save, RotateCcw, Wifi } from 'lucide-react';
import BluetoothPrinter from '../features/printer/services/BluetoothPrinter';


const Parametros = () => {
    // Bluetooth settings
    const [printerAddress, setPrinterAddress] = useState(localStorage.getItem('printer_address') || '');
    const [printerName, setPrinterName] = useState(localStorage.getItem('printer_name') || '');
    const [paperWidth, setPaperWidth] = useState(localStorage.getItem('printer_paper_width') || '58');
    const [encoding, setEncoding] = useState(localStorage.getItem('printer_encoding') || 'UTF-8');
    const [copies, setCopies] = useState(parseInt(localStorage.getItem('printer_copies') || '1'));
    const [cutPaper, setCutPaper] = useState(localStorage.getItem('printer_cut') !== 'false');
    const [openDrawer, setOpenDrawer] = useState(localStorage.getItem('printer_drawer') === 'true');

    const [pairedDevices, setPairedDevices] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [testStatus, setTestStatus] = useState(null); // null | 'success' | 'error'
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        scanPaired();
    }, []);

    const scanPaired = async () => {
        setIsScanning(true);
        try {
            const ready = await BluetoothPrinter.prepareSystem();
            if (ready) {
                const paired = await BluetoothPrinter.listDevices();
                setPairedDevices(paired || []);
            }
        } catch (e) {
            console.warn('No se pudo escanear:', e);
        }
        setIsScanning(false);
    };

    const selectDevice = (address, name) => {
        setPrinterAddress(address);
        setPrinterName(name || 'Impresora');
    };

    const saveSettings = () => {
        localStorage.setItem('printer_address', printerAddress);
        localStorage.setItem('printer_name', printerName);
        localStorage.setItem('printer_paper_width', paperWidth);
        localStorage.setItem('printer_encoding', encoding);
        localStorage.setItem('printer_copies', copies.toString());
        localStorage.setItem('printer_cut', cutPaper.toString());
        localStorage.setItem('printer_drawer', openDrawer.toString());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const clearDevice = () => {
        setPrinterAddress('');
        setPrinterName('');
        localStorage.removeItem('printer_address');
        localStorage.removeItem('printer_name');
    };

    const testPrint = async () => {
        if (!printerAddress) {
            alert('Selecciona una impresora primero.');
            return;
        }
        setTestStatus(null);
        const connected = await BluetoothPrinter.connect(printerAddress);
        if (connected) {
            const testText = [
                '================================',
                '  RED ENNIER - PRUEBA DE IMPRESION ',
                '================================',
                `Impresora : ${printerName}`,
                `Ancho     : ${paperWidth}mm`,
                `Copias    : ${copies}`,
                '================================',
                '   SISTEMA OPERATIVO CORRECTO   ',
                '================================',
                '\n\n',
            ].join('\n');
            const ok = await BluetoothPrinter.printRaw(testText);
            await BluetoothPrinter.disconnect();
            setTestStatus(ok ? 'success' : 'error');
        } else {
            setTestStatus('error');
        }
    };

    return (
        <div className="space-y-6 page-transition">
            {/* MD3 Header */}
            <div className="view-header">
                <div className="flex items-center gap-4">
                    <div className="brand-icon">
                        <Settings2 size={24} />
                    </div>
                    <div>
                        <h1 className="view-title">Parámetros</h1>
                        <p className="view-subtitle">Configuración del Sistema · Impresión Bluetooth</p>
                    </div>
                </div>
            </div>

            {/* Sección 1: Dispositivo Bluetooth */}
            <div className="premium-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 flex items-center gap-2 italic">
                        <Bluetooth size={14}/> Dispositivo de Impresión
                    </h3>
                    <button
                        onClick={scanPaired}
                        disabled={isScanning}
                        className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest italic hover:text-indigo-500 transition-colors"
                    >
                        <RefreshCw size={11} className={isScanning ? 'animate-spin' : ''} />
                        {isScanning ? 'Buscando...' : 'Actualizar'}
                    </button>
                </div>

                {/* Impresora activa */}
                {printerAddress ? (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border-2 border-emerald-200 dark:border-emerald-500/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                <Printer size={18}/>
                            </div>
                            <div>
                                <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase italic">{printerName}</p>
                                <p className="text-[8px] font-mono text-emerald-600/70 dark:text-emerald-500/70 tracking-widest">{printerAddress}</p>
                            </div>
                        </div>
                        <button onClick={clearDevice} className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10">
                            <Trash2 size={14}/>
                        </button>
                    </div>
                ) : (
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase italic tracking-widest">Sin impresora seleccionada</p>
                    </div>
                )}

                {/* Lista de dispositivos vinculados */}
                {pairedDevices.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Dispositivos Detectados</p>
                        {pairedDevices.map(d => (
                            <button
                                key={d.address}
                                onClick={() => selectDevice(d.address, d.name)}
                                className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between
                                    ${printerAddress === d.address
                                        ? 'border-indigo-500 bg-orange-50 dark:bg-indigo-500/5'
                                        : 'border-slate-100 dark:border-slate-800 hover:border-orange-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Bluetooth size={14} className="text-indigo-500"/>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-700 dark:text-white uppercase italic">{d.name || 'Dispositivo'}</p>
                                        <p className="text-[8px] font-mono text-slate-400 tracking-widest">{d.address}</p>
                                    </div>
                                </div>
                                {printerAddress === d.address
                                    ? <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white"/></div>
                                    : <ChevronRight size={14} className="text-slate-300"/>}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sección 2: Configuración de Papel */}
            <div className="premium-card p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 flex items-center gap-2 italic">
                    <Printer size={14}/> Configuración de Papel
                </h3>

                {/* Ancho de papel */}
                <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">Ancho de Papel</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['58', '76', '80'].map(w => (
                            <button
                                key={w}
                                onClick={() => setPaperWidth(w)}
                                className={`py-2.5 rounded-2xl border-2 text-[9px] font-black uppercase italic transition-all
                                    ${paperWidth === w
                                        ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                        : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-orange-200'}`}
                            >
                                {w}mm
                            </button>
                        ))}
                    </div>
                </div>

                {/* Codificación */}
                <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">Codificación de Texto</label>
                    <select
                        value={encoding}
                        onChange={e => setEncoding(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-black text-slate-700 dark:text-white outline-none focus:border-indigo-500 transition-all"
                    >
                        <option value="UTF-8">UTF-8 (Recomendado)</option>
                        <option value="CP1252">CP1252 (Windows)</option>
                        <option value="ISO-8859-1">ISO-8859-1 (Latin)</option>
                    </select>
                </div>

                {/* Número de copias */}
                <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">Número de Copias</label>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setCopies(Math.max(1, copies - 1))} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white font-black text-xl hover:bg-orange-50 dark:hover:bg-indigo-500/10 transition-all">-</button>
                        <span className="flex-1 text-center text-2xl font-black text-slate-800 dark:text-white italic">{copies}</span>
                        <button onClick={() => setCopies(Math.min(5, copies + 1))} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white font-black text-xl hover:bg-orange-50 dark:hover:bg-indigo-500/10 transition-all">+</button>
                    </div>
                </div>

                {/* Opciones adicionales */}
                <div className="space-y-3">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Opciones Adicionales</label>
                    {[
                        { label: 'Corte Automático de Papel', value: cutPaper, setter: setCutPaper },
                        { label: 'Abrir Cajón Monedero', value: openDrawer, setter: setOpenDrawer },
                    ].map(opt => (
                        <div key={opt.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase italic">{opt.label}</span>
                            <button
                                onClick={() => opt.setter(!opt.value)}
                                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${opt.value ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${opt.value ? 'translate-x-6' : 'translate-x-0'}`}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sección 3: Acciones */}
            <div className="space-y-3">
                {/* Test Print */}
                <button
                    onClick={testPrint}
                    className="w-full btn-gradient py-4 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest italic shadow-xl shadow-indigo-500/20"
                >
                    <Printer size={18}/>
                    Imprimir Ticket de Prueba
                </button>

                {testStatus && (
                    <div className={`w-full py-3 rounded-2xl text-center text-[10px] font-black uppercase italic tracking-widest border-2 ${testStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                        {testStatus === 'success' ? '✅ Impresión exitosa — Impresora funcionando correctamente' : '❌ Error de impresión — Verifica conexión Bluetooth'}
                    </div>
                )}

                {/* Guardar */}
                <button
                    onClick={saveSettings}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest italic transition-all
                        ${saved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                    {saved ? <><Check size={18}/> Guardado</> : <><Save size={18}/> Guardar Configuración</>}
                </button>
            </div>

            {/* Info Footer */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
                    Red Ennier Task System — Bluetooth v3.0 — Compatible con impresoras térmicas 58/76/80mm
                </p>
            </div>
        </div>
    );
};

export default Parametros;
