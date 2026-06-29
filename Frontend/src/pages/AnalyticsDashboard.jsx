import { useState, useEffect, useRef } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import { useTheme } from '../context/ThemeContext'
import Chart from 'chart.js/auto'
import { TrendingUp, Award, DollarSign, Activity, Sparkles, Loader } from 'lucide-react'

export default function AnalyticsDashboard() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { convertPrice, symbols, selectedCurrency } = useCurrency()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const doughnutRef = useRef(null)
  const lineRef = useRef(null)
  const doughnutChartInstance = useRef(null)
  const lineChartInstance = useRef(null)

  const symbol = symbols[selectedCurrency] || '$'

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await api.get('/analytics/dashboard')
      setData(res.data)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  // Draw/Redraw charts
  useEffect(() => {
    if (!data) return

    // Clean up previous instances to prevent overlaps
    if (doughnutChartInstance.current) doughnutChartInstance.current.destroy()
    if (lineChartInstance.current) lineChartInstance.current.destroy()

    const isDark = theme === 'dark'
    const cardBgColor = isDark ? '#121215' : '#ffffff'
    const gridLineColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)'
    // Chart.js cannot parse CSS variable strings inside canvas contexts. Define raw color codes instead.
    const textColor = isDark ? '#b0b0b5' : '#55555c'

    // 1. Nutrient Doughnut Chart
    if (doughnutRef.current) {
      const ctx = doughnutRef.current.getContext('2d')
      doughnutChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Protein (%)', 'Carbohydrates (%)', 'Fats (%)'],
          datasets: [{
            data: [
              data.nutrient_split.Protein,
              data.nutrient_split.Carbs,
              data.nutrient_split.Fats
            ],
            backgroundColor: [
              '#c5a880', // Brushed Gold
              '#e0cfb8', // Champagne Gold
              '#4b4030', // Antique Bronze/Gold
            ],
            borderColor: cardBgColor, // BACKING THEME COLOR
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: textColor,
                padding: 18,
                font: {
                  family: "'Outfit', sans-serif",
                  size: 11,
                  weight: '600'
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return ` ${context.label}: ${context.raw}%`
                }
              }
            }
          },
          cutout: '70%'
        }
      })
    }

    // 2. Spending Line Chart
    if (lineRef.current) {
      const ctx = lineRef.current.getContext('2d')

      const months = Object.keys(data.monthly_spending)
      const rawSpending = Object.values(data.monthly_spending)

      // Convert raw backend USD values into the user's selected currency
      const convertedSpending = rawSpending.map(usdCost => convertPrice(usdCost))

      // Gradient fill under the line
      const gradient = ctx.createLinearGradient(0, 0, 0, 240)
      gradient.addColorStop(0, isDark ? 'rgba(197, 168, 128, 0.35)' : 'rgba(179, 146, 98, 0.25)')
      gradient.addColorStop(1, 'rgba(197, 168, 128, 0.0)')

      lineChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Monthly Cost',
            data: convertedSpending,
            borderColor: isDark ? '#c5a880' : '#b39262', // theme-matched gold
            borderWidth: 3,
            backgroundColor: gradient,
            fill: true,
            tension: 0.38,
            pointBackgroundColor: isDark ? '#c5a880' : '#b39262',
            pointBorderColor: cardBgColor,
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return ` Spending: ${symbol}${parseFloat(context.raw).toFixed(2)}`
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: gridLineColor },
              ticks: {
                color: textColor,
                font: { family: "'Outfit', sans-serif", size: 10 }
              }
            },
            y: {
              grid: { color: gridLineColor },
              ticks: {
                color: textColor,
                font: { family: "'Outfit', sans-serif", size: 10 },
                callback: function (value) {
                  return symbol + value
                }
              }
            }
          }
        }
      })
    }

    return () => {
      if (doughnutChartInstance.current) doughnutChartInstance.current.destroy()
      if (lineChartInstance.current) lineChartInstance.current.destroy()
    }
  }, [data, selectedCurrency, theme])

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="page-container" style={{ maxWidth: '1050px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Luxury Title Block */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="analytics-page-title" style={{
          fontSize: '2.5rem',
          color: 'var(--text-primary)',
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 'bold',
          margin: 0,
          background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--emerald) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Activity size={32} color="var(--emerald)" /> Culinary Analytics Engine
        </h1>
        <p className="analytics-page-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '8px', letterSpacing: '0.02em' }}>
          Evaluate your diet composition and track monthly recipe expenditures in real-time.
        </p>
      </div>

      {/* Demo Notification if no real logs */}
      {data && !data.has_real_data && (
        <div style={{
          background: 'rgba(179, 146, 98, 0.05)',
          border: '1px solid rgba(179, 146, 98, 0.25)',
          color: 'var(--emerald)',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '2rem',
          fontSize: '0.85rem',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <Sparkles size={14} />
          <span><strong>Curator Note:</strong> Currently displaying demonstration data. Mark recipes as "Cooked" on their detail page to feed your real-time analytics.</span>
        </div>
      )}

      {/* Analytics Stat Cards — uses responsive CSS class */}
      <div className="analytics-stat-grid">
        <div className="glass-panel analytics-stat-card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recipes Cooked</div>
          <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={24} color="var(--emerald)" /> {data?.stats.total_cooked}
          </div>
        </div>

        <div className="glass-panel analytics-stat-card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Culinary Expense</div>
          <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--emerald)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {symbol}{data ? convertPrice(data.stats.total_spending) : '0.00'}
          </div>
        </div>

        <div className="glass-panel analytics-stat-card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Cost / Dish</div>
          <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={20} color="var(--emerald)" />
            {symbol}{data ? convertPrice(data.stats.average_recipe_cost) : '0.00'}
          </div>
        </div>
      </div>

      {/* Chart Layout — uses responsive CSS class */}
      <div className="analytics-chart-grid">
        {/* Doughnut Chart Panel */}
        <div className="glass-panel" style={{
          padding: '2rem',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--emerald)', alignSelf: 'flex-start', margin: '0 0 1.5rem 0', fontWeight: 'bold' }}>
            Nutrient Composition
          </h3>
          <div style={{ position: 'relative', width: '100%', height: '260px' }}>
            <canvas ref={doughnutRef} />
          </div>
        </div>

        {/* Line Chart Panel */}
        <div className="glass-panel" style={{
          padding: '2rem',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--emerald)', margin: '0 0 1.5rem 0', fontWeight: 'bold' }}>
            Monthly Spending Blueprint
          </h3>
          <div style={{ position: 'relative', width: '100%', height: '260px' }}>
            <canvas ref={lineRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
