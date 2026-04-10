import React from 'react';
import { db } from '../../../services/database';



const ReciboTicket = ({ data, cliente }) => {
    if (!data) return null;

    return (
        <div id="thermal-receipt" className="hidden print:block bg-white text-black p-4 w-[300px] mx-auto font-mono text-[12px]">
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-4 mt-2">
                <h1 className="text-xl font-black uppercase tracking-tighter mb-1">RED ENNIER C.A</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest">RIF J-502342257</p>
                <p className="text-[8px] mt-1 opacity-70 italic tracking-widest">"Excelencia en cada despliegue"</p>
            </div>

            {/* Receipt Info */}
            <div className="mb-4">
                <div className="flex justify-between font-black uppercase text-[10px]">
                    <span>COMPROBANTE:</span>
                    <span>#{data.ticket_id || data.id}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>FECHA:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>HORA:</span>
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Client Info */}
            <div className="border-t border-dashed border-black pt-4 mb-4">
                <h2 className="text-[10px] font-black uppercase mb-1">DATOS DEL CLIENTE:</h2>
                <p className="text-[14px] font-black uppercase leading-tight mb-1">{cliente?.nombre || 'CLIENTE FINAL'}</p>
                <p className="text-[10px] mb-1">TEL: {cliente?.telefono || 'N/A'}</p>
                <div className="text-[9px] uppercase leading-tight opacity-80">
                    DIRECCIÓN: {cliente?.direccion || 'S/D'}
                </div>
            </div>

            {/* Task Details */}
            <div className="border-t border-dashed border-black pt-4 mb-4">
                <h2 className="text-[10px] font-black uppercase mb-1">DETALLE SERVICIO:</h2>
                <p className="text-[12px] font-black uppercase leading-tight mb-2">{data.titulo}</p>
                <p className="text-[10px] leading-tight italic mb-3">"{data.descripcion}"</p>
                
                <div className="flex justify-between items-end border-t border-black pt-2">
                    <span className="font-black text-[10px] uppercase">TOTAL ABONADO:</span>
                    <span className="text-2xl font-black italic underline">${data.monto || '0.00'}</span>
                </div>
                <div className="text-right text-[8px] font-black uppercase mt-1">Moneda: Dólares (USD)</div>
            </div>

            {/* Verification / Signature Area */}
            <div className="mt-8 pt-8 border-t border-black text-center">
                <div className="border-b border-black w-32 mx-auto mb-2 h-4"></div>
                <p className="text-[8px] font-black uppercase">Firma del Cliente</p>
            </div>

            {/* Footer / QR Placeholder */}
            <div className="mt-10 text-center">
                <div className="w-16 h-16 border-2 border-black mx-auto mb-4 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-0.5">
                        <div className="w-4 h-4 bg-black"></div>
                        <div className="w-4 h-4 bg-black"></div>
                        <div className="w-4 h-4 bg-black"></div>
                        <div className="w-4 h-4 bg-slate-200"></div>
                    </div>
                </div>
                <p className="text-[10px] font-black uppercase italic mb-1">¡Gracias por su confianza!</p>
                <p className="text-[8px] uppercase tracking-[0.2em] font-medium">REDENNIER.COM</p>
            </div>

            {/* Serial / Audit Info */}
            <div className="mt-6 text-center text-[6px] uppercase opacity-40">
                AUDIT_ID: {Math.random().toString(36).substring(7).toUpperCase()} - LOCAL_STORAGE_DB
            </div>
        </div>
    );
};

export default ReciboTicket;
