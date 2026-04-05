"use client"

import { useState, useEffect } from "react"

type Integration = {
  id: string
  name: string
  category: string
  description: string
  icon: string
  status: "connected" | "available" | "coming_soon"
  color: string
  dataPoints?: string
  lastSync?: string
}

type Category = {
  id: string
  label: string
  icon: string
}

const integrations: Integration[] = [
  { id: "salesforce", name: "Salesforce", category: "crm", description: "Sync contacts, deals, pipelines, and customer data in real-time.", icon: "☁️", status: "connected", color: "from-blue-500/20 to-blue-600/10", dataPoints: "24,832", lastSync: "2 min ago" },
  { id: "hubspot", name: "HubSpot", category: "crm", description: "Pull marketing, sales, and service data for unified customer insights.", icon: "🧡", status: "connected", color: "from-orange-500/20 to-orange-600/10", dataPoints: "18,441", lastSync: "5 min ago" },
  { id: "pipedrive", name: "Pipedrive", category: "crm", description: "Import deal stages, activities, and revenue forecasts.", icon: "🔵", status: "available", color: "from-indigo-500/20 to-indigo-600/10" },
  { id: "sap", name: "SAP ERP", category: "erp", description: "Connect enterprise resource planning data across finance, HR, and ops.", icon: "🏢", status: "connected", color: "from-blue-400/20 to-cyan-600/10", dataPoints: "102,394", lastSync: "1 min ago" },
  { id: "oracle", name: "Oracle ERP", category: "erp", description: "Integrate financial, procurement, and supply chain data.", icon: "🔴", status: "available", color: "from-red-500/20 to-red-600/10" },
  { id: "netsuite", name: "NetSuite", category: "erp", description: "Unify accounting, inventory, and CRM data from NetSuite.", icon: "🟣", status: "coming_soon", color: "from-purple-500/20 to-purple-600/10" },
  { id: "gsheets", name: "Google Sheets", category: "spreadsheet", description: "Import live spreadsheet data and named ranges automatically.", icon: "📊", status: "connected", color: "from-green-500/20 to-green-600/10", dataPoints: "9,210", lastSync: "10 min ago" },
  { id: "excel", name: "Microsoft Excel", category: "spreadsheet", description: "Connect Excel workbooks via OneDrive or direct upload.", icon: "🟢", status: "available", color: "from-emerald-500/20 to-emerald-600/10" },
  { id: "airtable", name: "Airtable", category: "spreadsheet", description: "Sync Airtable bases and views as structured data sources.", icon: "📋", status: "available", color: "from-yellow-500/20 to-yellow-600/10" },
  { id: "postgres", name: "PostgreSQL", category: "database", description: "Query your Postgres database with secure read-only access.", icon: "🐘", status: "connected", color: "from-indigo-400/20 to-blue-600/10", dataPoints: "341,891", lastSync: "30 sec ago" },
  { id: "mysql", name: "MySQL", category: "database", description: "Connect to MySQL databases and expose tables as data sources.", icon: "🐬", status: "available", color: "from-orange-400/20 to-amber-600/10" },
  { id: "snowflake", name: "Snowflake", category: "database", description: "Run queries against your Snowflake data warehouse at scale.", icon: "❄️", status: "coming_soon", color: "from-cyan-500/20 to-cyan-600/10" },
  { id: "bigquery", name: "BigQuery", category: "database", description: "Tap into Google BigQuery for petabyte-scale analytics.", icon: "🔷", status: "coming_soon", color: "from-blue-600/20 to-indigo-600/10" },
  { id: "slack", name: "Slack", category: "communication", description: "Receive AI insights, alerts, and reports directly in Slack.", icon: "💬", status: "connected", color: "from-purple-500/20 to-pink-600/10", dataPoints: "Notifications", lastSync: "Active" },
  { id: "teams", name: "Microsoft Teams", category: "communication", description: "Integrate with Teams for notifications and workflow triggers.", icon: "🟦", status: "available", color: "from-indigo-500/20 to-blue-600/10" },
  { id: "stripe", name: "Stripe", category: "finance", description: "Sync payments, invoices, subscriptions, and revenue analytics.", icon: "💳", status: "connected", color: "from-violet-500/20 to-purple-600/10", dataPoints: "8,203", lastSync: "1 min ago" },
  { id: "quickbooks", name: "QuickBooks", category: "finance", description: "Import accounting data including P&L, expenses, and cash flow.", icon: "💰", status: "available", color: "from-green-500/20 to-emerald-600/10" },
  { id: "xero", name: "Xero", category: "finance", description: "Connect your Xero accounting for financial insights and reporting.", icon: "📘", status: "coming_soon", color: "from-blue-400/20 to-sky-600/10" },
]

const categories: Category[] = [
  { id: "all", label: "All Integrations", icon: "🔗" },
  { id: "crm", label: "CRM", icon: "👥" },
  { id: "erp", label: "ERP", icon: "🏢" },
  { id: "spreadsheet", label: "Spreadsheets", icon: "📊" },
  { id: "database", label: "Databases", icon: "🗄️" },
  { id: "communication", label: "Communication", icon: "💬" },
  { id: "finance", label: "Finance", icon: "💳" },
]

const stats = [
  { label: "Connected Sources", value: "7", icon: "🔌", color: "text-indigo-400" },
  { label: "Records Synced", value: "504K+", icon: "🔄", color: "text-emerald-400" },
  { label: "Avg Sync Latency", value: "< 30s", icon: "⚡", color: "text-amber-400" },
  { label: "Data Freshness", value: "99.8%", icon: "✅", color: "text-indigo-400" },
]

const dataFlowSteps = [
  { label: "Connect", desc: "Authorize your tools with secure OAuth or API keys", icon: "🔐", color: "bg-indigo-500/20 border-indigo-500/40" },
  { label: "Map", desc: "Define field mappings and transformation rules visually", icon: "🗺️", color: "bg-violet-500/20 border-violet-500/40" },
  { label: "Sync", desc: "Data flows automatically on schedules or real-time webhooks", icon: "⚡", color: "bg-amber-500/20 border-amber-500/40" },
  { label: "Analyze", desc: "AI models consume unified data to generate business insights", icon: "🤖", color: "bg-emerald-500/20 border-emerald-500/40" },
]

export default function IntegrationHub() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [connectedIds, setConnectedIds] = useState<string[]>([])
  const [pulse, setPulse] = useState(false)
  const [activeTab, setActiveTab] = useState<"browse" | "connected" | "pipeline">("browse")

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => !prev)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleConnect = async (id: string) => {
    setConnectingId(id)
    await new Promise(r => setTimeout(r, 2000))
    setConnectedIds(prev => [...prev, id])
    setConnectingId(null)
  }

  const filtered = integrations.filter(i => {
    const matchCat = activeCategory === "all" || i.category === activeCategory
    const matchSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const connectedIntegrations = integrations.filter(i =>
    i.status === "connected" || connectedIds.includes(i.id)
  )

  const getStatusBadge = (integration: Integration) => {
    const isNewlyConnected = connectedIds.includes(integration.id)
    if (isNewlyConnected || integration.status === "connected") {
      return (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-1">
          <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${pulse ? "opacity-100" : "opacity-40"} transition-opacity`} />
          Connected
        </span>
      )
    }
    if (integration.status === "coming_soon") {
      return (
        <span className="text-xs font-semibold text-zinc-500 bg-zinc-800 border border-zinc-700 rounded-full px-2.5 py-1">
          Coming Soon
        </span>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 25% 25%, rgba(99,102,241,0.06) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16,185,129,0.05) 0%, transparent 50%)",
      }} />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold">O</div>
            <span className="text-lg font-bold text-white">Onneta</span>
            <span className="text-zinc-600 mx-2">|</span>
            <span className="text-sm text-zinc-400">Integration Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${pulse ? "opacity-100" : "opacity-50"} transition-opacity`} />
              All Systems Operational
            </div>
            <button className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
              + New Integration
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-6">
            🔗 Integration Foundation Layer
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Connect Every{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Business Tool
            </span>{" "}
            to Onneta AI
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed mb-10">
            Build the unified data foundation that powers intelligent analytics and AI insights.
            Connect your CRMs, ERPs, databases, and spreadsheets — all in one hub.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
              ⚡ Quick Connect Setup
            </button>
            <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl border border-zinc-700 transition-all hover:scale-105 flex items-center gap-2">
              📖 View API Docs
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
          {stats.map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center hover:border-zinc-700 transition-colors">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`text-3xl font-extrabold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-xs text-zinc-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">⚙️ How Data Flows Into Onneta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {dataFlowSteps.map((step, i) => (
              <div key={step.label} className="relative">
                <div className={`border ${step.color} rounded-xl p-5 h-full`}>
                  <div className="text-2