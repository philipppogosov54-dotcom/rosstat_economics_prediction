#!/usr/bin/env python3
"""
Интерактивный дашборд для анализа ИПЦ России
SARIMA прогнозирование с визуализацией
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.graphics.tsaplots import acf, pacf
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

# Конфигурация страницы
st.set_page_config(
    page_title="ИПЦ России | Аналитика",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Кастомные стили — Премиум дизайн
st.markdown("""
<style>
    /* Основные заголовки */
    .main-header {
        font-size: 2.8rem;
        font-weight: 800;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-align: center;
        margin-bottom: 0.5rem;
        letter-spacing: -0.5px;
    }
    .sub-header {
        font-size: 1.15rem;
        color: #64748b;
        text-align: center;
        margin-bottom: 2.5rem;
        font-weight: 400;
    }
    
    /* Стилизация метрик — градиентные карточки */
    div[data-testid="stMetric"] {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem 1.2rem;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
        border: none;
        transition: all 0.3s ease;
    }
    
    div[data-testid="stMetric"]:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(102, 126, 234, 0.35);
    }
    
    /* Текст метрик — белый для контраста */
    div[data-testid="stMetricLabel"] {
        color: rgba(255, 255, 255, 0.95) !important;
        font-size: 0.875rem !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.5rem;
    }
    
    div[data-testid="stMetricValue"] {
        color: #ffffff !important;
        font-size: 2.2rem !important;
        font-weight: 800 !important;
        line-height: 1.2;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    div[data-testid="stMetricDelta"] {
        color: rgba(255, 255, 255, 0.9) !important;
        font-size: 0.9rem !important;
        font-weight: 600 !important;
    }
    
    /* Альтернативные цвета для метрик */
    div[data-testid="column"]:nth-child(1) div[data-testid="stMetric"] {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    div[data-testid="column"]:nth-child(2) div[data-testid="stMetric"] {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    div[data-testid="column"]:nth-child(3) div[data-testid="stMetric"] {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    
    div[data-testid="column"]:nth-child(4) div[data-testid="stMetric"] {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
    
    div[data-testid="column"]:nth-child(5) div[data-testid="stMetric"] {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
    
    /* Стилизация сайдбара — темная тема для контраста */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    }
    
    section[data-testid="stSidebar"] * {
        color: #e2e8f0 !important;
    }
    
    section[data-testid="stSidebar"] h1,
    section[data-testid="stSidebar"] h2,
    section[data-testid="stSidebar"] h3 {
        color: #ffffff !important;
        font-weight: 700;
    }
    
    section[data-testid="stSidebar"] .stNumberInput label,
    section[data-testid="stSidebar"] .stSelectbox label,
    section[data-testid="stSidebar"] .stSlider label,
    section[data-testid="stSidebar"] .stDateInput label {
        color: #cbd5e1 !important;
        font-weight: 600;
    }
    
    section[data-testid="stSidebar"] input,
    section[data-testid="stSidebar"] select {
        background-color: #334155 !important;
        color: #ffffff !important;
        border: 1px solid #475569 !important;
        border-radius: 8px;
    }
    
    section[data-testid="stSidebar"] .stSlider > div > div > div {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    }
    
    /* Улучшенные вкладки */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        padding: 0 24px;
        background-color: #f1f5f9;
        border-radius: 8px;
        font-weight: 600;
        color: #475569;
    }
    
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    /* Дополнительные улучшения */
    .forecast-positive { color: #22c55e; font-weight: 600; }
    .forecast-negative { color: #ef4444; font-weight: 600; }
    
    /* Скрываем водяные знаки Streamlit */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Улучшенная таблица */
    .stDataFrame {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
</style>
""", unsafe_allow_html=True)


@st.cache_data
def load_data():
    """Загрузка данных ИПЦ"""
    df = pd.read_csv('output/ipc_monthly.csv', parse_dates=['date'], index_col='date')
    return df


@st.cache_data
def train_sarima(data, order, seasonal_order, forecast_steps):
    """Обучение SARIMA модели"""
    model = SARIMAX(data,
                    order=order,
                    seasonal_order=seasonal_order,
                    enforce_stationarity=False,
                    enforce_invertibility=False)
    model_fit = model.fit(disp=False)
    
    forecast_result = model_fit.get_forecast(steps=forecast_steps)
    forecast = forecast_result.predicted_mean
    conf_int = forecast_result.conf_int(alpha=0.05)
    
    return model_fit, forecast, conf_int


def main():
    # Заголовок
    st.markdown('<p class="main-header">📊 Индекс Потребительских Цен России</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Анализ и прогнозирование на основе данных Росстата (1991-2025)</p>', unsafe_allow_html=True)
    
    # Загрузка данных
    df = load_data()
    
    # Sidebar
    st.sidebar.image("https://rosstat.gov.ru/storage/mediabank/rosstat-logo.png", width=200)
    st.sidebar.markdown("---")
    st.sidebar.header("⚙️ Параметры модели")
    
    # Параметры SARIMA
    st.sidebar.subheader("SARIMA(p,d,q)(P,D,Q,s)")
    col1, col2, col3 = st.sidebar.columns(3)
    p = col1.number_input("p", 0, 5, 1, key="p")
    d = col2.number_input("d", 0, 2, 0, key="d")
    q = col3.number_input("q", 0, 5, 1, key="q")
    
    col4, col5, col6 = st.sidebar.columns(3)
    P = col4.number_input("P", 0, 3, 1, key="P")
    D = col5.number_input("D", 0, 2, 0, key="D")
    Q = col6.number_input("Q", 0, 3, 1, key="Q")
    
    s = st.sidebar.selectbox("Сезонность (s)", [12, 6, 4, 3], index=0)
    forecast_steps = st.sidebar.slider("Горизонт прогноза (месяцев)", 3, 36, 12)
    
    st.sidebar.markdown("---")
    st.sidebar.subheader("📅 Фильтр данных")
    
    min_date = df.index.min().to_pydatetime()
    max_date = df.index.max().to_pydatetime()
    
    date_range = st.sidebar.date_input(
        "Период анализа",
        value=(min_date, max_date),
        min_value=min_date,
        max_value=max_date
    )
    
    # Фильтрация данных
    if len(date_range) == 2:
        mask = (df.index >= pd.Timestamp(date_range[0])) & (df.index <= pd.Timestamp(date_range[1]))
        df_filtered = df[mask]
    else:
        df_filtered = df
    
    # Обучение модели
    order = (p, d, q)
    seasonal_order = (P, D, Q, s)
    
    with st.spinner('Обучение модели SARIMA...'):
        model_fit, forecast, conf_int = train_sarima(df['ipc'], order, seasonal_order, forecast_steps)
    
    # Даты прогноза
    forecast_dates = pd.date_range(start=df.index[-1] + pd.DateOffset(months=1), 
                                    periods=forecast_steps, freq='MS')
    
    # === МЕТРИКИ ===
    st.markdown("### 📈 Ключевые метрики")
    
    col1, col2, col3, col4, col5 = st.columns(5)
    
    with col1:
        st.metric(
            label="Текущий ИПЦ",
            value=f"{df['ipc'].iloc[-1]:.2f}%",
            delta=f"{df['ipc'].iloc[-1] - df['ipc'].iloc[-2]:.2f}%"
        )
    
    with col2:
        st.metric(
            label="Среднее за год",
            value=f"{df['ipc'].tail(12).mean():.2f}%",
            delta=f"{df['ipc'].tail(12).mean() - df['ipc'].tail(24).head(12).mean():.2f}%"
        )
    
    with col3:
        st.metric(
            label="Прогноз (след. месяц)",
            value=f"{forecast.iloc[0]:.2f}%",
            delta=f"{forecast.iloc[0] - df['ipc'].iloc[-1]:.2f}%"
        )
    
    with col4:
        st.metric(
            label="AIC модели",
            value=f"{model_fit.aic:.0f}"
        )
    
    with col5:
        st.metric(
            label="Всего данных",
            value=f"{len(df)} мес.",
            delta=f"{(max_date.year - min_date.year)} лет"
        )
    
    st.markdown("---")
    
    # === ВКЛАДКИ ===
    tab1, tab2, tab3, tab4 = st.tabs(["📊 Прогноз", "📈 Исторические данные", "🔬 Диагностика", "📋 Данные"])
    
    # TAB 1: Прогноз
    with tab1:
        st.subheader("Прогноз SARIMA")
        
        # График прогноза
        fig = go.Figure()
        
        # Последние 3 года данных
        recent_data = df[df.index >= df.index[-1] - pd.DateOffset(years=3)]
        
        # Исторические данные
        fig.add_trace(go.Scatter(
            x=recent_data.index,
            y=recent_data['ipc'],
            mode='lines',
            name='Фактические данные',
            line=dict(color='#2E86AB', width=2)
        ))
        
        # Прогноз
        fig.add_trace(go.Scatter(
            x=forecast_dates,
            y=forecast,
            mode='lines+markers',
            name='Прогноз',
            line=dict(color='#A23B72', width=2, dash='dash'),
            marker=dict(size=8)
        ))
        
        # Доверительный интервал
        fig.add_trace(go.Scatter(
            x=list(forecast_dates) + list(forecast_dates[::-1]),
            y=list(conf_int.iloc[:, 1]) + list(conf_int.iloc[:, 0][::-1]),
            fill='toself',
            fillcolor='rgba(162, 59, 114, 0.2)',
            line=dict(color='rgba(255,255,255,0)'),
            name='95% доверительный интервал',
            showlegend=True
        ))
        
        # Линия 100%
        fig.add_hline(y=100, line_dash="dash", line_color="gray", opacity=0.5)
        
        fig.update_layout(
            title=f'Прогноз ИПЦ на {forecast_steps} месяцев | SARIMA{order}x{seasonal_order}',
            xaxis_title='Дата',
            yaxis_title='ИПЦ (% к предыдущему месяцу)',
            hovermode='x unified',
            template='plotly_white',
            height=500,
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Таблица прогноза
        st.subheader("📋 Детальный прогноз")
        
        forecast_df = pd.DataFrame({
            'Дата': forecast_dates.strftime('%Y-%m'),
            'Прогноз ИПЦ': forecast.values.round(2),
            'Нижняя граница (95%)': conf_int.iloc[:, 0].values.round(2),
            'Верхняя граница (95%)': conf_int.iloc[:, 1].values.round(2),
            'Интерпретация': ['📈 Рост цен' if v > 100 else '📉 Снижение цен' if v < 100 else '➡️ Стабильно' 
                              for v in forecast.values]
        })
        
        st.dataframe(forecast_df, use_container_width=True, hide_index=True)
    
    # TAB 2: Исторические данные
    with tab2:
        st.subheader("Исторические данные ИПЦ")
        
        # Выбор периода для отображения
        period = st.radio(
            "Выберите период:",
            ["Все данные", "Последние 10 лет", "Последние 5 лет", "Последний год"],
            horizontal=True
        )
        
        if period == "Последние 10 лет":
            plot_data = df[df.index >= df.index[-1] - pd.DateOffset(years=10)]
        elif period == "Последние 5 лет":
            plot_data = df[df.index >= df.index[-1] - pd.DateOffset(years=5)]
        elif period == "Последний год":
            plot_data = df[df.index >= df.index[-1] - pd.DateOffset(years=1)]
        else:
            plot_data = df
        
        # Основной график
        fig2 = px.line(plot_data.reset_index(), x='date', y='ipc',
                       title=f'Динамика ИПЦ | {period}',
                       labels={'date': 'Дата', 'ipc': 'ИПЦ (%)'},
                       template='plotly_white')
        
        fig2.update_traces(line=dict(color='#2E86AB', width=1.5))
        fig2.add_hline(y=100, line_dash="dash", line_color="gray")
        fig2.update_layout(height=400)
        
        st.plotly_chart(fig2, use_container_width=True)
        
        # Статистика по годам
        st.subheader("📊 Статистика по годам")
        
        yearly_stats = df.groupby(df.index.year)['ipc'].agg(['mean', 'std', 'min', 'max']).round(2)
        yearly_stats.columns = ['Среднее', 'Ст. откл.', 'Минимум', 'Максимум']
        yearly_stats.index.name = 'Год'
        
        # Heatmap по годам и месяцам
        pivot_data = df.copy()
        pivot_data['year'] = pivot_data.index.year
        pivot_data['month'] = pivot_data.index.month
        pivot_table = pivot_data.pivot_table(values='ipc', index='year', columns='month', aggfunc='mean')
        
        fig3 = px.imshow(pivot_table,
                         labels=dict(x="Месяц", y="Год", color="ИПЦ (%)"),
                         x=['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 
                            'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
                         aspect="auto",
                         color_continuous_scale='RdYlGn_r',
                         title='Тепловая карта ИПЦ по месяцам и годам')
        
        fig3.update_layout(height=600)
        st.plotly_chart(fig3, use_container_width=True)
    
    # TAB 3: Диагностика
    with tab3:
        st.subheader("Диагностика модели SARIMA")
        
        residuals = model_fit.resid
        
        col1, col2 = st.columns(2)
        
        with col1:
            # ACF
            acf_values = acf(residuals, nlags=40)
            fig_acf = go.Figure()
            fig_acf.add_trace(go.Bar(x=list(range(len(acf_values))), y=acf_values, 
                                     marker_color='#2E86AB'))
            fig_acf.add_hline(y=1.96/np.sqrt(len(residuals)), line_dash="dash", line_color="red")
            fig_acf.add_hline(y=-1.96/np.sqrt(len(residuals)), line_dash="dash", line_color="red")
            fig_acf.update_layout(title='ACF остатков', xaxis_title='Лаг', yaxis_title='ACF',
                                  template='plotly_white', height=350)
            st.plotly_chart(fig_acf, use_container_width=True)
        
        with col2:
            # PACF
            pacf_values = pacf(residuals, nlags=40)
            fig_pacf = go.Figure()
            fig_pacf.add_trace(go.Bar(x=list(range(len(pacf_values))), y=pacf_values,
                                      marker_color='#A23B72'))
            fig_pacf.add_hline(y=1.96/np.sqrt(len(residuals)), line_dash="dash", line_color="red")
            fig_pacf.add_hline(y=-1.96/np.sqrt(len(residuals)), line_dash="dash", line_color="red")
            fig_pacf.update_layout(title='PACF остатков', xaxis_title='Лаг', yaxis_title='PACF',
                                   template='plotly_white', height=350)
            st.plotly_chart(fig_pacf, use_container_width=True)
        
        col3, col4 = st.columns(2)
        
        with col3:
            # Q-Q Plot
            qq_data = stats.probplot(residuals, dist="norm")
            fig_qq = go.Figure()
            fig_qq.add_trace(go.Scatter(x=qq_data[0][0], y=qq_data[0][1], mode='markers',
                                        marker=dict(color='#2E86AB', size=5), name='Остатки'))
            fig_qq.add_trace(go.Scatter(x=qq_data[0][0], y=qq_data[1][0] + qq_data[1][1]*qq_data[0][0],
                                        mode='lines', line=dict(color='red', dash='dash'), name='Теор. норм.'))
            fig_qq.update_layout(title='Q-Q Plot', xaxis_title='Теоретические квантили',
                                 yaxis_title='Выборочные квантили', template='plotly_white', height=350)
            st.plotly_chart(fig_qq, use_container_width=True)
        
        with col4:
            # Распределение остатков
            fig_hist = px.histogram(residuals, nbins=40, title='Распределение остатков',
                                    labels={'value': 'Остатки', 'count': 'Частота'},
                                    template='plotly_white')
            fig_hist.update_traces(marker_color='#F18F01')
            fig_hist.update_layout(height=350, showlegend=False)
            st.plotly_chart(fig_hist, use_container_width=True)
        
        # Остатки во времени
        fig_resid = go.Figure()
        fig_resid.add_trace(go.Scatter(x=df.index, y=residuals, mode='lines',
                                       line=dict(color='#2E86AB', width=1)))
        fig_resid.add_hline(y=0, line_dash="dash", line_color="red")
        fig_resid.update_layout(title='Остатки модели во времени',
                                xaxis_title='Дата', yaxis_title='Остатки',
                                template='plotly_white', height=300)
        st.plotly_chart(fig_resid, use_container_width=True)
        
        # Статистика модели
        st.subheader("📊 Статистика модели")
        
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("AIC", f"{model_fit.aic:.2f}")
        col2.metric("BIC", f"{model_fit.bic:.2f}")
        col3.metric("Среднее остатков", f"{residuals.mean():.4f}")
        col4.metric("Ст. откл. остатков", f"{residuals.std():.4f}")
    
    # TAB 4: Данные
    with tab4:
        st.subheader("📋 Исходные данные")
        
        # Фильтры
        col1, col2 = st.columns(2)
        with col1:
            year_filter = st.multiselect(
                "Фильтр по годам",
                options=sorted(df.index.year.unique()),
                default=sorted(df.index.year.unique())[-5:]
            )
        
        with col2:
            search = st.text_input("🔍 Поиск по значению ИПЦ (например: >105)")
        
        # Фильтрация
        display_df = df[df.index.year.isin(year_filter)].copy()
        display_df = display_df.reset_index()
        display_df['Год'] = display_df['date'].dt.year
        display_df['Месяц'] = display_df['date'].dt.strftime('%B')
        display_df = display_df.rename(columns={'date': 'Дата', 'ipc': 'ИПЦ (%)'})
        
        if search:
            if search.startswith('>'):
                threshold = float(search[1:])
                display_df = display_df[display_df['ИПЦ (%)'] > threshold]
            elif search.startswith('<'):
                threshold = float(search[1:])
                display_df = display_df[display_df['ИПЦ (%)'] < threshold]
        
        st.dataframe(display_df, use_container_width=True, hide_index=True, height=500)
        
        # Скачивание данных
        csv = df.to_csv()
        st.download_button(
            label="📥 Скачать данные (CSV)",
            data=csv,
            file_name="ipc_russia.csv",
            mime="text/csv"
        )
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: #666; font-size: 0.9rem;'>
        📊 Данные: <a href='https://rosstat.gov.ru'>Росстат</a> | 
        🔬 Модель: SARIMA | 
        💻 Разработано с использованием Streamlit & Plotly
    </div>
    """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
