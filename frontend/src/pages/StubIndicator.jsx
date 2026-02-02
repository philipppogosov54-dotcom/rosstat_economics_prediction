import { useParams, Link } from 'react-router-dom';
import indicators from '../data/indicators.json';
import './StubIndicator.css';

export default function StubIndicator() {
  const { code } = useParams();
  const indicator = indicators.find(i => i.code === code);

  if (!indicator) {
    return (
      <div className="stub-page">
        <div className="stub-content">
          <h1>404</h1>
          <p>Индикатор не найден</p>
          <Link to="/" className="back-link">← На главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stub-page">
      <div className="stub-header">
        <span className="country-label">🇷🇺 Россия</span>
        <h1 className="stub-title">{indicator.name}</h1>
        <span className="stub-category">{indicator.category}</span>
      </div>

      <div className="stub-preview">
        <div className="preview-card">
          <div className="preview-value">
            <span className="value">{indicator.current.value}</span>
            <span className="unit">{indicator.current.unit}</span>
          </div>
          <span className="preview-date">{indicator.current.date}</span>
        </div>
      </div>

      <div className="stub-content">
        <div className="coming-soon-badge">
          <span className="badge-icon">🚧</span>
          <span className="badge-text">В разработке</span>
        </div>
        
        <h2>Данные скоро будут доступны</h2>
        <p>
          Мы работаем над интеграцией данных по показателю "{indicator.name}". 
          В скором времени здесь появятся исторические данные, интерактивные графики 
          и прогнозы на основе модели SARIMA.
        </p>
        
        <div className="stub-features">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span className="feature-text">Исторические данные</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📈</span>
            <span className="feature-text">Интерактивные графики</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔮</span>
            <span className="feature-text">Прогнозирование</span>
          </div>
        </div>

        <div className="stub-actions">
          <Link to="/" className="btn btn-secondary">
            ← На главную
          </Link>
          <Link to="/indicator/cpi" className="btn btn-primary">
            Посмотреть ИПЦ
          </Link>
        </div>
      </div>

      <div className="stub-placeholder-chart">
        <svg viewBox="0 0 400 150" className="placeholder-svg">
          <defs>
            <linearGradient id="placeholderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path 
            d="M0,100 Q50,80 100,90 T200,70 T300,85 T400,60"
            stroke="var(--accent-primary)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.5"
          />
          <path 
            d="M0,100 Q50,80 100,90 T200,70 T300,85 T400,60 L400,150 L0,150 Z"
            fill="url(#placeholderGradient)"
            opacity="0.3"
          />
        </svg>
      </div>
    </div>
  );
}
