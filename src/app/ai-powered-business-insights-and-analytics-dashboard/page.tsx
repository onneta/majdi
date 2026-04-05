"use client"

import { useState, useEffect, useRef } from "react"

type TimeRange = "7d" | "30d" | "90d" | "1y"

type KPI = {
  label: string
  value: string
  change: number
  icon: string
  color: string
  prefix?: string
  suffix?: string
}

type DataPoint = {
  date: string
  revenue: number
  customers: number
  orders: number
}

type Product = {
  name: string
  value: number
  growth: number
}

type Category = {
  name: string
  value: number
  color: string
}

type Alert = {
  id: number
  type: "anomaly" | "trend" | "prediction"
  severity: "high" | "medium" | "low"
  message: string
  time: string
  icon: string
}

const generateMockData = (days: number): DataPoint[] => {
  const data: DataPoint[] = []
  const now = new Date()
  let baseRevenue = 42000
  let baseCustomers = 320
  let baseOrders = 180

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const noise = () => (Math.random() - 0.4) * 0.15
    baseRevenue = baseRevenue * (1 + noise())
    baseCustomers = Math.max(200, baseCustomers * (1 + noise() * 0.5))
    baseOrders = Math.max(100, baseOrders * (1 + noise() * 0.7))
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.round(baseRevenue),
      customers: Math.round(baseCustomers),
      orders: Math.round(baseOrders),
    })
  }
  return data
}

const mockProducts: Product[] = [
  { name: "AI Analytics Suite", value: 128400, growth: 23.4 },
  { name: "Data Pipeline Pro", value: 94200, growth: 18.7 },
  { name: "Insight Engine", value: 76500, growth: 31.2 },
  { name: "Predictive Models", value: 61800, growth: 12.9 },
  { name: "Custom Integrations", value: 43200, growth: -4.1 },
  { name: "Enterprise Support", value: 38700, growth: 8.6 },
]

const mockCategories: Category[] = [
  { name: "SaaS Subscriptions", value: 48, color: "#6366f1" },
  { name: "Professional Services", value: 22, color: "#8b5cf6" },
  { name: "Enterprise Licenses", value: 18, color: "#a78bfa" },
  { name: "Support & Training", value: 12, color: "#c4b5fd" },
]

const mockAlerts: Alert[] = [
  {
    id: 1,
    type: "anomaly",
    severity: "high",
    message: "Revenue spike detected: 47% above baseline on Nov 18",
    time: "2 hours ago",
    icon: "⚡",
  },
  {
    id: 2,
    type: "trend",
    severity: "medium",
    message: "Customer churn rate trending upward (+3.2%) over last 14 days",
    time: "5 hours ago",
    icon: "📈",
  },
  {
    id: 3,
    type: "prediction",
    severity: "low",
    message: "AI predicts Q4 revenue to exceed target by 12.8%",
    time: "1 day ago",
    icon: "🔮",
  },
  {
    id: 4,
    type: "anomaly",
    severity: "medium",
    message: "Unusual drop in API calls from Enterprise segment",
    time: "1 day ago",
    icon: "🚨",
  },
]

function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 120
  const height = 40
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function RevenueChart({ data }: { data: DataPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(800)
  const height = 220
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setWidth(entries[0].contentRect.width)
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const maxVal = Math.max(...data.map((d) => d.revenue))
  const minVal = Math.min(...data.map((d) => d.revenue))
  const range = maxVal - minVal || 1

  const getX = (i: number) => (i / (data.length - 1)) * chartWidth
  const getY = (v: number) => chartHeight - ((v - minVal) / range) * chartHeight

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.revenue)}`).join(" ")
  const areaPath =
    `M ${getX(0)} ${chartHeight} ` +
    data.map((d, i) => `L ${getX(i)} ${getY(d.revenue)}`).join(" ") +
    ` L ${getX(data.length - 1)} ${chartHeight} Z`

  const ticks = 5
  const tickValues = Array.from({ length: ticks }, (_, i) => minVal + (range / (ticks - 1)) * i)

  const labelStep = Math.ceil(data.length / 6)
  const labelIndices = data.map((_, i) => i).filter((i) => i % labelStep === 0 || i === data.length - 1)

  return (
    <div ref={containerRef} className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {tickValues.map((v, i) => (
            <g key={i}>
              <line x1={0} x2={chartWidth} y1={getY(v)} y2={getY(v)} stroke="#27272a" strokeWidth="1" />
              <text
                x={-8}
                y={getY(v) + 4}
                fill="#71717a"
                fontSize="11"
                textAnchor="end"
              >
                ${(v / 1000).toFixed(0)}k
              </text>
            </g>
          ))}
          <path d={areaPath} fill="url(#revenueGrad)" />
          <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {labelIndices.map((i) => (
            <text key={i} x={getX(i)} y={chartHeight + 20} fill="#71717a" fontSize="11" textAnchor="middle">
              {data[i].date}
            </text>
          ))}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.revenue)}
              r="3"
              fill="#6366f1"
              opacity={i === data.length - 1 ? 1 : 0}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

function BarChart({ products }: { products: Product[] }) {
  const maxVal = Math.max(...products.map((p) => p.value))
  return (
    <div className="space-y-3">
      {products.map((p, i) => (
        <div key={i} className="group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-zinc-300 truncate max-w-[55%]">{p.name}</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${p.growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {p.growth >= 0 ? "↑" : "↓"} {Math.abs(p.growth)}%
              </span>
              <span className="text-sm font-semibold text-white">${(p.value / 1000).toFixed(1)}k</span>
            </div>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(p.value / maxVal) * 100}%`,
                background: `linear-gradient(90deg, #6366f1, #8b5cf6)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function PieChart({ categories }: { categories: Category[] }) {
  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 58
  const innerR = 36

  let cumulative = 0
  const slices = categories.map((cat) => {
    const start = cumulative
    cumulative += cat.value
    return { ...cat, start, end: cumulative }
  })

  const total = cumulative

  const polarToCartesian = (angle: number, radius: number) => {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  const describeArc = (start: number, end: number) => {
    const startDeg = (start / total) * 360
    const endDeg = (end / total) * 360
    const s = polarToCartesian(startDeg, r)
    const e = polarToCartesian(endDeg, r)
    const si = polarToCartesian(startDeg, innerR)
    const ei = polarToCartesian(endDeg, innerR)
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    return `M ${si.x} ${si.y} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} L ${ei.x} ${ei.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${si.x} ${si.y} Z`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size}>
        {slices.map((s, i) => (
          <path
            key={i}
            d={describeArc(s.start, s.end)}
            fill={s.color}
            stroke="#09090b"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
          100%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#71717a" fontSize="10">
          Revenue
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
        {categories.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
            <span className="text-xs text-zinc-400 truncate">{c.name}</span>
            <span className="text-xs font-semibold text-white ml-auto">{c.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OnnетaDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  const [data, setData] = useState<DataPoint[]>([])
  const [activeMetric, setActiveMetric] = useState<"revenue" | "customers" | "orders">("revenue")
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [aiInsight, setAiInsight] = useState(0)

  const dayMap: Record<TimeRange, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }

  useEffect(() => {
    setData(generateMockData(dayMap[timeRange]))
    setLastUpdated(new Date().toLocaleTimeString())
  }, [timeRange])

  useEffect(() => {
    const interval = setInterval(() => {
      setAiInsight((prev) => (prev + 1) % aiInsightMessages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const aiInsightMessages = [
    "🤖 AI detected a 23% increase in enterprise segment engagement this week",
    "🔮 Predictive models suggest peak demand window: next 48 hours",
    "📊 Cohort analysis shows Month-2 retention improved by 8.3%",
    "⚡ AI identified 3 upsell opportunities worth ~$24k in pipeline",
    "🧠 Natural language queries increased 41% — users love the new chat