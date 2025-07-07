import React from 'react'

function MiniCard({ title, value, isNegative = false }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="text-center">
                <p className="text-xs font-medium text-gray-500 mb-2">{title}</p>
                <p className={`text-lg font-bold ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
                    {value}
                </p>
            </div>
        </div>

    )
}

export default MiniCard