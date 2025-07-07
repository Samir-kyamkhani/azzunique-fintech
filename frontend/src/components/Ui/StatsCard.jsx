import React from 'react'
import {
    Menu,
    Users,
    DollarSign,
    Wallet,
    TrendingUp,
    ArrowDownRight,
    MoreHorizontal,
    Search,
    Bell,
    User,
    RefreshCw,
} from "lucide-react";

function StatsCard({ title, value, icon: Icon, color = "blue", trend, gradient }) {
    return (
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }}></div>
            <div className="relative p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                        {trend && (
                            <div className="flex items-center text-sm">
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-green-600 font-medium">{trend}</span>
                            </div>
                        )}
                    </div>
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StatsCard