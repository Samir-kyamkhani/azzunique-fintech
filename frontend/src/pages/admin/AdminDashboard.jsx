import React from 'react'
import StatsCard from '../../components/Ui/StatsCard.jsx'
import {
  Wallet,
  RefreshCw,
  TrendingUp,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Users,
  X,
  ShoppingCart,
  Banknote,
} from "lucide-react"
import DailySales from '../../components/Ui/DailySales.jsx'
import { dailySalesData, SalesActivity } from '../../index.js'

const gradientColors = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-pink-500 to-pink-700",
  "from-yellow-500 to-yellow-600",
  "from-green-500 to-green-700",
  "from-red-500 to-red-600",
  "from-indigo-500 to-indigo-700",
  "from-orange-500 to-orange-600",
  "from-gray-500 to-gray-700",
  "from-teal-500 to-teal-700",
  "from-cyan-500 to-cyan-700",
]

export default function AdminDashboard() {
  return (
    <section className='flex flex-col space-y-12'>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Main Wallets" value="₹253972.05" icon={Wallet} gradient={gradientColors[0]} />
        <StatsCard title="Aeps Wallet" value="₹0" icon={CreditCard} gradient={gradientColors[1]} />
        <StatsCard title="Team Wallet Transfer" value="₹150000" icon={RefreshCw} gradient={gradientColors[2]} />
        <StatsCard title="Team Revert Transfer" value="₹0" icon={ArrowDownRight} gradient={gradientColors[3]} />
        <StatsCard title="Total Purchase" value="₹0" icon={ShoppingCart} gradient={gradientColors[4]} />
        <StatsCard title="Failed" value="₹115404.3" icon={X} gradient={gradientColors[5]} />
        <StatsCard title="Commission" value="₹1544.71" icon={DollarSign} gradient={gradientColors[6]} />
        <StatsCard title="Commission Given" value="₹626.61" icon={Banknote} gradient={gradientColors[7]} />
        <StatsCard title="Pending" value="₹0" icon={TrendingUp} gradient={gradientColors[8]} />
        <StatsCard title="Sales" value="₹297930.37" icon={TrendingUp} gradient={gradientColors[9]} />
        <StatsCard title="Customer" value="28" icon={Users} gradient={gradientColors[10]} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <DailySales data={dailySalesData} title={'Daily Sales'} />
        <DailySales data={SalesActivity} barColor="#10B981" title={'Sales Activity'} />
      </div>
    </section>
  )
}
