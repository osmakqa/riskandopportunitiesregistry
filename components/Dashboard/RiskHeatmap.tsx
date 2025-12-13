
import React from 'react';
import { Activity } from 'lucide-react';
import { RegistryItem } from '../../lib/types';

const RiskHeatmap = ({ items }: { items: RegistryItem[] }) => {
    const matrix = Array(5).fill(0).map(() => Array(5).fill(0));
    
    items.filter(i => i.type === 'RISK').forEach(item => {
        if (item.likelihood && item.severity) {
            const row = 5 - item.likelihood;
            const col = item.severity - 1;
            matrix[row][col]++;
        }
    });

    const getCellColor = (l: number, s: number, count: number) => {
        const rating = l * s;
        let baseColor = '';
        if (rating >= 16) baseColor = 'bg-red-100 text-red-800 border-red-200';
        else if (rating >= 11) baseColor = 'bg-orange-100 text-orange-800 border-orange-200';
        else if (rating >= 6) baseColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        else baseColor = 'bg-green-100 text-green-800 border-green-200';

        if (count > 0) {
           if (rating >= 16) return 'bg-red-500 text-white font-bold';
           if (rating >= 11) return 'bg-orange-500 text-white font-bold';
           if (rating >= 6) return 'bg-yellow-400 text-black font-bold';
           return 'bg-green-500 text-white font-bold';
        }
        return baseColor + ' opacity-40';
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Activity size={20}/> Risk Matrix Heatmap</h3>
            <div className="flex">
                <div className="flex flex-col justify-between mr-4 py-8 h-64">
                    <span className="text-xs font-bold text-gray-400 -rotate-90">Likelihood</span>
                </div>
                <div className="flex-1">
                    <div className="grid grid-rows-5 gap-1 h-64">
                        {[5, 4, 3, 2, 1].map((likelihood, rowIndex) => (
                            <div key={likelihood} className="grid grid-cols-5 gap-1">
                                {[1, 2, 3, 4, 5].map((severity, colIndex) => {
                                    const count = matrix[rowIndex][colIndex];
                                    return (
                                        <div 
                                            key={`${likelihood}-${severity}`} 
                                            className={`rounded flex items-center justify-center text-sm transition hover:opacity-100 cursor-default ${getCellColor(likelihood, severity, count)}`}
                                            title={`L:${likelihood} x S:${severity} = ${likelihood * severity}`}
                                        >
                                            {count > 0 && count}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-5 mt-2 text-center text-xs font-bold text-gray-400">
                        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                    </div>
                    <div className="text-center mt-1 text-xs font-bold text-gray-400">Severity</div>
                </div>
            </div>
        </div>
    )
}

export default RiskHeatmap;
