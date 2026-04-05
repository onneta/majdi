"use client"

import { useState, useEffect, useRef } from "react"

type Priority = "critical" | "high" | "medium" | "low"
type Category = "growth" | "efficiency" | "risk" | "opportunity" | "retention"

interface Recommendation {
  id: string
  title: string
  summary: string
  rationale: string
  impact: string
  effort: "low" | "medium" | "high"
  priority: Priority
  category: Category
  confidence: number
  metrics: { label: string; value: string; trend: "up" | "down" | "neutral" }[]
  actions: string[]
  timeframe: string
  dismissed: boolean
  bookmarked: boolean
}

interface InsightStat {
  label: string
  value: string
  change: string
  positive: boolean
  icon: string
}

const initialRecommendations: Recommendation[] = [
  {
    id: "rec-001",
    title: "Accelerate Enterprise Tier Upsell Campaign",
    summary: "42 active accounts show behavioral signals indicating readiness for enterprise upgrade within 30 days.",
    rationale: "Usage patterns across these accounts show >85% feature utilization, 3+ team members added in last 14 days, and repeated API limit encounters. Historical conversion data shows similar patterns convert at 67% when approached within 30 days.",
    impact: "Projected $184K ARR increase with 67% confidence based on cohort analysis.",
    effort: "low",
    priority: "critical",
    category: "growth",
    confidence: 92,
    metrics: [
      { label: "Accounts Ready", value: "42", trend: "up" },
      { label: "Projected ARR", value: "$184K", trend: "up" },
      { label: "Conversion Rate", value: "67%", trend: "up" },
    ],
    actions: [
      "Trigger personalized in-app upgrade modal for flagged accounts",
      "Brief CSM team on top 10 high-value targets",
      "Prepare ROI calculator specific to each vertical",
    ],
    timeframe: "Act within 30 days",
    dismissed: false,
    bookmarked: false,
  },
  {
    id: "rec-002",
    title: "Reduce Churn Risk in Mid-Market Cohort",
    summary: "18 mid-market accounts show early disengagement signals. Intervention now could prevent $92K ARR loss.",
    rationale: "Login frequency dropped 40% over 21 days, support tickets decreased (indicating silent churn, not active use), and NPS responses from these accounts trended negative in last quarterly survey. Predictive model assigns 74% churn probability within 60 days.",
    impact: "Prevent estimated $92K ARR attrition over next two quarters.",
    effort: "medium",
    priority: "critical",
    category: "retention",
    confidence: 87,
    metrics: [
      { label: "At-Risk Accounts", value: "18", trend: "up" },
      { label: "ARR at Risk", value: "$92K", trend: "down" },
      { label: "Churn Probability", value: "74%", trend: "up" },
    ],
    actions: [
      "Schedule executive business reviews for top 5 at-risk accounts",
      "Deploy re-engagement email sequence with success stories",
      "Offer complimentary onboarding refresh sessions",
    ],
    timeframe: "Immediate — next 14 days",
    dismissed: false,
    bookmarked: false,
  },
  {
    id: "rec-003",
    title: "Optimize Onboarding Flow — Day 7 Drop-off",
    summary: "23% of new signups abandon onboarding at the data integration step, creating a significant activation gap.",
    rationale: "Funnel analysis shows consistent drop-off at step 4 (data source connection). Session recordings reveal users spend avg. 8.3 minutes on this step vs. 1.2 minutes on other steps. Accounts who complete integration generate 4.2x more revenue at 90 days.",
    impact: "Estimated 15% improvement in activation rate = ~31 additional activated accounts/month.",
    effort: "medium",
    priority: "high",
    category: "efficiency",
    confidence: 89,
    metrics: [
      { label: "Drop-off Rate", value: "23%", trend: "down" },
      { label: "Time on Step", value: "8.3 min", trend: "up" },
      { label: "Revenue Multiplier", value: "4.2x", trend: "up" },
    ],
    actions: [
      "Add guided tooltip walkthrough for data integration step",
      "Create one-click sample dataset for immediate value demonstration",
      "Introduce async onboarding option with async support",
    ],
    timeframe: "Ship within 3 sprints",
    dismissed: false,
    bookmarked: false,
  },
  {
    id: "rec-004",
    title: "Expand to Healthcare Vertical — Market Signal",
    summary: "Organic inbound from healthcare sector up 340% QoQ. Existing healthcare customers show highest LTV in portfolio.",
    rationale: "14 healthcare companies have signed up organically in Q3 without marketing spend. Their avg. contract value is $28K vs. $14K portfolio average. LinkedIn engagement on compliance-focused content outperforms other topics by 5.8x. Competitor analysis shows no dominant AI analytics player in healthcare mid-market.",
    impact: "TAM expansion opportunity estimated at $2.3M ARR over 18 months with focused GTM.",
    effort: "high",
    priority: "high",
    category: "opportunity",
    confidence: 76,
    metrics: [
      { label: "Inbound Growth", value: "340%", trend: "up" },
      { label: "Avg Contract Value", value: "$28K", trend: "up" },
      { label: "Content Engagement", value: "5.8x", trend: "up" },
    ],
    actions: [
      "Develop HIPAA compliance documentation and security whitepaper",
      "Build healthcare-specific landing page with case studies",
      "Identify and engage 3 potential lighthouse customers",
    ],
    timeframe: "Strategic — Q1 initiative",
    dismissed: false,
    bookmarked: false,
  },
  {
    id: "rec-005",
    title: "Automate Monthly Reporting for Power Users",
    summary: "Top 12% of users generate 68% of manual export requests. Automated reporting could save ~340 hours/month.",
    rationale: "Usage logs identify 47 users performing identical export sequences weekly. Average session for this workflow is 22 minutes. These power users also show highest retention correlation — removing friction here directly impacts NPS and expansion revenue.",
    impact: "Save 340 hours/month user time, projected NPS improvement of +8 points among power users.",
    effort: "low",
    priority: "medium",
    category: "efficiency",
    confidence: 94,
    metrics: [
      { label: "Power Users", value: "47", trend: "neutral" },
      { label: "Hours Saved/Mo", value: "340", trend: "up" },
      { label: "NPS Impact", value: "+8 pts", trend: "up" },
    ],
    actions: [
      "Build scheduled report delivery feature with template library",
      "Beta test with top 10 power users for feedback",
      "Add report automation to enterprise tier as differentiator",
    ],
    timeframe: "Next sprint cycle",
    dismissed: false,
    bookmarked: false,
  },
  {
    id: "rec-006",
    title: "Address API Latency Spike — Customer Impact Risk",
    summary: "P95 API response time increased 180ms over 7 days. 3 enterprise accounts have mentioned it in support channels.",
    rationale: "Infrastructure monitoring shows degradation correlating with new ML model deployment. Enterprise SLA guarantees <200ms P95 response. Current P95 is 287ms — a breach that could trigger SLA credits and erode trust with highest-value accounts.",
    impact: "Prevent SLA credit exposure ($43K) and protect NPS for 8 enterprise accounts representing $620K ARR.",
    effort: "medium",
    priority: "critical",
    category: "risk",
    confidence: 98,
    metrics: [
      { label: "P95 Latency", value: "287ms", trend: "down" },
      { label: "SLA Threshold", value: "200ms", trend: "neutral" },
      { label: "ARR at Risk", value: "$620K", trend: "down" },
    ],
    actions: [
      "Immediate: Roll back or optimize new ML model inference pipeline",
      "Proactively communicate to affected enterprise accounts",
      "Add automated SLA alerting before threshold breach",
    ],
    timeframe: "Critical — resolve within 48 hours",
    dismissed: false,
    bookmarked: false,
  },
]

const stats: InsightStat[] = [
  { label: "Active Recommendations", value: "24", change: "+6 this week", positive: true, icon: "💡" },
  { label: "Projected Revenue Impact", value: "$892K", change: "+$184K from new signals", positive: true, icon: "📈" },
  { label: "ARR at Risk", value: "$712K", change: "−$90K mitigated", positive: true, icon: "🛡️" },
  { label: "Confidence Score Avg", value: "89%", change: "+3% model accuracy", positive: true, icon: "🎯" },
]

const categoryConfig: Record<Category, { label: string; color: string; bg: string; icon: string }> = {
  growth: { label: "Growth", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", icon: "🚀" },
  efficiency: { label: "Efficiency", color: "text-indigo-400", bg: "bg-indigo-400/10 border-indigo-400/20", icon: "⚡" },
  risk: { label: "Risk", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: "⚠️" },
  opportunity: { label: "Opportunity", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", icon: "✨" },
  retention: { label: "Retention", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20", icon: "🔒" },
}

const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  critical: { label: "Critical", color: "text-red-400", dot: "bg-red-400" },
  high: { label: "High", color: "text-amber-400", dot: "bg-amber-400" },
  medium: { label: "Medium", color: "text-indigo-400", dot: "bg-indigo-400" },
  low: { label: "Low", color: "text-zinc-400", dot: "bg-zinc-400" },
}

const effortConfig = {
  low: { label: "Low Effort", color: "text-emerald-400" },
  medium: { label: "Med Effort", color: "text-amber-400" },
  high: { label: "High Effort", color: "text-red-400" },
}

export default function RecommendationsEngine() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations)
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")
  const [selectedPriority, setSelectedPriority] = useState<Priority | "all">("all")
  const [expandedId, setExpandedId] = useState<string | null>("rec-001")
  const [activeTab, setActiveTab] = useState<"recommendations" | "insights" | "signals">("recommendations")
  const [showDismissed, setShowDismissed] = useState(false)
  const [pulseIndex, setPulseIndex] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPulseIndex(prev => (prev + 1) % 6)
    }, 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastRefreshed(new Date())
    }, 2000)
  }

  const handleDismiss = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, dismissed: true } : r))
    if (expandedId === id) setExpandedId(null)
  }

  const handleBookmark = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, bookmarked: !r.bookmarked } : r))
  }

  const handleRestore = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, dismissed: false } : r))
  }

  const filtered = recommendations.filter(r => {
    if (!showDismissed && r.dismissed) return false
    if (showDismissed && !r.dismissed) return false
    if (selectedCategory !== "all" && r.category !== selectedCategory) return false
    if (selectedPriority !== "all" && r.priority !== selectedPriority) return false
    return true
  })

  const activeCount = recommendations.filter(r => !r.dismissed).length
  const criticalCount = recommendations.filter(r => r.priority === "critical" && !r.dismissed).length

  const signalData = [
    { label: "User Engagement Drop", source: "Analytics", time: "2 min ago", type: "risk" as Category },
    { label: "Feature Adoption Spike: AI Reports", source: "Product", time: "18 min ago", type: "growth" as Category },
    { label: "Support Volume +34%", source: "Helpdesk", time: "1 hr ago", type: "risk" as Category },
    { label: "New Segment: SMB Fintech", source: "CRM", time: "3 hr ago", type: "opportunity" as Category },
    { label: "API Error Rate Elevated", source: "Infra", time: "4 hr ago", type: "risk" as Category },
    { label: "Competitor Price Change Detected", source: "Intelligence", time: "6 hr ago", type: "opportunity" as Category },
    { label: "Q4 Budget Cycle Starting", source: "Calendar", time: "12 hr ago", type: "growth" as Category },
    { label: "Referral Program Usage +89%", source: "Growth", time: "1 day ago", type: "growth" as Category },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[200px] bg-violet-600/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row