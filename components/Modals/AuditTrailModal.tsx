
import React from 'react';
import { PlusCircle, CheckCircle2, Pencil, RotateCcw, Activity, XCircle } from 'lucide-react';
import { AuditEvent } from '../../lib/types';

export const AuditTrailModal = ({ trail, onClose, itemId }: { trail: AuditEvent[], onClose: () => void, itemId: string }) => {
    const getIcon = (event: string) => {
        if (event.includes('Created')) return <PlusCircle size={16} className="text-blue-500" />;
        if (event.includes('Closed') || event.includes('Verified')) return <CheckCircle2 size={16} className="text-green-500" />;
        if (event.includes('Edited')) return <Pencil size={16} className="text-yellow-500" />;
        if (event.includes('Reopened')) return <RotateCcw size={16} className="text-orange-500" />;
        return <Activity size={16} className="text-gray-500" />;
    };

    const formatTimestamp = (ts: string) => {
        try {
            const date = new Date(ts);
            if (isNaN(date.getTime())) return ts;
            return date.toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'numeric', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
        } catch {
            return ts;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Audit Trail for: <span className="font-mono text-osmak-green">{itemId}</span></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={24}/></button>
                </div>
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="relative pl-8">
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                        <div className="space-y-8">
                            {[...trail].reverse().map((event, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute -left-8 top-1 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                                        {getIcon(event.event)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{event.event}</h3>
                                        <p className="text-sm text-gray-500">
                                            by <span className="font-medium text-gray-700">{event.user}</span> on {formatTimestamp(event.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
