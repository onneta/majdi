"use client"

import { useState, useEffect, useRef } from "react"

type DateRange = "7d" | "30d" | "90d" | "1y"

type KPI = {
  label: string
  value: string
  change: number
  prefix?: string
  suffix?: string
  icon: string
}

type ReportConfig = {
  id: string
  name: string
  frequency: "daily" | "weekly" | "monthly"
  metrics: string[]
  enabled: boolean
  lastRun: string
  nextRun: string
}

type DataPoint = {
  date: string
  revenue: number
  customers: number
  orders: number
  aiInsights: number
}

const generateMockData = (days: number): DataPoint[] => {
  const data: DataPoint[] = []
  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const base = days - i
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.floor(12000 + base * 320 + Math.sin(i) * 2400 + Math.random() * 1500),
      customers: Math.floor(420 + base * 8 + Math.sin(i * 0.7) * 60 + Math.random() * 40),
      orders: Math.floor(180 + base * 4 + Math.sin(i * 0.5) * 30 + Math.random() * 20),
      aiInsights: Math.floor(55 + base * 1.2 + Math.sin(i * 0.9) * 15 + Math.random() * 10),
    })
  }
  return data
}

const categoryData = [
  { label: "AI Analytics", value: 38, color: "#6366f1" },
  { label: "Automation", value: 27, color: "#8b5cf6" },
  { label: "Insights", value: 19, color: "#a78bfa" },
  { label: "Integrations", value: 16, color: "#c4b5fd" },
]

const topProducts = [
  { name: "AI Dashboard Pro", value: 89420, growth: 24 },
  { name: "Workflow Automator", value: 67310, growth: 18 },
  { name: "Insight Engine", value: 54890, growth: 31 },
  { name: "Data Connector", value: 43200, growth: 12 },
  { name: "Report Builder", value: 38750, growth: 8 },
]

const initialReports: ReportConfig[] = [
  {
    id: "r1",
    name: "Weekly Executive Summary",
    frequency: "weekly",
    metrics: ["revenue", "customers", "orders", "aiInsights"],
    enabled: true,
    lastRun: "Dec 16, 2024",
    nextRun: "Dec 23, 2024",
  },
  {
    id: "r2",
    name: "Daily KPI Digest",
    frequency: "daily",
    metrics: ["revenue", "orders"],
    enabled: true,
    lastRun: "Dec 18, 2024",
    nextRun: "Dec 19, 2024",
  },
  {
    id: "r3",
    name: "Monthly Growth Report",
    frequency: "monthly",
    metrics: ["revenue", "customers", "aiInsights"],
    enabled: false,
    lastRun: "Nov 30, 2024",
    nextRun: "Dec 31, 2024",
  },
]

function LineChart({ data, dateRange }: { data: DataPoint[]; dateRange: DateRange }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const W = rect.width
    const H = rect.height
    const padL = 60
    const padR = 20
    const padT = 20
    const padB = 40

    ctx.clearRect(0, 0, W, H)

    const values = data.map((d) => d.revenue)
    const minV = Math.min(...values) * 0.95
    const maxV = Math.max(...values) * 1.05
    const chartW = W - padL - padR
    const chartH = H - padT - padB

    // Grid lines
    ctx.strokeStyle = "rgba(63,63,70,0.6)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(padL, y)
      ctx.lineTo(W - padR, y)
      ctx.stroke()

      const val = maxV - ((maxV - minV) / 4) * i
      ctx.fillStyle = "#a1a1aa"
      ctx.font = "11px Inter, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText("$" + (val / 1000).toFixed(0) + "k", padL - 8, y + 4)
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, padT, 0, H - padB)
    grad.addColorStop(0, "rgba(99,102,241,0.35)")
    grad.addColorStop(1, "rgba(99,102,241,0.01)")

    const xStep = chartW / (data.length - 1)
    const getY = (v: number) => padT + chartH - ((v - minV) / (maxV - minV)) * chartH

    ctx.beginPath()
    ctx.moveTo(padL, getY(values[0]))
    for (let i = 1; i < data.length; i++) {
      const x0 = padL + (i - 1) * xStep
      const x1 = padL + i * xStep
      const y0 = getY(values[i - 1])
      const y1 = getY(values[i])
      const cpx = (x0 + x1) / 2
      ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1)
    }
    ctx.lineTo(W - padR, H - padB)
    ctx.lineTo(padL, H - padB)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Line
    ctx.beginPath()
    ctx.moveTo(padL, getY(values[0]))
    for (let i = 1; i < data.length; i++) {
      const x0 = padL + (i - 1) * xStep
      const x1 = padL + i * xStep
      const y0 = getY(values[i - 1])
      const y1 = getY(values[i])
      const cpx = (x0 + x1) / 2
      ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1)
    }
    ctx.strokeStyle = "#6366f1"
    ctx.lineWidth = 2.5
    ctx.stroke()

    // X labels
    const step = Math.ceil(data.length / 6)
    ctx.fillStyle = "#a1a1aa"
    ctx.font = "11px Inter, sans-serif"
    ctx.textAlign = "center"
    for (let i = 0; i < data.length; i += step) {
      const x = padL + i * xStep
      ctx.fillText(data[i].date, x, H - padB + 20)
    }

    // Dots at endpoints
    const dotX = padL + (data.length - 1) * xStep
    const dotY = getY(values[values.length - 1])
    ctx.beginPath()
    ctx.arc(dotX, dotY, 5, 0, Math.PI * 2)
    ctx.fillStyle = "#6366f1"
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()
  }, [data, dateRange])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
}

function BarChart({ products }: { products: typeof topProducts }) {
  const max = Math.max(...products.map((p) => p.value))
  return (
    <div className="flex flex-col gap-3 w-full">
      {products.map((p, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-zinc-400 text-xs w-32 truncate">{p.name}</span>
          <div className="flex-1 bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
              style={{ width: `${(p.value / max) * 100}%` }}
            />
          </div>
          <span className="text-zinc-300 text-xs w-16 text-right font-mono">
            ${(p.value / 1000).toFixed(1)}k
          </span>
          <span className="text-emerald-400 text-xs w-10 text-right font-semibold">+{p.growth}%</span>
        </div>
      ))}
    </div>
  )
}

function PieChart({ data }: { data: typeof categoryData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 160
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const r = 58
    const inner = 36

    ctx.clearRect(0, 0, size, size)

    let start = -Math.PI / 2
    const total = data.reduce((s, d) => s + d.value, 0)

    data.forEach((d) => {
      const slice = (d.value / total) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, start + slice)
      ctx.closePath()
      ctx.fillStyle = d.color
      ctx.fill()
      start += slice
    })

    // Donut hole
    ctx.beginPath()
    ctx.arc(cx, cy, inner, 0, Math.PI * 2)
    ctx.fillStyle = "#18181b"
    ctx.fill()

    ctx.fillStyle = "#fff"
    ctx.font = "bold 14px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("100%", cx, cy)
  }, [data])

  return (
    <div className="flex items-center gap-6">
      <canvas ref={canvasRef} style={{ width: 160, height: 160, flexShrink: 0 }} />
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-zinc-400 text-xs">{d.label}</span>
            <span className="text-zinc-200 text-xs font-semibold ml-auto pl-3">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OnnетаReportingPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d")
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "configure">("overview")
  const [reports, setReports] = useState<ReportConfig[]>(initialReports)
  const [showAddReport, setShowAddReport] = useState(false)
  const [newReportName, setNewReportName] = useState("")
  const [newReportFreq, setNewReportFreq] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [exportNotification, setExportNotification] = useState("")
  const [data, setData] = useState<DataPoint[]>([])

  const rangeMap: Record<DateRange, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }

  useEffect(() => {
    setData(generateMockData(rangeMap[dateRange]))
  }, [dateRange])

  const latest = data[data.length - 1]
  const prev = data[Math.max(0, data.length - 8)]

  const kpis: KPI[] = latest && prev ? [
    {
      label: "Total Revenue",
      value: "$" + (latest.revenue / 1000).toFixed(1) + "k",
      change: Math.round(((latest.revenue - prev.revenue) / prev.revenue) * 100),
      icon: "💰",
    },
    {
      label: "Active Customers",
      value: latest.customers.toLocaleString(),
      change: Math.round(((latest.customers - prev.customers) / prev.customers) * 100),
      icon: "👥",
    },
    {
      label: "Total Orders",
      value: latest.orders.toLocaleString(),
      change: Math.round(((latest.orders - prev.orders) / prev.orders) * 100),
      icon: "📦",
    },
    {
      label: "AI Insights Gen.",
      value: latest.aiInsights.toLocaleString(),
      change: Math.round(((latest.aiInsights - prev.aiInsights) / prev.aiInsights) * 100),
      icon: "🤖",
    },
  ] : []

  const handleExport = (format: "PDF" | "CSV") => {
    setExportNotification(`✅ ${format} report exported successfully`)
    setTimeout(() => setExportNotification(""), 3000)
  }

  const toggleReport = (id: string) => {
    setReports((r) => r.map((rep) => rep.id === id ? { ...rep, enabled: !rep.enabled } : rep))
  }

  const addReport = () => {
    if (!newReportName.trim()) return
    const newR: ReportConfig = {
      id: `r${Date.now()}`,
      name: newReportName,
      frequency: newReportFreq,
      metrics: ["revenue", "customers"],
      enabled: true,
      lastRun: "Never",
      nextRun: "Scheduled",
    }
    setReports((r) => [...r, newR])
    setNewReportName("")
    setShowAddReport(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">