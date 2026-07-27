import {
  CalendarCheck2,
  Check,
  Clock,
  RefreshCw,
  Sparkles,
  TriangleAlert,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import type { AreaTrendPoint, CategoryBar } from '@/components/charts'

/* ---------------------------------------------------------------------------
 * HR Command Center data (design: HR Command Center.dc.html, project 8f1502f5).
 * Org-wide ops for HR / Admin. The design is role-aware (HR vs Admin — mostly
 * identical, a couple of labels/insights differ); this is the HR variant, the
 * app's demo user (Priya Nair). Sparkline/area/bar series reuse the shared
 * components/charts wrappers; the heatmap is a CSS grid (see punctuality-heatmap).
 * ------------------------------------------------------------------------- */

export type IconTone = 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'violet'

export interface HeroKpi {
  key: string
  label: string
  value: string
  delta: string
  /** Sparkline heights (already inverted from the design's SVG y-coords). */
  spark: number[]
}

export interface BentoKpi {
  key: string
  label: string
  value: string
  delta: string
  /** Good deltas render green + a green spark; bad render rose. */
  good: boolean
  spark: number[]
}

export interface AttentionItem {
  id: string
  icon: LucideIcon
  tone: IconTone
  title: string
  meta: string
  /** Optional AI badge text. */
  ai?: string
  primaryLabel: string
  primaryTone: 'primary' | 'destructive' | 'violet'
  ghostLabel?: string
}

export interface Insight {
  id: string
  /** Leading dot colour token. */
  dot: string
  text: string
}

export interface AtRiskPerson {
  id: string
  initials: string
  name: string
  dept: string
  days: string
  avatarColor: string
}

export interface TimelineEvent {
  id: string
  icon: LucideIcon
  tone: IconTone
  text: string
  time: string
}

export interface HeatDept {
  dept: string
  /** Baseline on-time rate; the heatmap derives 10 daily cells from it. */
  base: number
}

export interface CommandCenterData {
  greeting: string
  name: string
  dateLine: string
  roleLabel: string
  presentPct: string
  dayShort: string
  heroKpis: HeroKpi[]
  bento: BentoKpi[]
  attention: AttentionItem[]
  insights: Insight[]
  atRisk: AtRiskPerson[]
  timeline: TimelineEvent[]
  attendanceTrend: { badge: string; points: AreaTrendPoint[] }
  leaveByType: CategoryBar[]
  heatDepts: HeatDept[]
}

const hrData: CommandCenterData = {
  greeting: 'Good morning',
  name: 'Priya',
  dateLine: 'Wednesday, 9 July 2026',
  roleLabel: 'HR Manager',
  presentPct: '93.1',
  dayShort: 'Wed 9 Jul',

  heroKpis: [
    {
      key: 'present',
      label: 'Present today',
      value: '231 / 248',
      delta: '93.1%',
      spark: [10, 14, 11, 20, 18, 24],
    },
    {
      key: 'pending',
      label: 'Pending approvals',
      value: '7',
      delta: '3 urgent',
      spark: [22, 20, 23, 16, 19, 12],
    },
    {
      key: 'on-leave',
      label: 'On leave today',
      value: '12',
      delta: '4.8%',
      spark: [16, 18, 14, 17, 13, 15],
    },
    {
      key: 'mtd',
      label: 'Attendance MTD',
      value: '96.2%',
      delta: '▲ 2.1',
      spark: [8, 12, 10, 17, 20, 23],
    },
  ],

  bento: [
    {
      key: 'avg-hours',
      label: 'Avg hours / day',
      value: '8.4h',
      delta: '+0.2',
      good: true,
      spark: [10, 14, 12, 20, 22],
    },
    {
      key: 'overtime',
      label: 'Overtime · MTD',
      value: '312h',
      delta: '−6%',
      good: true,
      spark: [20, 18, 21, 16, 12],
    },
    {
      key: 'absenteeism',
      label: 'Absenteeism',
      value: '3.1%',
      delta: '−0.4',
      good: true,
      spark: [22, 19, 20, 15, 13],
    },
    {
      key: 'joiners',
      label: 'New joiners · 30d',
      value: '9',
      delta: '+3',
      good: true,
      spark: [10, 13, 12, 18, 21],
    },
  ],

  attention: [
    {
      id: 'lr1',
      icon: CalendarCheck2,
      tone: 'primary',
      title: 'Diya Sharma · Annual leave',
      meta: '12–16 Jul · 5 days · Engineering',
      ai: '2 teammates already off',
      primaryLabel: 'Approve',
      primaryTone: 'primary',
      ghostLabel: 'Review',
    },
    {
      id: 'sync',
      icon: TriangleAlert,
      tone: 'destructive',
      title: 'Attendance sync degraded',
      meta: 'eSSL device #3 · last ok 08:40',
      primaryLabel: 'Retry',
      primaryTone: 'destructive',
    },
    {
      id: 'anom',
      icon: Sparkles,
      // Violet is the design's AI/anomaly accent — not a status role.
      tone: 'violet',
      title: 'Late-punch spike in Operations',
      meta: '+18% vs last week · 6 employees',
      ai: 'AI flagged',
      primaryLabel: 'Investigate',
      primaryTone: 'violet',
      ghostLabel: 'Dismiss',
    },
    {
      id: 'reg1',
      icon: Clock,
      tone: 'warning',
      title: 'Kabir Nair · Missed punch',
      meta: 'Regularisation · 08 Jul · Sales',
      primaryLabel: 'Approve',
      primaryTone: 'primary',
      ghostLabel: 'Reject',
    },
  ],

  insights: [
    {
      id: 'i1',
      dot: 'var(--warning)',
      text: 'Attendance in Sales dipped 2.3% this week — 3 late arrivals traced to the night shift.',
    },
    {
      id: 'i2',
      dot: 'var(--destructive)',
      text: 'Payroll cut-off in 3 days and 4 regularisations are still pending approval.',
    },
    {
      id: 'i3',
      dot: 'var(--primary)',
      text: '6 employees are on track to exhaust annual leave before Q4.',
    },
  ],

  atRisk: [
    {
      id: 'r1',
      initials: 'RM',
      name: 'Reinhold McDermott',
      dept: 'Engineering',
      days: '6.2 d',
      avatarColor: 'var(--chart-1)',
    },
    {
      id: 'r2',
      initials: 'RV',
      name: 'Rosamond VonRueden',
      dept: 'Operations',
      days: '5.8 d',
      avatarColor: 'var(--chart-2)',
    },
    {
      id: 'r3',
      initials: 'JC',
      name: 'Jamal Cremin',
      dept: 'Sales',
      days: '4.1 d',
      avatarColor: 'var(--chart-4)',
    },
  ],

  timeline: [
    {
      id: 't1',
      icon: Check,
      tone: 'success',
      text: "Approved Meera Iyer's sick leave (2 days)",
      time: '09:42 · you',
    },
    {
      id: 't2',
      icon: RefreshCw,
      tone: 'info',
      text: 'Attendance synced · 248 punches imported',
      time: '09:05 · system',
    },
    {
      id: 't3',
      icon: UserPlus,
      tone: 'primary',
      text: 'Arjun Rao joined Operations as Analyst',
      time: '08:30 · onboarding',
    },
    {
      id: 't4',
      icon: TriangleAlert,
      tone: 'destructive',
      text: 'eSSL device #3 stopped reporting',
      time: '08:40 · alert',
    },
  ],

  attendanceTrend: {
    badge: '▲ 2.1%',
    points: [
      { label: 'Jan', value: 92.8 },
      { label: 'Feb', value: 94.0 },
      { label: 'Mar', value: 92.3 },
      { label: 'Apr', value: 95.3 },
      { label: 'May', value: 95.9 },
      { label: 'Jun', value: 96.4 },
      { label: 'Jul', value: 95.6 },
    ],
  },

  leaveByType: [
    { label: 'Annual', value: 142, color: 'var(--chart-1)' },
    { label: 'Sick', value: 86, color: 'var(--chart-2)' },
    { label: 'Casual', value: 53, color: 'var(--chart-3)' },
    { label: 'Unpaid', value: 12, color: 'var(--chart-4)' },
  ],

  heatDepts: [
    { dept: 'Engineering', base: 0.94 },
    { dept: 'Operations', base: 0.82 },
    { dept: 'Sales', base: 0.88 },
    { dept: 'Design', base: 0.96 },
    { dept: 'People Ops', base: 0.93 },
    { dept: 'Finance', base: 0.9 },
  ],
}

/** HR/Admin share this view (a couple of admin labels differ in the design; not
 *  material here). Employee/Lead never reach this screen — the route is gated. */
export function getCommandCenterData(): CommandCenterData {
  return hrData
}
