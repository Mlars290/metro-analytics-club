import { useState, useMemo } from 'react'
import {
  Wallet, TrendingUp, TrendingDown, AlertCircle, Sparkles, Target,
  Calendar, Users, Award, ArrowUpRight, Filter, BarChart3
} from 'lucide-react'
import {
  BUDGET, SPEND_BY_CATEGORY, EVENTS, SPONSORSHIPS, STAGES,
  eventROI, roiTier, stageColor
} from '../data/treasurerData'

// ============================================================================
// TREASURER DASHBOARD
//
// A demo-ready view showing how the Treasurer role can extend beyond simple
// budgeting into finance + analytics. Pulls from src/data/treasurerData.js.
// All numbers are mock — easy to tweak in that file before the meeting.
// ============================================================================

export default function Treasurer() {
  const remaining = BUDGET.totalAllocated - BUDGET.spent
  const burnPct   = Math.round((BUDGET.spent / BUDGET.totalAllocated) * 100)
  // Assume we're ~60% through the semester for the "pacing" indicator
  const semesterPct = 60
  const pacing = burnPct > semesterPct + 10 ? 'over'
              : burnPct < semesterPct - 10 ? 'under'
              : 'on-track'

  return (
    <div className="space-y-6">
      <Header />

      {/* Top stat row — four key numbers at a glance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet} iconBg="bg-emerald-100 text-emerald-700"
          label="Total Budget"
          value={`$${BUDGET.totalAllocated.toLocaleString()}`}
          sub={`As of ${BUDGET.asOf}`}
        />
        <StatCard
          icon={TrendingDown} iconBg="bg-brand-100 text-brand-700"
          label="Spent to Date"
          value={`$${BUDGET.spent.toLocaleString()}`}
          sub={`${burnPct}% of total`}
        />
        <StatCard
          icon={Target} iconBg="bg-sky-100 text-sky-700"
          label="Remaining"
          value={`$${remaining.toLocaleString()}`}
          sub={`${100 - burnPct}% available`}
        />
        <StatCard
          icon={pacing === 'over' ? AlertCircle : pacing === 'under' ? TrendingUp : Sparkles}
          iconBg={pacing === 'over' ? 'bg-rose-100 text-rose-700'
                  : pacing === 'under' ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'}
          label="Pacing"
          value={pacing === 'over' ? 'Over budget' : pacing === 'under' ? 'Under-spending' : 'On track'}
          sub={`${burnPct}% spent · ${semesterPct}% of semester`}
          tone={pacing === 'over' ? 'rose' : pacing === 'under' ? 'amber' : 'emerald'}
        />
      </div>

      {/* Two-column layout: money on left, analytics on right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <SpendByCategoryCard />
          <EventROICard />
        </div>

        <div className="space-y-6">
          <SponsorshipFunnelCard />
          <InsightsCard />
          <NextActionsCard />
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// HEADER
// ----------------------------------------------------------------------------
function Header() {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-md">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Treasurer Dashboard</h2>
            <p className="text-sm text-slate-500">
              Track budget, evaluate events, and make smarter decisions for the club.
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn-secondary text-sm">
          <Calendar className="w-4 h-4" /> Spring 2026
        </button>
        <button className="btn-primary text-sm">
          <ArrowUpRight className="w-4 h-4" /> Generate Report
        </button>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// STAT CARD
// ----------------------------------------------------------------------------
function StatCard({ icon: Icon, iconBg, label, value, sub, tone }) {
  const subColors = {
    rose:    'text-rose-600',
    amber:   'text-amber-600',
    emerald: 'text-emerald-600'
  }
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-slate-500 font-medium">{label}</div>
          <div className="text-xl font-bold text-navy-900 leading-tight truncate">{value}</div>
        </div>
      </div>
      {sub && (
        <div className={`text-[11px] font-semibold mt-3 ${subColors[tone] || 'text-slate-500'}`}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// SPEND BY CATEGORY (horizontal bar comparison: spent vs budget)
// ----------------------------------------------------------------------------
function SpendByCategoryCard() {
  const totalBudget = SPEND_BY_CATEGORY.reduce((s, c) => s + c.budget, 0)

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-navy-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-600" /> Spend by Category
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Where the money is going vs. where it was budgeted to go.</p>
        </div>
      </div>

      <div className="space-y-4">
        {SPEND_BY_CATEGORY.map((c) => {
          const pct = Math.round((c.spent / c.budget) * 100)
          const overBudget = c.spent > c.budget
          return (
            <div key={c.category}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="font-semibold text-navy-800">{c.category}</span>
                </div>
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-navy-900">${c.spent.toLocaleString()}</span>
                  <span className="mx-1">of</span>
                  <span>${c.budget.toLocaleString()}</span>
                  <span className={`ml-2 font-bold ${overBudget ? 'text-rose-600' : pct > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                {/* Budget benchmark line */}
                <div
                  className={`h-full rounded-full transition-all`}
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: overBudget ? '#f43f5e' : c.color
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// EVENT ROI TABLE
// ----------------------------------------------------------------------------
function EventROICard() {
  const [sortBy, setSortBy] = useState('roi') // 'roi' | 'cost' | 'date'
  const [filter, setFilter] = useState('All')

  const types = ['All', ...new Set(EVENTS.map((e) => e.type))]

  const sorted = useMemo(() => {
    let list = filter === 'All' ? [...EVENTS] : EVENTS.filter((e) => e.type === filter)
    list = list.map((e) => ({ ...e, roi: eventROI(e) }))
    if (sortBy === 'roi')  list.sort((a, b) => b.roi - a.roi)
    if (sortBy === 'cost') list.sort((a, b) => b.cost - a.cost)
    if (sortBy === 'date') list.sort((a, b) => a.date.localeCompare(b.date))
    return list
  }, [sortBy, filter])

  const avgROI = sorted.length === 0 ? 0
    : Math.round((sorted.reduce((s, e) => s + e.roi, 0) / sorted.length) * 10) / 10
  const totalCost = sorted.reduce((s, e) => s + e.cost, 0)
  const totalAttendance = sorted.reduce((s, e) => s + e.attendance, 0)

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-navy-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Which events are worth running again?
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cost vs. attendance × engagement. Higher ROI = more value per dollar spent.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs font-semibold text-navy-700 cursor-pointer hover:border-brand-300 transition focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
            <svg className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="relative">
            <BarChart3 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs font-semibold text-navy-700 cursor-pointer hover:border-brand-300 transition focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="roi">Sort by ROI</option>
              <option value="cost">Sort by cost</option>
              <option value="date">Sort by date</option>
            </select>
            <svg className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Roll-up row */}
      <div className="grid grid-cols-3 gap-3 mb-5 p-3 bg-slate-50 rounded-xl">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Total Spent</div>
          <div className="text-base font-bold text-navy-900">${totalCost.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Total Attendance</div>
          <div className="text-base font-bold text-navy-900">{totalAttendance.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Avg ROI Score</div>
          <div className="text-base font-bold text-navy-900">{avgROI}</div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
              <th className="px-2 pb-2 font-semibold">Event</th>
              <th className="px-2 pb-2 font-semibold">Cost</th>
              <th className="px-2 pb-2 font-semibold">Attendance</th>
              <th className="px-2 pb-2 font-semibold">Engagement</th>
              <th className="px-2 pb-2 font-semibold">ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((e) => {
              const tier = roiTier(e.roi)
              const tierColors = {
                emerald: 'bg-emerald-100 text-emerald-800',
                sky:     'bg-sky-100 text-sky-800',
                amber:   'bg-amber-100 text-amber-800',
                rose:    'bg-rose-100 text-rose-800'
              }
              return (
                <tr key={e.name} className="hover:bg-slate-50">
                  <td className="px-2 py-3">
                    <div className="font-semibold text-navy-900">{e.name}</div>
                    <div className="text-[11px] text-slate-500">{e.date} · {e.type}</div>
                  </td>
                  <td className="px-2 py-3 text-navy-800 font-semibold">${e.cost.toLocaleString()}</td>
                  <td className="px-2 py-3 text-navy-800 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    {e.attendance}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-navy-800">{e.engagement.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400">/ 5</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-navy-900 w-8 text-right">{e.roi.toFixed(1)}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierColors[tier.tone]}`}>
                        {tier.label.toUpperCase()}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-brand-50 border border-brand-100 rounded-xl text-xs text-brand-900 flex gap-2 items-start">
        <Sparkles className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" />
        <div>
          <strong>Insight:</strong> Workshops have the highest ROI ({sorted.filter((e) => e.type === 'Workshop').length > 0 ? `avg ${(sorted.filter((e) => e.type === 'Workshop').reduce((s, e) => s + e.roi, 0) / sorted.filter((e) => e.type === 'Workshop').length).toFixed(1)}` : 'N/A'}) per dollar.
          Socials cost more per engaged attendee — consider scaling them down or adding more learning content.
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// SPONSORSHIP FUNNEL
// ----------------------------------------------------------------------------
function SponsorshipFunnelCard() {
  const totalReceived = SPONSORSHIPS
    .filter((s) => s.stage === 'Funds Received')
    .reduce((s, x) => s + x.amount, 0)
  const totalCommitted = SPONSORSHIPS
    .filter((s) => s.stage === 'Verbal Yes' || s.stage === 'Funds Received')
    .reduce((s, x) => s + x.amount, 0)
  const totalPipeline = SPONSORSHIPS.reduce((s, x) => s + x.amount, 0)

  // Group by stage for visual funnel
  const byStage = STAGES.map((stage) => ({
    stage,
    items: SPONSORSHIPS.filter((s) => s.stage === stage),
    total: SPONSORSHIPS.filter((s) => s.stage === stage).reduce((s, x) => s + x.amount, 0)
  }))

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h3 className="font-bold text-navy-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Sponsorship Pipeline
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Funding from prospect to received.</p>
      </div>

      {/* Funnel summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-3 bg-emerald-50 rounded-xl">
          <div className="text-[10px] uppercase font-semibold text-emerald-700 tracking-wide">Received</div>
          <div className="text-lg font-bold text-emerald-900">${totalReceived.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl">
          <div className="text-[10px] uppercase font-semibold text-amber-700 tracking-wide">Committed</div>
          <div className="text-lg font-bold text-amber-900">${totalCommitted.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <div className="text-[10px] uppercase font-semibold text-slate-600 tracking-wide">Pipeline</div>
          <div className="text-lg font-bold text-navy-900">${totalPipeline.toLocaleString()}</div>
        </div>
      </div>

      {/* Stage list */}
      <div className="space-y-3">
        {byStage.map(({ stage, items, total }) => (
          <div key={stage}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600">{stage}</div>
              <div className="text-xs text-slate-500">${total.toLocaleString()} · {items.length}</div>
            </div>
            {items.length === 0 ? (
              <div className="text-xs text-slate-400 italic px-3 py-2">— none yet —</div>
            ) : (
              <div className="space-y-1.5">
                {items.map((s) => (
                  <div key={s.sponsor}
                       className={`p-2.5 rounded-lg flex items-center justify-between gap-2 ${stageColor(s.stage)}`}>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{s.sponsor}</div>
                      <div className="text-[10px] opacity-75 truncate">{s.contact}</div>
                    </div>
                    <div className="text-sm font-bold shrink-0">${s.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// INSIGHTS / RECOMMENDATIONS CARD
// ----------------------------------------------------------------------------
function InsightsCard() {
  return (
    <div className="card p-6 bg-gradient-to-br from-brand-50 to-white border-brand-100">
      <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-brand-500" /> Treasurer Insights
      </h3>
      <ul className="space-y-3 text-sm text-navy-800">
        <li className="flex gap-2">
          <span className="text-emerald-600 font-bold mt-0.5">✓</span>
          <span><strong>Run more workshops.</strong> Highest ROI format — avg engagement 4.5/5 at $50–120/event. Scale up next semester.</span>
        </li>
        <li className="flex gap-2">
          <span className="text-amber-600 font-bold mt-0.5">⚠</span>
          <span><strong>Reduce social spending.</strong> Banquet ($680) and mixer ($450) account for 40% of spend at 3.6–4.1 engagement. Lower return per attendee.</span>
        </li>
        <li className="flex gap-2">
          <span className="text-brand-600 font-bold mt-0.5">💰</span>
          <span><strong>Follow up with Regional Bank this week.</strong> $1,000 verbal commit covers the remaining MinneMUDAC travel gap.</span>
        </li>
        <li className="flex gap-2">
          <span className="text-slate-500 font-bold mt-0.5">○</span>
          <span><strong>Reserve $130 in Misc</strong> for end-of-semester surprises. No action needed yet.</span>
        </li>
      </ul>
      <div className="mt-4 pt-4 border-t border-brand-100 text-[11px] text-slate-500 space-y-1">
        <div>These insights are auto-generated from event ROI + sponsorship data. In Phase 2, they'll update live as new events log.</div>
        <div className="flex items-center gap-1.5 text-brand-700 font-medium pt-1">
          <Users className="w-3 h-3" /> Shareable with President &amp; VP for budget planning.
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// NEXT ACTIONS CARD
// Concrete next-step list to balance the right column visually and reinforce
// that the Treasurer role drives decisions, not just reports them.
// ----------------------------------------------------------------------------
function NextActionsCard() {
  const actions = [
    { label: 'Follow up with Regional Bank',  due: 'This week',     priority: 'high' },
    { label: 'Pitch Insurance Analytics Co.', due: 'Next 2 weeks',  priority: 'med'  },
    { label: 'Review banquet ROI with team',  due: 'Before May 5',  priority: 'med'  },
    { label: 'Lock in Q4 budget reserve plan', due: 'End of month', priority: 'low'  }
  ]
  const tone = {
    high: { dot: 'bg-rose-500',    label: 'High'   },
    med:  { dot: 'bg-amber-500',   label: 'Medium' },
    low:  { dot: 'bg-slate-300',   label: 'Low'    }
  }
  return (
    <div className="card p-6">
      <h3 className="font-bold text-navy-900 flex items-center gap-2 mb-1">
        <Target className="w-4 h-4 text-emerald-600" /> Next Actions
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Concrete moves for this Treasurer this month.
      </p>
      <ul className="space-y-2.5">
        {actions.map((a) => (
          <li key={a.label} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition cursor-pointer">
            <div className={`w-2 h-2 rounded-full ${tone[a.priority].dot} mt-1.5 shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-navy-900 leading-snug">{a.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Due: {a.due}</div>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0 mt-1">
              {tone[a.priority].label}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
