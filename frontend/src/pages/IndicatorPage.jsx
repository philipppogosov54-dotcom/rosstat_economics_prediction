import { useState } from 'react';
import { IndicatorCard, InteractiveChart, DataTable } from '../components';
import cpiData from '../data/cpi.json';
import './IndicatorPage.css';

export default function IndicatorPage() {
  const [showForecast, setShowForecast] = useState(true);
  
  return (
    <div className="indicator-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <span className="country-label">🇷🇺 Россия</span>
          <h1 className="page-title">{cpiData.name}</h1>
          <p className="page-subtitle">{cpiData.nameEn}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <section className="metrics-section">
        <div className="metrics-grid">
          <IndicatorCard 
            label="Текущее значение"
            value={cpiData.current.value}
            unit="%"
            change={cpiData.current.change}
            variant="1"
          />
          <IndicatorCard 
            label="Предыдущий месяц"
            value={cpiData.previous.value}
            unit="%"
            variant="2"
          />
          <IndicatorCard 
            label="Прогноз (дек. 2025)"
            value={cpiData.forecast[0].value}
            unit="%"
            change={cpiData.forecast[0].value - cpiData.current.value}
            variant="3"
          />
        </div>
      </section>

      {/* Chart Section */}
      <section className="chart-section">
        <div className="chart-controls">
          <label className="forecast-toggle">
            <input 
              type="checkbox" 
              checked={showForecast} 
              onChange={(e) => setShowForecast(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Показать прогноз</span>
          </label>
        </div>
        
        <InteractiveChart 
          data={cpiData.data}
          forecast={cpiData.forecast}
          showForecast={showForecast}
          title={`${cpiData.name} | ${cpiData.frequency}`}
        />
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="info-grid">
          <div className="info-card">
            <h3>О показателе</h3>
            <p>{cpiData.description}</p>
            <p className="methodology">{cpiData.methodology}</p>
          </div>
          
          <div className="info-card stats-card">
            <h3>Статистика</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Максимум</span>
                <span className="stat-value">{cpiData.stats.highest.value}%</span>
                <span className="stat-date">
                  {new Date(cpiData.stats.highest.date).toLocaleDateString('ru-RU', { 
                    month: 'short', year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Минимум</span>
                <span className="stat-value">{cpiData.stats.lowest.value}%</span>
                <span className="stat-date">
                  {new Date(cpiData.stats.lowest.date).toLocaleDateString('ru-RU', { 
                    month: 'short', year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Среднее</span>
                <span className="stat-value">{cpiData.stats.average.toFixed(2)}%</span>
                <span className="stat-date">1991-2025</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="source-info">
          <span className="source-label">Источник:</span>
          <a href={cpiData.sourceUrl} target="_blank" rel="noopener noreferrer">
            {cpiData.source}
          </a>
          <span className="frequency-label">Периодичность: {cpiData.frequency}</span>
        </div>
      </section>

      {/* Forecast Table */}
      {showForecast && (
        <section className="forecast-section">
          <h2 className="section-title">Прогноз SARIMA на 12 месяцев</h2>
          <div className="forecast-table-wrapper">
            <table className="forecast-table">
              <thead>
                <tr>
                  <th>Месяц</th>
                  <th>Прогноз</th>
                  <th>Нижняя граница (95%)</th>
                  <th>Верхняя граница (95%)</th>
                </tr>
              </thead>
              <tbody>
                {cpiData.forecast.map(item => (
                  <tr key={item.date}>
                    <td>
                      {new Date(item.date).toLocaleDateString('ru-RU', { 
                        month: 'long', year: 'numeric' 
                      })}
                    </td>
                    <td className="forecast-value">{item.value.toFixed(2)}%</td>
                    <td>{item.lower.toFixed(2)}%</td>
                    <td>{item.upper.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Historical Data Table */}
      <section className="data-section">
        <DataTable 
          data={cpiData.data}
          title="Исторические данные"
        />
      </section>
    </div>
  );
}
