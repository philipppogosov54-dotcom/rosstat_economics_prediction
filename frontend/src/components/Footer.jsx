import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <span className="footer-logo">📊 RuStats</span>
            <p className="footer-desc">
              Демонстрационный проект анализа экономических показателей России
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <h4>Индикаторы</h4>
              <ul>
                <li><a href="/indicator/cpi">Индекс потребительских цен</a></li>
                <li><a href="/indicator/unemployment">Безработица</a></li>
                <li><a href="/indicator/key-rate">Ключевая ставка</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Источники</h4>
              <ul>
                <li><a href="https://rosstat.gov.ru" target="_blank" rel="noopener noreferrer">Росстат</a></li>
                <li><a href="https://cbr.ru" target="_blank" rel="noopener noreferrer">ЦБ РФ</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2025 RuStats Demo. Данные: Росстат</p>
          <p className="footer-tech">React + Vite + Recharts</p>
        </div>
      </div>
    </footer>
  );
}
