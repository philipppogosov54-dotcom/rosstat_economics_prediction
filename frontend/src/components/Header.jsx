import { Link, NavLink } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">📊</span>
          <span className="logo-text">RuStats</span>
          <span className="logo-badge">DEMO</span>
        </Link>
        
        <nav className="nav">
          <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Главная
          </NavLink>
          <NavLink to="/indicator/cpi" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            ИПЦ
          </NavLink>
          <NavLink to="/indicator/unemployment" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Безработица
          </NavLink>
          <NavLink to="/indicator/key-rate" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Ключевая ставка
          </NavLink>
        </nav>

        <div className="header-actions">
          <span className="country-badge">
            <span className="flag">🇷🇺</span>
            Россия
          </span>
        </div>
      </div>
    </header>
  );
}
