import { useState, useMemo } from 'react';
import './DataTable.css';

export default function DataTable({ data, title = 'Данные' }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchYear, setSearchYear] = useState('');
  const itemsPerPage = 12;

  // Sort data by date descending (newest first)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data]);

  // Filter by year
  const filteredData = useMemo(() => {
    if (!searchYear) return sortedData;
    return sortedData.filter(d => d.date.startsWith(searchYear));
  }, [sortedData, searchYear]);

  // Calculate change from previous month
  const dataWithChange = useMemo(() => {
    return filteredData.map((item, index) => {
      const prevIndex = index + 1;
      const prevValue = filteredData[prevIndex]?.value;
      const change = prevValue ? item.value - prevValue : null;
      return { ...item, change };
    });
  }, [filteredData]);

  // Pagination
  const totalPages = Math.ceil(dataWithChange.length / itemsPerPage);
  const paginatedData = dataWithChange.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const years = useMemo(() => {
    const yearsSet = new Set(data.map(d => d.date.slice(0, 4)));
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [data]);

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h3 className="table-title">{title}</h3>
        <div className="table-controls">
          <select 
            value={searchYear} 
            onChange={(e) => {
              setSearchYear(e.target.value);
              setCurrentPage(1);
            }}
            className="year-select"
          >
            <option value="">Все годы</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <span className="data-count">
            Показано: {paginatedData.length} из {filteredData.length}
          </span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Значение</th>
              <th>Изменение</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={item.date}>
                <td className="date-cell">{formatDate(item.date)}</td>
                <td className="value-cell">{item.value.toFixed(2)}%</td>
                <td className={`change-cell ${
                  item.change > 0 ? 'positive' : 
                  item.change < 0 ? 'negative' : ''
                }`}>
                  {item.change !== null ? (
                    <>
                      {item.change > 0 ? '↑' : item.change < 0 ? '↓' : '→'}
                      {' '}{Math.abs(item.change).toFixed(2)}%
                    </>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ««
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            «
          </button>
          <span className="pagination-info">
            Страница {currentPage} из {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            »
          </button>
          <button 
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            »»
          </button>
        </div>
      )}
    </div>
  );
}
