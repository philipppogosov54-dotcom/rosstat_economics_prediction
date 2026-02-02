import './IndicatorCard.css';

export default function IndicatorCard({ label, value, unit = '', change, variant = 'default' }) {
  const getChangeClass = () => {
    if (change === undefined || change === null) return '';
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const formatChange = () => {
    if (change === undefined || change === null) return null;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className={`indicator-card variant-${variant}`}>
      <span className="indicator-label">{label}</span>
      <span className="indicator-value">
        {typeof value === 'number' ? value.toFixed(2) : value}
        {unit && <span className="indicator-unit">{unit}</span>}
      </span>
      {change !== undefined && change !== null && (
        <span className={`indicator-change ${getChangeClass()}`}>
          {getChangeClass() === 'positive' && '↑'}
          {getChangeClass() === 'negative' && '↓'}
          {getChangeClass() === 'neutral' && '→'}
          {' '}{formatChange()}
        </span>
      )}
    </div>
  );
}
