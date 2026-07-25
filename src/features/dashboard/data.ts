import {
  Activity,
  BadgeIndianRupee,
  CalendarCheck2,
  CalendarOff,
  CheckCircle2,
  RefreshCw,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { HeaderBadge } from '@/components/layout/page-header'
import type { AreaTrendPoint, CategoryBar, DonutSegment } from '@/components/charts'

/* ---------------------------------------------------------------------------
 * Company Dashboard data (design: Company Dashboard.dc.html, project 8f1502f5).
 * The design is role-aware — Employee / Team Lead / HR-Admin each see different
 * KPIs, charts and queues. `getDashboardData(role)` is the branching seam: the
 * HR/Admin branch is fully populated; Employee/Lead return null (screen shows a
 * "coming soon" note) and are a data fill-in, not a screen refactor.
 * ------------------------------------------------------------------------- */

export type DashboardRole = 'employee' | 'lead' | 'hr'

type IconTone = 'primary' | 'success' | 'warning' | 'info' | 'neutral'
type DeltaTone = 'success' | 'destructive' | 'muted'
type DeltaDir = 'up' | 'down' | 'flat'

export interface Kpi {
  key: string
  label: string
  value: string
  sub: string
  icon: LucideIcon
  iconTone: IconTone
  delta: string
  deltaTone: DeltaTone
  deltaDir: DeltaDir
  spark: number[]
  sparkColor: string
}

export interface DashboardHero {
  greeting: string
  date: string
  badges: HeaderBadge[]
  aiTitle: string
  aiBody: string
  recs: string[]
}

export interface ApprovalItem {
  id: string
  name: string
  detail: string
  initials: string
  avatarColor: string
}

export interface ActivityItem {
  id: string
  icon: LucideIcon
  tone: IconTone
  text: string
  time: string
}

export interface AreaTrendCard {
  title: string
  sub: string
  color: string
  points: AreaTrendPoint[]
}

export interface BarCard {
  title: string
  sub: string
  bars: CategoryBar[]
}

export interface DonutCard {
  title: string
  centerValue: string
  centerLabel: string
  segments: DonutSegment[]
}

export interface DashboardData {
  role: DashboardRole
  hero: DashboardHero
  kpis: Kpi[]
  areaTrend: AreaTrendCard
  barChart: BarCard
  donut: DonutCard
  approvals: { title: string; count: number; items: ApprovalItem[] }
  activity: ActivityItem[]
}

// Spark colours follow delta semantics: good→green, neutral→indigo.
const SPARK_GOOD = 'var(--chart-3)'
const SPARK_NEUTRAL = 'var(--chart-1)'

const hrData: DashboardData = {
  role: 'hr',
  hero: {
    greeting: 'Good morning, Priya',
    date: 'Wednesday, 30 June 2026 · All locations',
    badges: [
      { label: '1,096 present today', tone: 'success' },
      { label: 'Payroll processing', tone: 'info' },
      { label: '9 approvals', tone: 'warning' },
    ],
    aiTitle: 'Attendance dipped 2.1% in Sales this week',
    aiBody:
      "Mumbai's Sales team shows a rise in late marks tied to the new shift. Headcount is up 2.4% MoM and attrition is trending down to 1.8%.",
    recs: ['Investigate Sales dip', 'Approve June payroll', 'Review attrition'],
  },
  kpis: [
    {
      key: 'headcount',
      label: 'Headcount',
      value: '1,248',
      sub: 'vs 1,219 last mo',
      icon: Users,
      iconTone: 'primary',
      delta: '+2.4%',
      deltaTone: 'success',
      deltaDir: 'up',
      spark: [1180, 1195, 1202, 1210, 1219, 1235, 1248],
      sparkColor: SPARK_GOOD,
    },
    {
      key: 'present',
      label: 'Present today',
      value: '1,096',
      sub: '87.8% attendance',
      icon: CalendarCheck2,
      iconTone: 'success',
      delta: '-0.6%',
      deltaTone: 'muted',
      deltaDir: 'down',
      spark: [1105, 1110, 1098, 1102, 1090, 1099, 1096],
      sparkColor: SPARK_NEUTRAL,
    },
    {
      key: 'on-leave',
      label: 'On leave',
      value: '84',
      sub: '6.7% of staff',
      icon: CalendarOff,
      iconTone: 'warning',
      delta: '+11',
      deltaTone: 'muted',
      deltaDir: 'up',
      spark: [60, 66, 72, 70, 78, 80, 84],
      sparkColor: SPARK_NEUTRAL,
    },
    {
      key: 'open-positions',
      label: 'Open positions',
      value: '23',
      sub: '8 in final round',
      icon: UserPlus,
      iconTone: 'info',
      delta: '+5',
      deltaTone: 'muted',
      deltaDir: 'up',
      spark: [14, 16, 18, 19, 20, 22, 23],
      sparkColor: SPARK_NEUTRAL,
    },
    {
      key: 'payroll',
      label: 'June payroll',
      value: '₹4.2Cr',
      sub: 'processing · on track',
      icon: Wallet,
      iconTone: 'info',
      delta: '+3.1%',
      deltaTone: 'success',
      deltaDir: 'up',
      spark: [3.8, 3.9, 3.95, 4.0, 4.05, 4.1, 4.2],
      sparkColor: SPARK_GOOD,
    },
    {
      key: 'attrition',
      label: 'Attrition (12mo)',
      value: '1.8%',
      sub: 'down from 2.3%',
      icon: Activity,
      iconTone: 'success',
      delta: '-0.5%',
      deltaTone: 'success',
      deltaDir: 'down',
      spark: [2.3, 2.2, 2.1, 2.0, 1.95, 1.9, 1.8],
      sparkColor: SPARK_GOOD,
    },
  ],
  areaTrend: {
    title: 'Headcount trend',
    sub: 'Trailing 7 months',
    color: 'var(--chart-1)',
    points: [
      { label: 'Dec', value: 1180 },
      { label: 'Jan', value: 1195 },
      { label: 'Feb', value: 1202 },
      { label: 'Mar', value: 1210 },
      { label: 'Apr', value: 1219 },
      { label: 'May', value: 1235 },
      { label: 'Jun', value: 1248 },
    ],
  },
  barChart: {
    title: 'Attendance by department',
    sub: 'Present today · %',
    bars: [
      { label: 'Eng', value: 94, color: 'var(--chart-1)' },
      { label: 'Product', value: 90, color: 'var(--chart-1)' },
      { label: 'Design', value: 82, color: 'var(--chart-4)' },
      { label: 'Sales', value: 74, color: 'var(--chart-5)' },
      { label: 'People', value: 96, color: 'var(--chart-1)' },
      { label: 'Finance', value: 88, color: 'var(--chart-1)' },
    ],
  },
  donut: {
    title: 'Attendance today',
    centerValue: '87.8%',
    centerLabel: 'present',
    segments: [
      { label: 'Present', value: 1096, display: '1,096', color: 'var(--chart-3)' },
      { label: 'On leave', value: 84, display: '84', color: 'var(--chart-4)' },
      { label: 'Absent', value: 68, display: '68', color: 'var(--chart-5)' },
    ],
  },
  approvals: {
    title: 'Pending approvals',
    count: 9,
    items: [
      {
        id: 'a1',
        name: 'Diya Sharma',
        detail: 'Casual leave · 9–10 Jul',
        initials: 'DS',
        avatarColor: 'var(--chart-4)',
      },
      {
        id: 'a2',
        name: 'Kabir Nair',
        detail: 'Regularisation · 4 Jul',
        initials: 'KN',
        avatarColor: 'var(--chart-3)',
      },
      {
        id: 'a3',
        name: 'Neha Kapoor',
        detail: 'Annual leave · 21–25 Jul',
        initials: 'NK',
        avatarColor: 'var(--chart-1)',
      },
    ],
  },
  activity: [
    {
      id: 'ac1',
      icon: CheckCircle2,
      tone: 'success',
      text: 'Ananya approved 4 leave requests',
      time: '12 min ago',
    },
    {
      id: 'ac2',
      icon: UserPlus,
      tone: 'info',
      text: 'Farhan Ali moved to final round · Backend',
      time: '1 hour ago',
    },
    {
      id: 'ac3',
      icon: RefreshCw,
      tone: 'info',
      text: 'Attendance synced from 6 biometric devices',
      time: '3 hours ago',
    },
    {
      id: 'ac4',
      icon: BadgeIndianRupee,
      tone: 'primary',
      text: 'June payroll draft generated · ₹4.2Cr',
      time: 'Yesterday',
    },
  ],
}

/**
 * Org dashboard content for HR/Admin (this shape — KPIs/charts/approvals). The
 * Employee/Lead landing is a different, persona-driven summary rendered by
 * `EmployeeDashboard` (employee-dashboard.tsx); the screen routes those roles
 * there before calling this, so it only ever runs for `hr`. The null arms stay
 * as a defensive fallback.
 */
export function getDashboardData(role: DashboardRole): DashboardData | null {
  switch (role) {
    case 'hr':
      return hrData
    case 'employee':
    case 'lead':
      return null
    default:
      return null
  }
}
