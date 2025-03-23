import React from 'react'

interface BotCardProps {
  name: string
  status: 'active' | 'paused' | 'error'
  profit: number
  trades: number
  winRate: number
}

const BotCard: React.FC<BotCardProps> = ({ name, status, profit, trades, winRate }) => {
  const statusColors = {
    active: 'bg-success',
    paused: 'bg-warning',
    error: 'bg-error'
  }
  
  const profitClass = profit >= 0 ? 'text-success' : 'text-error'
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">{name}</h2>
          <div className="flex items-center gap-2">
            <div className={`badge ${statusColors[status]}`}>{status}</div>
          </div>
        </div>
        
        <div className="stats shadow mt-4">
          <div className="stat place-items-center">
            <div className="stat-title">Profit</div>
            <div className={`stat-value ${profitClass}`}>{profit > 0 ? '+' : ''}{profit}%</div>
          </div>
          
          <div className="stat place-items-center">
            <div className="stat-title">Trades</div>
            <div className="stat-value">{trades}</div>
          </div>
          
          <div className="stat place-items-center">
            <div className="stat-title">Win Rate</div>
            <div className="stat-value">{winRate}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Dashboard: React.FC = () => {
  const bots = [
    { id: 1, name: 'BTCUSD Swing Trader', status: 'active' as const, profit: 2.3, trades: 12, winRate: 75 },
    { id: 2, name: 'ETH Breakout Bot', status: 'active' as const, profit: 1.7, trades: 8, winRate: 62 },
    { id: 3, name: 'ADA Position Bot', status: 'paused' as const, profit: -0.4, trades: 5, winRate: 40 },
    { id: 4, name: 'SOL Scalping Bot', status: 'error' as const, profit: 0, trades: 0, winRate: 0 }
  ]
  
  // Summary data
  const totalProfit = bots.reduce((acc, bot) => acc + bot.profit, 0).toFixed(2)
  const activeBots = bots.filter(bot => bot.status === 'active').length
  const totalTrades = bots.reduce((acc, bot) => acc + bot.trades, 0)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-title">Today&apos;s Profit</div>
          <div className={`stat-value ${Number(totalProfit) >= 0 ? 'text-success' : 'text-error'}`}>
            {Number(totalProfit) > 0 ? '+' : ''}{totalProfit}%
          </div>
          <div className="stat-desc">Since last trading day</div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="stat-title">Active Bots</div>
          <div className="stat-value">{activeBots}/{bots.length}</div>
          <div className="stat-desc">Running trading systems</div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="stat-title">Total Trades</div>
          <div className="stat-value">{totalTrades}</div>
          <div className="stat-desc">Completed today</div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-6">Your Trading Bots</h2>
      
      {/* Bot Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bots.map(bot => (
          <BotCard 
            key={bot.id}
            name={bot.name}
            status={bot.status}
            profit={bot.profit}
            trades={bot.trades}
            winRate={bot.winRate}
          />
        ))}
      </div>
      
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Market Overview</h2>
          <p>Today&apos;s market is showing moderate volatility with BTC consolidating around support levels.</p>
          <div className="alert alert-info mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Trading conditions are favorable. Consider increasing position sizes for active bots.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 