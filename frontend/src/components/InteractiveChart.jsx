import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import './InteractiveChart.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  const date = new Date(label);
  const formattedDate = date.toLocaleDateString('ru-RU', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="chart-tooltip">
      <p className="tooltip-date">{formattedDate}</p>
      {payload.map((entry, index) => (
        <p key={index} className="tooltip-value" style={{ color: entry.color }}>
          {entry.name}: <strong>{entry.value?.toFixed(2)}%</strong>
        </p>
      ))}
    </div>
  );
};

export default function InteractiveChart({ 
  data, 
  forecast, 
  showForecast = false,
  title = 'График'
}) {
  const [period, setPeriod] = useState('5y');

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const now = new Date(data[data.length - 1].date);
    let startDate;
    
    switch (period) {
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      case '5y':
        startDate = new Date(now.getFullYear() - 5, now.getMonth(), 1);
        break;
      case '10y':
        startDate = new Date(now.getFullYear() - 10, now.getMonth(), 1);
        break;
      case 'all':
      default:
        startDate = new Date(data[0].date);
    }
    
    return data.filter(d => new Date(d.date) >= startDate);
  }, [data, period]);

  const chartData = useMemo(() => {
    if (!showForecast || !forecast) {
      return filteredData.map(d => ({
        date: d.date,
        value: d.value
      }));
    }
    
    // Combine historical and forecast data
    const historical = filteredData.map(d => ({
      date: d.date,
      value: d.value,
      forecast: null,
      lower: null,
      upper: null
    }));
    
    const forecastData = forecast.map(d => ({
      date: d.date,
      value: null,
      forecast: d.value,
      lower: d.lower,
      upper: d.upper
    }));
    
    // Add last historical point to forecast for continuity
    if (historical.length > 0) {
      const lastHistorical = historical[historical.length - 1];
      forecastData.unshift({
        date: lastHistorical.date,
        value: lastHistorical.value,
        forecast: lastHistorical.value,
        lower: lastHistorical.value,
        upper: lastHistorical.value
      });
    }
    
    return [...historical, ...forecastData.slice(1)];
  }, [filteredData, forecast, showForecast]);

  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    if (period === '1y') {
      return date.toLocaleDateString('ru-RU', { month: 'short' });
    }
    return date.toLocaleDateString('ru-RU', { year: '2-digit', month: 'short' });
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="period-selector">
          <button 
            className={period === '1y' ? 'active' : ''} 
            onClick={() => setPeriod('1y')}
          >
            1 год
          </button>
          <button 
            className={period === '5y' ? 'active' : ''} 
            onClick={() => setPeriod('5y')}
          >
            5 лет
          </button>
          <button 
            className={period === '10y' ? 'active' : ''} 
            onClick={() => setPeriod('10y')}
          >
            10 лет
          </button>
          <button 
            className={period === 'all' ? 'active' : ''} 
            onClick={() => setPeriod('all')}
          >
            Все данные
          </button>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a23b72" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a23b72" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              stroke="var(--text-muted)"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['auto', 'auto']}
              stroke="var(--text-muted)"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={100} stroke="var(--text-muted)" strokeDasharray="5 5" />
            
            {/* Historical data */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#667eea"
              fill="url(#colorValue)"
              strokeWidth={2}
              name="Фактические данные"
              dot={false}
              activeDot={{ r: 6, fill: '#667eea' }}
            />
            
            {/* Forecast confidence interval */}
            {showForecast && (
              <>
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="transparent"
                  fill="#a23b72"
                  fillOpacity={0.1}
                  name="Верхняя граница"
                  dot={false}
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="transparent"
                  fill="var(--bg-primary)"
                  name="Нижняя граница"
                  dot={false}
                  legendType="none"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#a23b72"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Прогноз SARIMA"
                  dot={{ r: 4, fill: '#a23b72' }}
                  activeDot={{ r: 6, fill: '#a23b72' }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {showForecast && (
        <div className="chart-legend-custom">
          <span className="legend-item">
            <span className="legend-line historical"></span>
            Фактические данные
          </span>
          <span className="legend-item">
            <span className="legend-line forecast"></span>
            Прогноз SARIMA
          </span>
          <span className="legend-item">
            <span className="legend-area"></span>
            95% доверительный интервал
          </span>
        </div>
      )}
    </div>
  );
}
