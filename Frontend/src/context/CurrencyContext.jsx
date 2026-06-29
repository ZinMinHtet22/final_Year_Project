import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/client'

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currencies, setCurrencies] = useState([])
  const [rates, setRates] = useState({ USD: 1 })
  const [symbols, setSymbols] = useState({ USD: '$' })
  const [loading, setLoading] = useState(true)
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('selected_currency') || 'USD'
  })

  const changeCurrency = useCallback((code) => {
    setSelectedCurrency(code)
    localStorage.setItem('selected_currency', code)
  }, [])

  const fetchCurrencies = useCallback(async () => {
    try {
      const res = await api.get('/currencies')
      const data = res.data
      setCurrencies(data)
      
      const ratesMap = {}
      const symbolsMap = {}
      data.forEach(c => {
        ratesMap[c.code] = c.exchange_rate
        symbolsMap[c.code] = c.symbol
      })
      setRates(ratesMap)
      setSymbols(symbolsMap)
    } catch (err) {
      console.error('Failed to load currencies', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrencies()
  }, [fetchCurrencies])

  const convertPrice = useCallback((usd, code = selectedCurrency) => {
    const rate = rates[code] || 1
    return (usd * rate).toFixed(rate >= 100 ? 0 : 2)
  }, [rates, selectedCurrency])

  const formatPrice = useCallback((usd, code = selectedCurrency) => {
    const symbol = symbols[code] || '$'
    const value = convertPrice(usd, code)
    return `${symbol}${value}`
  }, [symbols, convertPrice, selectedCurrency])

  return (
    <CurrencyContext.Provider value={{
      currencies,
      rates,
      symbols,
      loading,
      selectedCurrency,
      changeCurrency,
      convertPrice,
      formatPrice,
      refreshCurrencies: fetchCurrencies
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
