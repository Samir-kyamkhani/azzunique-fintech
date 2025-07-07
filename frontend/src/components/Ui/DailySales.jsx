import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Sample data
const dailySalesData = [
    { name: "REMITTANCE", value: 4026.05 },
    { name: "SETTLEMENT", value: 25000 },
    { name: "AEPS", value: 0 },
];

function DailySales() {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Daily Sales</h3>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <BarChart
                    data={dailySalesData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        wrapperClassName="rounded-lg shadow-md"
                        contentStyle={{ fontSize: 14, borderRadius: 8 }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default DailySales;
