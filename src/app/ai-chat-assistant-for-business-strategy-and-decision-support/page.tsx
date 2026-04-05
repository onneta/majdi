"use client"

import { useState, useRef, useEffect } from "react"

type MessageRole = "user" | "assistant" | "system"

interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  sources?: string[]
  metrics?: { label: string; value: string; change?: string; positive?: boolean }[]
}

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  category: "strategy" | "analytics" | "scenario" | "operations"
}

interface DataSource {
  id: string
  name: string
  icon: string
  status: "connected" | "syncing" | "offline"
  lastSync: string
}

const SAMPLE_CONVERSATIONS: Conversation[] = [
  { id: "1", title: "Q3 Revenue Analysis", lastMessage: "Based on your Q3 data...", timestamp: new Date(Date.now() - 3600000), category: "analytics" },
  { id: "2", title: "Market Expansion Strategy", lastMessage: "For Southeast Asia entry...", timestamp: new Date(Date.now() - 86400000), category: "strategy" },
  { id: "3", title: "Cost Reduction Scenarios", lastMessage: "Scenario A shows 18%...", timestamp: new Date(Date.now() - 172800000), category: "scenario" },
  { id: "4", title: "Supply Chain Optimization", lastMessage: "Your logistics data indicates...", timestamp: new Date(Date.now() - 259200000), category: "operations" },
]

const DATA_SOURCES: DataSource[] = [
  { id: "1", name: "Analytics Dashboard", icon: "📊", status: "connected", lastSync: "2 min ago" },
  { id: "2", name: "CRM Database", icon: "👥", status: "connected", lastSync: "5 min ago" },
  { id: "3", name: "Financial Reports", icon: "💰", status: "syncing", lastSync: "Syncing..." },
  { id: "4", name: "Market Intelligence", icon: "🌐", status: "connected", lastSync: "1 hr ago" },
  { id: "5", name: "Operations Data", icon: "⚙️", status: "offline", lastSync: "Offline" },
]

const SUGGESTED_PROMPTS = [
  { text: "Analyze our Q3 performance vs targets", icon: "📈", category: "analytics" },
  { text: "What's our biggest growth opportunity?", icon: "🚀", category: "strategy" },
  { text: "Simulate a 15% price increase scenario", icon: "🔮", category: "scenario" },
  { text: "Identify top customer churn risks", icon: "⚠️", category: "operations" },
  { text: "Benchmark us against industry leaders", icon: "🏆", category: "strategy" },
  { text: "Forecast next quarter revenue", icon: "📅", category: "analytics" },
]

const CANNED_RESPONSES = [
  "Generate a detailed report",
  "Show me the data breakdown",
  "What are the key risks?",
  "Give me actionable next steps",
  "Compare with last quarter",
]

function generateAIResponse(userMessage: string): Message {
  const responses: { keywords: string[]; response: string; sources: string[]; metrics?: { label: string; value: string; change?: string; positive?: boolean }[] }[] = [
    {
      keywords: ["revenue", "q3", "performance"],
      response: "Based on your connected analytics dashboard and financial reports, here's your Q3 performance overview:\n\n**Revenue Performance:** Your Q3 revenue reached $4.2M, representing a **12.3% increase** vs the same period last year. You exceeded your target by 4.1%.\n\n**Key Drivers:**\n• Enterprise segment grew 28% YoY driven by 3 new Fortune 500 clients\n• Product line 'Onneta Core' contributed 67% of total revenue\n• Geographic expansion in APAC added $380K in new revenue\n\n**Areas of Concern:**\n• SMB segment underperformed by 8% vs target\n• Customer acquisition cost increased 14% vs Q2\n\n**Strategic Recommendation:** Focus Q4 efforts on SMB digital acquisition channels and consider a targeted retention campaign for your 42 at-risk enterprise accounts identified in your CRM.",
      sources: ["Analytics Dashboard", "Financial Reports", "CRM Database"],
      metrics: [
        { label: "Q3 Revenue", value: "$4.2M", change: "+12.3%", positive: true },
        { label: "vs Target", value: "+4.1%", positive: true },
        { label: "Enterprise Growth", value: "+28%", positive: true },
        { label: "CAC Change", value: "+14%", positive: false },
      ],
    },
    {
      keywords: ["growth", "opportunity", "expand"],
      response: "Analyzing your business data across all connected sources, I've identified **3 high-priority growth opportunities** ranked by potential impact:\n\n**🥇 #1 — Enterprise Upsell Program (Est. +$1.8M ARR)**\nYour CRM data shows 127 enterprise customers using only 40% of available features. An AI-driven personalized upsell campaign targeting these accounts could yield $1.8M additional ARR within 12 months.\n\n**🥈 #2 — APAC Market Deepening (Est. +$1.2M ARR)**\nYour current APAC presence is concentrated in 2 markets. Market intelligence data suggests Singapore and Indonesia represent under-penetrated opportunities with strong AI adoption curves.\n\n**🥉 #3 — Professional Services Tier (Est. +$900K ARR)**\nCustomer support tickets reveal 34% of enterprise clients requesting custom implementation support — a gap you're not monetizing today.\n\n**Recommended Next Step:** Prioritize the Enterprise Upsell Program as it requires no new product development and leverages existing relationships.",
      sources: ["CRM Database", "Market Intelligence", "Analytics Dashboard"],
      metrics: [
        { label: "Upsell Potential", value: "$1.8M ARR", positive: true },
        { label: "APAC Opportunity", value: "$1.2M ARR", positive: true },
        { label: "Services Gap", value: "$900K ARR", positive: true },
        { label: "Total Potential", value: "$3.9M ARR", positive: true },
      ],
    },
    {
      keywords: ["price", "scenario", "simulate", "increase"],
      response: "I've run a **price increase scenario simulation** using your historical elasticity data, competitive intelligence, and customer segmentation from connected sources.\n\n**Scenario: 15% Price Increase across All Tiers**\n\n**Projected Outcomes:**\n\n📊 **Revenue Impact:** Net revenue increase of **+8.2%** after accounting for projected churn\n\n📉 **Expected Churn:** 6.8% of SMB customers likely to churn (historically price-sensitive segment); Enterprise churn estimated at 1.2%\n\n💡 **Optimal Strategy:** A **tiered approach** is recommended:\n• Increase Enterprise pricing by 18% — low elasticity, high retention\n• Increase SMB pricing by 8% — balance growth with retention\n• Grandfather existing annual contracts for 90 days\n\n**Risk Factors:**\n• Competitor X currently running promotional pricing — timing risk\n• 12 enterprise renewal negotiations in next 60 days — consider excluding\n\n**Confidence Level:** 81% based on 24 months of historical data patterns.",
      sources: ["Analytics Dashboard", "CRM Database", "Market Intelligence"],
      metrics: [
        { label: "Net Revenue Impact", value: "+8.2%", positive: true },
        { label: "SMB Churn Risk", value: "6.8%", positive: false },
        { label: "Enterprise Churn", value: "1.2%", positive: true },
        { label: "Confidence Score", value: "81%", positive: true },
      ],
    },
    {
      keywords: ["churn", "retention", "customer", "risk"],
      response: "Analyzing your CRM data and usage patterns, I've identified **high-risk accounts** requiring immediate attention.\n\n**⚠️ Churn Risk Summary:** 42 accounts flagged as high-risk, representing $687K ARR at risk.\n\n**Top Risk Signals Detected:**\n• **Low product engagement:** 18 accounts with <30% feature utilization in last 30 days\n• **Support ticket surge:** 9 accounts with 3x normal ticket volume\n• **Decision-maker changes:** 7 accounts with recent C-suite transitions detected via LinkedIn data\n• **Missed QBRs:** 8 accounts that cancelled or missed quarterly business reviews\n\n**Immediate Action Plan:**\n1. **Red Zone (12 accounts, $234K ARR):** Executive outreach within 48 hours\n2. **Yellow Zone (30 accounts, $453K ARR):** Scheduled check-ins + personalized value recap emails\n\n**Predicted Outcome:** Proactive intervention on Red Zone accounts historically reduces churn by 63% based on your past save rate data.",
      sources: ["CRM Database", "Analytics Dashboard"],
      metrics: [
        { label: "ARR at Risk", value: "$687K", positive: false },
        { label: "High-Risk Accounts", value: "42", positive: false },
        { label: "Save Rate (Historical)", value: "63%", positive: true },
        { label: "Recovery Potential", value: "$433K", positive: true },
      ],
    },
    {
      keywords: ["forecast", "quarter", "next", "predict"],
      response: "Using your historical data, current pipeline, and market trend signals, here is your **Q4 Revenue Forecast**.\n\n**Base Case Forecast: $4.6M (+9.5% vs Q3)**\n\n**Forecast Breakdown:**\n• Existing customer renewals: $2.8M (high confidence — 94% renewal rate)\n• Expansion revenue from upsells: $780K\n• New logo acquisition: $620K (based on current pipeline velocity)\n• Professional services: $400K\n\n**Bull Case: $5.1M** — assumes 2 large enterprise deals close in November\n**Bear Case: $4.0M** — assumes SMB headwinds continue and 1 enterprise delay\n\n**Key Variables to Watch:**\n• 3 enterprise deals in final negotiation ($890K combined)\n• SMB pipeline conversion rate (currently trending -6% vs Q3)\n• Planned product launch impact (est. +$150K if October launch holds)\n\n**Model Confidence:** 78% for base case, refreshed with real-time pipeline data.",
      sources: ["CRM Database", "Financial Reports", "Analytics Dashboard"],
      metrics: [
        { label: "Base Case", value: "$4.6M", change: "+9.5%", positive: true },
        { label: "Bull Case", value: "$5.1M", positive: true },
        { label: "Bear Case", value: "$4.0M", positive: false },
        { label: "Forecast Confidence", value: "78%", positive: true },
      ],
    },
  ]

  const lower = userMessage.toLowerCase()
  const matched = responses.find(r => r.keywords.some(k => lower.includes(k)))

  const response = matched || {
    response: `I've analyzed your query across all connected data sources. Here's my strategic assessment:\n\nBased on your current business data from the Analytics Dashboard, CRM, and Market Intelligence feeds, I can provide context-aware insights for: **"${userMessage}"**\n\nTo give you the most accurate analysis, I've cross-referenced:\n• Your latest performance metrics\n• Historical trend data (24-month window)\n• Industry benchmarks from market intelligence\n• Your current strategic objectives\n\n**My Recommendation:** This query touches on multiple dimensions of your business. I'd suggest starting with a focused analysis on your highest-impact area. Would you like me to:\n\n1. 📊 **Deep dive into the data** — full quantitative breakdown\n2. 🎯 **Strategic options** — prioritized action plan\n3. 🔮 **Scenario modeling** — project outcomes of different approaches\n\nJust let me know which direction you'd like to explore, and I'll pull the relevant data from your connected sources.`,
    sources: ["Analytics Dashboard", "CRM Database"],
  }

  return {
    id: Date.now().toString(),
    role: "assistant",
    content: response.response,
    timestamp: new Date(),
    sources: response.sources,
    metrics: response.metrics,
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 86400000) return "Today"
  if (diff < 172800000) return "Yesterday"
  return date.toLocaleDateString()
}

export default function OnnetaAIAssistant() {
  const [activeView, setActiveView] = useState<"chat" | "admin">("chat")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 **Welcome to Onneta AI — your intelligent business partner.**\n\nI'm connected to your Analytics Dashboard, CRM, Financial Reports, and Market Intelligence feeds. Ask me anything about your business — from performance analysis to strategic recommendations and scenario modeling.\n\nWhat would you like to explore today?",
      timestamp: new Date(),
      sources: ["Analytics Dashboard", "CRM Database", "Financial Reports", "Market Intelligence"],
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = (text?: string) => {
    const content = text || inputValue.trim()
    if (!content) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const aiResponse = generateAIResponse(content)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500 + Math.random() * 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const categoryColors: Record<string, string> = {
    analytics: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    strategy: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    scenario: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    operations: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  }

  const filteredConversations = activeCategory === "all"
    ? SAMPLE_CONVERSATIONS
    : SAMPLE_CONVERSATIONS.filter(c => c.category === activeCategory)

  const renderMessageContent = (content: string) => {
    const lines = content.split("\n")
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.