import React from 'react'

const Analytics: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Trading Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-title">Total Profit</div>
          <div className="stat-value text-success">+18.3%</div>
          <div className="stat-desc">Last 30 days</div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="stat-title">Win Rate</div>
          <div className="stat-value">68%</div>
          <div className="stat-desc">Increase of 8% from last month</div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="stat-title">Total Trades</div>
          <div className="stat-value">246</div>
          <div className="stat-desc">↗︎ 129 (52%)</div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-title">Avg. Trade Duration</div>
          <div className="stat-value">3h 12m</div>
          <div className="stat-desc">↘︎ 42m from last month</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Profit Distribution</h2>
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="donut-chart"></div>
                <p className="mt-4 opacity-70">Chart showing profit distribution by asset</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Performance Over Time</h2>
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="line-chart"></div>
                <p className="mt-4 opacity-70">Chart showing performance over the last 30 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title">Trading Performance by Bot</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Bot Name</th>
                  <th>Trades</th>
                  <th>Win Rate</th>
                  <th>Profit</th>
                  <th>ROI</th>
                  <th>Drawdown</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>BTCUSD Swing Trader</td>
                  <td>87</td>
                  <td>72%</td>
                  <td className="text-success">+$1,243.51</td>
                  <td className="text-success">8.2%</td>
                  <td>3.4%</td>
                </tr>
                <tr>
                  <td>ETH Breakout Bot</td>
                  <td>64</td>
                  <td>59%</td>
                  <td className="text-success">+$876.22</td>
                  <td className="text-success">5.7%</td>
                  <td>4.1%</td>
                </tr>
                <tr>
                  <td>ADA Position Bot</td>
                  <td>52</td>
                  <td>48%</td>
                  <td className="text-error">-$127.84</td>
                  <td className="text-error">-1.2%</td>
                  <td>6.8%</td>
                </tr>
                <tr>
                  <td>SOL Scalping Bot</td>
                  <td>43</td>
                  <td>81%</td>
                  <td className="text-success">+$593.17</td>
                  <td className="text-success">12.4%</td>
                  <td>2.1%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Trade Duration Analysis</h2>
            <div className="h-60 flex items-center justify-center">
              <div className="text-center">
                <div className="bar-chart"></div>
                <p className="mt-4 opacity-70">Distribution of trade durations</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Trading Hours</h2>
            <div className="h-60 flex items-center justify-center">
              <div className="text-center">
                <div className="heatmap-chart"></div>
                <p className="mt-4 opacity-70">Most active trading hours</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Risk-Reward Ratio</h2>
            <div className="h-60 flex items-center justify-center">
              <div className="text-center">
                <div className="scatter-chart"></div>
                <p className="mt-4 opacity-70">Risk vs. reward for each trade</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Monthly Performance Snapshot</h2>
          <div className="stats shadow stats-vertical lg:stats-horizontal w-full">
            <div className="stat">
              <div className="stat-title">Best Trading Day</div>
              <div className="stat-value text-success">+4.2%</div>
              <div className="stat-desc">March 15, 2023</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Worst Trading Day</div>
              <div className="stat-value text-error">-1.8%</div>
              <div className="stat-desc">March 21, 2023</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Sharpe Ratio</div>
              <div className="stat-value">1.87</div>
              <div className="stat-desc">Good risk-adjusted return</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Profit Factor</div>
              <div className="stat-value">2.24</div>
              <div className="stat-desc">Gross profit / gross loss</div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        {`
        .donut-chart {
          width: 200px;
          height: 200px;
          margin: 0 auto;
          border-radius: 50%;
          background: conic-gradient(
            #4ade80 0% 35%,
            #2dd4bf 35% 57%,
            #818cf8 57% 78%,
            #c084fc 78% 100%
          );
        }
        
        .line-chart {
          width: 100%;
          height: 200px;
          background-image: linear-gradient(0deg, rgba(74, 222, 128, 0.1) 0%, rgba(74, 222, 128, 0) 100%),
                            linear-gradient(90deg, transparent, transparent 10%, #6b7280 10%, #6b7280 11%, transparent 11%);
          position: relative;
          overflow: hidden;
        }
        
        .line-chart::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 200px;
          background-image: linear-gradient(90deg, #4ade80 0%, #4ade80 20%, #3b82f6 80%, #ec4899 100%);
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3E%3Cpath fill='none' stroke='%23000' d='M0,10 Q25,5 50,15 T100,10'/%3E%3C/svg%3E");
          mask-size: 100% 100%;
          mask-repeat: no-repeat;
        }
        
        .bar-chart,
        .heatmap-chart,
        .scatter-chart {
          width: 100%;
          height: 150px;
          background-color: rgba(74, 222, 128, 0.1);
          border-radius: 0.5rem;
        }
        `}
      </style>
    </div>
  )
}

export default Analytics 