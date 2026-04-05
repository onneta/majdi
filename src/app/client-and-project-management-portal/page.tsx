"use client"

import { useState, useEffect } from "react"

type Client = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: "active" | "inactive" | "prospect"
  avatar: string
  projects: number
  revenue: string
  since: string
}

type Task = {
  id: string
  title: string
  assignee: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  due: string
}

type Project = {
  id: string
  name: string
  clientId: string
  client: string
  status: "planning" | "active" | "review" | "completed" | "paused"
  progress: number
  budget: string
  spent: string
  startDate: string
  deadline: string
  description: string
  tasks: Task[]
  team: string[]
  priority: "low" | "medium" | "high"
}

const initialClients: Client[] = [
  { id: "c1", name: "Sarah Chen", company: "NexaTech Solutions", email: "sarah@nexatech.io", phone: "+1 (555) 201-4832", status: "active", avatar: "SC", projects: 3, revenue: "$124,500", since: "Jan 2023" },
  { id: "c2", name: "Marcus Webb", company: "Orbis Ventures", email: "m.webb@orbis.com", phone: "+1 (555) 387-9201", status: "active", avatar: "MW", projects: 2, revenue: "$89,200", since: "Mar 2023" },
  { id: "c3", name: "Priya Nair", company: "Luminary Health", email: "priya.n@luminaryhealth.co", phone: "+1 (555) 562-7741", status: "prospect", avatar: "PN", projects: 1, revenue: "$12,000", since: "Oct 2023" },
  { id: "c4", name: "Dani Kowalski", company: "Forge Analytics", email: "dani@forgeanalytics.io", phone: "+1 (555) 419-3380", status: "active", avatar: "DK", projects: 4, revenue: "$210,000", since: "Aug 2022" },
  { id: "c5", name: "James Osei", company: "BrightMind AI", email: "j.osei@brightmind.ai", phone: "+1 (555) 774-2219", status: "inactive", avatar: "JO", projects: 1, revenue: "$45,000", since: "Feb 2023" },
]

const initialProjects: Project[] = [
  {
    id: "p1", name: "AI Pipeline Automation", clientId: "c1", client: "NexaTech Solutions",
    status: "active", progress: 68, budget: "$85,000", spent: "$57,800",
    startDate: "Feb 1, 2024", deadline: "May 30, 2024",
    description: "End-to-end ML pipeline for automated data processing and model deployment.",
    priority: "high",
    team: ["Alex R.", "Jamie L.", "Sam T."],
    tasks: [
      { id: "t1", title: "Design data ingestion architecture", assignee: "Alex R.", status: "done", priority: "high", due: "Feb 15" },
      { id: "t2", title: "Implement model versioning system", assignee: "Jamie L.", status: "in-progress", priority: "high", due: "Mar 28" },
      { id: "t3", title: "Build monitoring dashboard", assignee: "Sam T.", status: "in-progress", priority: "medium", due: "Apr 10" },
      { id: "t4", title: "QA & stress testing", assignee: "Alex R.", status: "todo", priority: "medium", due: "May 10" },
    ]
  },
  {
    id: "p2", name: "Customer Insight Platform", clientId: "c4", client: "Forge Analytics",
    status: "active", progress: 42, budget: "$120,000", spent: "$50,400",
    startDate: "Jan 15, 2024", deadline: "Jun 30, 2024",
    description: "Real-time analytics dashboard powered by AI-driven customer segmentation.",
    priority: "high",
    team: ["Morgan K.", "Riley P.", "Chris N."],
    tasks: [
      { id: "t5", title: "Define KPI schema", assignee: "Morgan K.", status: "done", priority: "high", due: "Jan 28" },
      { id: "t6", title: "Integrate CRM data sources", assignee: "Riley P.", status: "in-progress", priority: "high", due: "Mar 20" },
      { id: "t7", title: "Build segmentation model", assignee: "Chris N.", status: "todo", priority: "high", due: "Apr 30" },
      { id: "t8", title: "UI/UX dashboard design", assignee: "Morgan K.", status: "todo", priority: "medium", due: "May 15" },
    ]
  },
  {
    id: "p3", name: "Predictive Maintenance MVP", clientId: "c2", client: "Orbis Ventures",
    status: "review", progress: 90, budget: "$60,000", spent: "$54,200",
    startDate: "Nov 1, 2023", deadline: "Mar 31, 2024",
    description: "IoT-integrated predictive maintenance system with anomaly detection.",
    priority: "medium",
    team: ["Taylor B.", "Jordan H."],
    tasks: [
      { id: "t9", title: "Sensor data pipeline", assignee: "Taylor B.", status: "done", priority: "high", due: "Dec 10" },
      { id: "t10", title: "Anomaly detection model", assignee: "Jordan H.", status: "done", priority: "high", due: "Jan 20" },
      { id: "t11", title: "Client review & feedback", assignee: "Taylor B.", status: "in-progress", priority: "medium", due: "Mar 25" },
    ]
  },
  {
    id: "p4", name: "Healthcare AI Chatbot", clientId: "c3", client: "Luminary Health",
    status: "planning", progress: 12, budget: "$45,000", spent: "$5,400",
    startDate: "Mar 1, 2024", deadline: "Aug 15, 2024",
    description: "HIPAA-compliant conversational AI for patient triage and appointment scheduling.",
    priority: "medium",
    team: ["Sam T.", "Morgan K."],
    tasks: [
      { id: "t12", title: "Requirements & compliance audit", assignee: "Sam T.", status: "in-progress", priority: "high", due: "Mar 20" },
      { id: "t13", title: "LLM selection & fine-tuning plan", assignee: "Morgan K.", status: "todo", priority: "high", due: "Apr 5" },
    ]
  },
  {
    id: "p5", name: "Sales Forecasting Engine", clientId: "c4", client: "Forge Analytics",
    status: "completed", progress: 100, budget: "$75,000", spent: "$71,300",
    startDate: "Sep 1, 2023", deadline: "Jan 15, 2024",
    description: "ML-powered quarterly sales forecasting with scenario modeling.",
    priority: "low",
    team: ["Alex R.", "Chris N.", "Riley P."],
    tasks: [
      { id: "t14", title: "Historical data analysis", assignee: "Alex R.", status: "done", priority: "high", due: "Sep 20" },
      { id: "t15", title: "Model training & validation", assignee: "Chris N.", status: "done", priority: "high", due: "Nov 15" },
      { id: "t16", title: "Deployment & handoff", assignee: "Riley P.", status: "done", priority: "medium", due: "Jan 10" },
    ]
  },
]

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  inactive: "bg-zinc-700/50 text-zinc-400 border border-zinc-600/30",
  prospect: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
  planning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  review: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  paused: "bg-zinc-700/50 text-zinc-400 border border-zinc-600/30",
}

const priorityColors: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-zinc-700/50 text-zinc-400",
}

const taskStatusColors: Record<string, string> = {
  "todo": "bg-zinc-700/50 text-zinc-400",
  "in-progress": "bg-indigo-500/20 text-indigo-400",
  "done": "bg-emerald-500/20 text-emerald-400",
}

const avatarColors = ["bg-indigo-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"]

export default function Onneta() {
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "projects" | "analytics">("overview")
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [clientFilter, setClientFilter] = useState<string>("all")
  const [showAddClient, setShowAddClient] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newClient, setNewClient] = useState({ name: "", company: "", email: "", phone: "" })
  const [newProject, setNewProject] = useState({ name: "", client: "", deadline: "", budget: "", description: "" })
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    setAnimateIn(true)
  }, [])

  useEffect(() => {
    setAnimateIn(false)
    const t = setTimeout(() => setAnimateIn(true), 50)
    return () => clearTimeout(t)
  }, [activeTab])

  const totalRevenue = clients.reduce((acc, c) => acc + parseFloat(c.revenue.replace(/[$,]/g, "")), 0)
  const activeProjects = projects.filter(p => p.status === "active").length
  const completedProjects = projects.filter(p => p.status === "completed").length
  const avgProgress = Math.round(projects.filter(p => p.status === "active").reduce((acc, p) => acc + p.progress, 0) / activeProjects)

  const filteredProjects = projects.filter(p => {
    const matchesFilter = projectFilter === "all" || p.status === projectFilter
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.client.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const filteredClients = clients.filter(c => {
    const matchesFilter = clientFilter === "all" || c.status === clientFilter
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleAddClient = () => {
    if (!newClient.name || !newClient.company) return
    const client: Client = {
      id: `c${Date.now()}`,
      name: newClient.name,
      company: newClient.company,
      email: newClient.email,
      phone: newClient.phone,
      status: "prospect",
      avatar: newClient.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
      projects: 0,
      revenue: "$0",
      since: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })
    }
    setClients([...clients, client])
    setNewClient({ name: "", company: "", email: "", phone: "" })
    setShowAddClient(false)
  }

  const handleAddProject = () => {
    if (!newProject.name || !newProject.client) return
    const project: Project = {
      id: `p${Date.now()}`,
      name: newProject.name,
      clientId: `c${Date.now()}`,
      client: newProject.client,
      status: "planning",
      progress: 0,
      budget: newProject.budget || "$0",
      spent: "$0",
      startDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      deadline: newProject.deadline || "TBD",
      description: newProject.description || "",
      priority: "medium",
      team: [],
      tasks: []
    }
    setProjects([...projects, project])
    setNewProject({ name: "", client: "", deadline: "", budget: "", description: "" })
    setShowAddProject(false)
  }

  const updateTaskStatus = (projectId: string, taskId: string, status: Task["status"]) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, status } : t)
      const done = updatedTasks.filter(t => t.status === "done").length
      const progress = Math.round((done / updatedTasks.length) * 100)
      return { ...p, tasks: updatedTasks, progress }
    }))
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => {
        if (!prev) return prev
        const updatedTasks = prev.tasks.map(t => t.id === taskId ? { ...t, status } : t)
        const done = updatedTasks.filter(t => t.status === "done").length
        const progress = Math.round((done / updatedTasks.length) * 100)
        return { ...prev, tasks: updatedTasks, progress }
      })
    }
  }

  const getAvatarColor = (name: string) => {
    const index = name.charCodeAt(0) % avatarColors.length
    return avatarColors[index]
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Hero / Header */}
      <header className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />
        <div