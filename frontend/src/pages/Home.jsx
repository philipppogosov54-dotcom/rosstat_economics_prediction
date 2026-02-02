import { Link } from 'react-router-dom';
import indicators from '../data/indicators.json';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">
          Экономические индикаторы
          <span className="hero-country">России</span>
        </h1>
        <p className="hero-subtitle">
          Анализ и прогнозирование макроэкономических показателей на основе данных Росстата
        </p>
        <div className="hero-badges">
          <span className="badge">📊 Исторические данные с 1991 года</span>
          <span className="badge">🔮 SARIMA прогнозирование</span>
          <span className="badge">📈 Интерактивные графики</span>
        </div>
      </section>

      <section className="indicators-section">
        <h2 className="section-title">Доступные индикаторы</h2>
        <div className="indicators-grid">
          {indicators.map(indicator => (
            <Link 
              to={`/indicator/${indicator.code}`} 
              key={indicator.code}
              className={`indicator-tile ${!indicator.active ? 'disabled' : ''}`}
            >
              <div className="tile-header">
                <span className="tile-category">{indicator.category}</span>
                {!indicator.active && <span className="coming-soon">Скоро</span>}
              </div>
              <h3 className="tile-name">{indicator.name}</h3>
              <div className="tile-value">
                <span className="value">{indicator.current.value}</span>
                <span className="unit">{indicator.current.unit}</span>
              </div>
              <div className="tile-meta">
                <span className={`change ${indicator.current.change >= 0 ? 'positive' : 'negative'}`}>
                  {indicator.current.change >= 0 ? '↑' : '↓'} 
                  {Math.abs(indicator.current.change)}%
                </span>
                <span className="date">{indicator.current.date}</span>
              </div>
              <p className="tile-desc">{indicator.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-card">
          <h2>О проекте</h2>
          <p>
            RuStats — демонстрационный проект для анализа экономических показателей России.
            Данные получены из открытых источников Росстата и обработаны с использованием
            статистических моделей временных рядов (SARIMA).
          </p>
          <div className="tech-stack">
            <span className="tech-badge">React</span>
            <span className="tech-badge">Recharts</span>
            <span className="tech-badge">Python</span>
            <span className="tech-badge">SARIMA</span>
            <span className="tech-badge">Docker</span>
          </div>
        </div>
      </section>
    </div>
  );
}
