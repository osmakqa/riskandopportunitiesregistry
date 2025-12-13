
import React from 'react';
import { DonutChartProps } from '../../lib/types';

const DonutChart = ({ title, data, colors }: DonutChartProps) => {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    let currentAngle = 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-600 mb-4 w-full text-left">{title}</h3>
            <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {Object.entries(data).map(([key, value]) => {
                        if (value === 0) return null;
                        const percentage = value / total;
                        const angle = percentage * 360;
                        const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                        const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                        const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                        const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                        
                        const largeArcFlag = percentage > 0.5 ? 1 : 0;
                        
                        const pathData = total === value 
                            ? `M 50 10 A 40 40 0 1 1 49.99 10`
                            : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                        const slice = (
                            <path
                                key={key}
                                d={pathData}
                                fill={colors[key] || '#ccc'}
                                stroke="white"
                                strokeWidth="2"
                            />
                        );
                        currentAngle += angle;
                        return slice;
                    })}
                    {total === 0 && (
                        <circle cx="50" cy="50" r="40" fill="#f3f4f6" />
                    )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800">{total}</span>
                        <span className="text-[10px] text-gray-400 uppercase">Total</span>
                    </div>
                </div>
            </div>
            <div className="mt-6 w-full space-y-2">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[key] }}></span>
                            <span className="text-gray-600">{key}</span>
                        </div>
                        <span className="font-bold text-gray-800">{value} ({total > 0 ? Math.round((value/total)*100) : 0}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart;
