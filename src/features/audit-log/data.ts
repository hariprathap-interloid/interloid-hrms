/* ---------------------------------------------------------------------------
 * Audit log data (design source: project 8f1502f5, `Audit Log.dc.html`).
 *
 * Seam note: the API spec documents only the FILTER params for
 * `GET /audit_logs` (actor_id, entity_type, from, page, per_page, sort) and no
 * audit_log resource schema — the manifest flags "no audit_log resource schema,
 * displayed columns (action, target, before/after, source) are undocumented".
 * The shape below mirrors the design's own event record so the screen is honest
 * about what it renders; it must be reconciled once the schema lands.
 * ------------------------------------------------------------------------- */

export type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | 'sync'
export type AuditSource = 'ui' | 'integration' | 'system'
export type ActorKind = 'person' | 'system' | 'integration'

export type AuditEntity =
  | 'leave_request'
  | 'attendance'
  | 'employee'
  | 'leave_type'
  | 'holiday'
  | 'department'
  | 'shift'
  | 'user'
  | 'role'
  | 'integration_setting'

export interface AuditActor {
  key: string
  name: string
  role: string
  kind: ActorKind
}

export interface AuditChange {
  field: string
  from: string
  to: string
}

export interface AuditEvent {
  id: string
  /** IST wall-clock, `YYYY-MM-DDTHH:mm:ss` — the log renders IST, not UTC. */
  ts: string
  actor: string
  action: AuditAction
  entity: AuditEntity
  /** The affected record's id, e.g. `LR-2041`. */
  entityId: string
  source: AuditSource
  summary: string
  changes: AuditChange[]
  meta: [string, string][]
}

/** Entity types only Super Admin may see — HR gets the scoped view without them. */
export const ADMIN_ONLY_ENTITIES: AuditEntity[] = ['user', 'role', 'integration_setting']

const ENTITY_LABEL: Record<AuditEntity, string> = {
  leave_request: 'Leave request',
  attendance: 'Attendance',
  employee: 'Employee',
  leave_type: 'Leave type',
  holiday: 'Holiday',
  department: 'Department',
  shift: 'Shift',
  user: 'User',
  role: 'Role',
  integration_setting: 'Integration setting',
}

export function entityLabel(entity: AuditEntity) {
  return ENTITY_LABEL[entity] ?? entity
}

export const ACTORS: Record<string, AuditActor> = {
  PN: { key: 'PN', name: 'Priya Nair', role: 'HR Manager', kind: 'person' },
  DK: { key: 'DK', name: 'Devi Krishnan', role: 'Super Admin', kind: 'person' },
  RD: { key: 'RD', name: 'Rohan Das', role: 'Team Lead', kind: 'person' },
  AM: { key: 'AM', name: 'Aarav Mehta', role: 'Employee', kind: 'person' },
  SYS: { key: 'SYS', name: 'System', role: 'Automated job', kind: 'system' },
  ETO: { key: 'ETO', name: 'eTimeOffice', role: 'Biometric integration', kind: 'integration' },
  ENTRA: {
    key: 'ENTRA',
    name: 'Microsoft Entra ID',
    role: 'Identity integration',
    kind: 'integration',
  },
}

/**
 * Action → chip label + tone. The design's `accent` (sky) for "Synced" maps to
 * `info` here; the app has no separate accent-subtle pair.
 */
export const ACTION_META: Record<AuditAction, { label: string; tone: ActionTone }> = {
  create: { label: 'Created', tone: 'success' },
  update: { label: 'Updated', tone: 'info' },
  delete: { label: 'Deleted', tone: 'destructive' },
  approve: { label: 'Approved', tone: 'success' },
  reject: { label: 'Rejected', tone: 'destructive' },
  login: { label: 'Sign-in', tone: 'neutral' },
  sync: { label: 'Synced', tone: 'info' },
}

export type ActionTone = 'success' | 'info' | 'destructive' | 'neutral'

/** Source → pill label + tone, matching the design's ui/integration/system tints. */
export const SOURCE_META: Record<
  AuditSource,
  { label: string; tone: 'primary' | 'info' | 'violet' }
> = {
  ui: { label: 'UI', tone: 'primary' },
  integration: { label: 'Integration', tone: 'info' },
  system: { label: 'System', tone: 'violet' },
}

const EVENTS: AuditEvent[] = [
  {
    id: 'EVT-90427',
    ts: '2026-06-30T14:32:07',
    actor: 'PN',
    action: 'update',
    entity: 'leave_request',
    entityId: 'LR-2041',
    source: 'ui',
    summary: 'Approved Aarav Mehta’s annual leave (12–14 Jul).',
    changes: [
      { field: 'status', from: 'pending', to: 'approved' },
      { field: 'approver_id', from: '—', to: 'ITL-0233' },
    ],
    meta: [
      ['request_id', 'req_7b31a9c2'],
      ['ip', '10.4.19.22'],
      ['user_agent', 'Chrome 126 / macOS'],
    ],
  },
  {
    id: 'EVT-90421',
    ts: '2026-06-30T13:58:22',
    actor: 'SYS',
    action: 'create',
    entity: 'attendance',
    entityId: 'ATT-88213',
    source: 'system',
    summary: 'Auto-derived attendance day from imported punches.',
    changes: [],
    meta: [
      ['job', 'derive_day'],
      ['run_id', 'cron_0630_1358'],
      ['records', '1'],
    ],
  },
  {
    id: 'EVT-90414',
    ts: '2026-06-30T11:14:03',
    actor: 'ETO',
    action: 'sync',
    entity: 'attendance',
    entityId: 'SYNC-0630',
    source: 'integration',
    summary: 'Imported 248 punches from eTimeOffice-01.',
    changes: [],
    meta: [
      ['device', 'eTimeOffice-01'],
      ['punches', '248'],
      ['duration_ms', '4120'],
    ],
  },
  {
    id: 'EVT-90409',
    ts: '2026-06-30T10:47:51',
    actor: 'DK',
    action: 'update',
    entity: 'integration_setting',
    entityId: 'INT-ENTRA',
    source: 'ui',
    summary: 'Rotated the Entra ID client secret.',
    changes: [{ field: 'client_secret', from: '•••• 3f9a', to: '•••• e21c' }],
    meta: [
      ['request_id', 'req_0d2f11ab'],
      ['ip', '10.4.19.5'],
      ['user_agent', 'Chrome 126 / Windows'],
    ],
  },
  {
    id: 'EVT-90402',
    ts: '2026-06-30T10:12:09',
    actor: 'PN',
    action: 'create',
    entity: 'employee',
    entityId: 'ITL-0361',
    source: 'ui',
    summary: 'Created employee record for Sana Kapoor.',
    changes: [
      { field: 'status', from: '—', to: 'invited' },
      { field: 'department', from: '—', to: 'Engineering' },
    ],
    meta: [
      ['request_id', 'req_55aa90fe'],
      ['ip', '10.4.19.22'],
      ['user_agent', 'Chrome 126 / macOS'],
    ],
  },
  {
    id: 'EVT-90396',
    ts: '2026-06-30T09:40:33',
    actor: 'DK',
    action: 'update',
    entity: 'role',
    entityId: 'ROLE-LEAD',
    source: 'ui',
    summary: 'Enabled Team-Lead leave approval capability.',
    changes: [{ field: 'lead_approval', from: 'off', to: 'on' }],
    meta: [
      ['request_id', 'req_9c14bb02'],
      ['ip', '10.4.19.5'],
      ['user_agent', 'Chrome 126 / Windows'],
    ],
  },
  {
    id: 'EVT-90390',
    ts: '2026-06-30T09:05:12',
    actor: 'ENTRA',
    action: 'login',
    entity: 'user',
    entityId: 'USR-0042',
    source: 'integration',
    summary: 'SSO sign-in via Microsoft Entra ID.',
    changes: [],
    meta: [
      ['session_id', 'sess_a91f3c'],
      ['ip', '122.171.20.14'],
      ['mfa', 'passed'],
    ],
  },
  {
    id: 'EVT-90385',
    ts: '2026-06-30T08:51:44',
    actor: 'RD',
    action: 'reject',
    entity: 'leave_request',
    entityId: 'LR-2038',
    source: 'ui',
    summary: 'Rejected leave — insufficient annual balance.',
    changes: [{ field: 'status', from: 'pending', to: 'rejected' }],
    meta: [
      ['request_id', 'req_31c7de90'],
      ['reason', 'leave_type_id·insufficient_balance'],
      ['ip', '10.4.19.61'],
    ],
  },
  {
    id: 'EVT-90371',
    ts: '2026-06-29T18:30:00',
    actor: 'SYS',
    action: 'delete',
    entity: 'attendance',
    entityId: 'ATT-88010',
    source: 'system',
    summary: 'Purged duplicate punch flagged by dedup job.',
    changes: [{ field: 'record', from: 'ATT-88010', to: 'deleted' }],
    meta: [
      ['job', 'dedup_punches'],
      ['run_id', 'cron_0629_1830'],
      ['records', '1'],
    ],
  },
  {
    id: 'EVT-90362',
    ts: '2026-06-29T17:22:16',
    actor: 'PN',
    action: 'update',
    entity: 'leave_type',
    entityId: 'LT-CASUAL',
    source: 'ui',
    summary: 'Increased casual leave annual quota.',
    changes: [{ field: 'annual_quota', from: '12', to: '15' }],
    meta: [
      ['request_id', 'req_7ffa2210'],
      ['ip', '10.4.19.22'],
      ['user_agent', 'Chrome 126 / macOS'],
    ],
  },
  {
    id: 'EVT-90355',
    ts: '2026-06-29T16:05:41',
    actor: 'DK',
    action: 'create',
    entity: 'user',
    entityId: 'USR-0361',
    source: 'ui',
    summary: 'Invited user with SSO authentication.',
    changes: [
      { field: 'auth', from: '—', to: 'sso' },
      { field: 'role', from: '—', to: 'Employee' },
    ],
    meta: [
      ['request_id', 'req_18ce74a0'],
      ['ip', '10.4.19.5'],
      ['user_agent', 'Chrome 126 / Windows'],
    ],
  },
  {
    id: 'EVT-90348',
    ts: '2026-06-29T15:47:12',
    actor: 'PN',
    action: 'create',
    entity: 'holiday',
    entityId: 'HOL-2026-15',
    source: 'ui',
    summary: 'Added Independence Day to the 2026 holiday calendar.',
    changes: [{ field: 'date', from: '—', to: '2026-08-15' }],
    meta: [
      ['request_id', 'req_a02b6631'],
      ['ip', '10.4.19.22'],
      ['calendar', 'IN-2026'],
    ],
  },
  {
    id: 'EVT-90339',
    ts: '2026-06-29T14:03:58',
    actor: 'AM',
    action: 'create',
    entity: 'leave_request',
    entityId: 'LR-2041',
    source: 'ui',
    summary: 'Applied for annual leave (12–14 Jul).',
    changes: [
      { field: 'status', from: '—', to: 'pending' },
      { field: 'days', from: '—', to: '3' },
    ],
    meta: [
      ['request_id', 'req_66de1180'],
      ['ip', '122.171.20.14'],
      ['user_agent', 'Safari 17 / iOS'],
    ],
  },
  {
    id: 'EVT-90322',
    ts: '2026-06-29T09:05:03',
    actor: 'ETO',
    action: 'sync',
    entity: 'attendance',
    entityId: 'SYNC-0629',
    source: 'integration',
    summary: 'Imported 246 punches from eTimeOffice-01.',
    changes: [],
    meta: [
      ['device', 'eTimeOffice-01'],
      ['punches', '246'],
      ['duration_ms', '3980'],
    ],
  },
  {
    id: 'EVT-90310',
    ts: '2026-06-29T08:30:22',
    actor: 'DK',
    action: 'update',
    entity: 'department',
    entityId: 'DEPT-ENG',
    source: 'ui',
    summary: 'Renamed department to Engineering.',
    changes: [{ field: 'name', from: 'Product Eng', to: 'Engineering' }],
    meta: [
      ['request_id', 'req_2a771f0c'],
      ['ip', '10.4.19.5'],
      ['user_agent', 'Chrome 126 / Windows'],
    ],
  },
]

export interface AuditFilters {
  q: string
  actor: string
  entity: string
  from: string
  to: string
}

export const EMPTY_FILTERS: AuditFilters = { q: '', actor: '', entity: '', from: '', to: '' }

export function hasActiveFilters(filters: AuditFilters) {
  return Object.values(filters).some(Boolean)
}

/** Events the role may see at all. HR's view is scoped; Admin's is full. */
export function visibleEvents(isAdmin: boolean): AuditEvent[] {
  if (isAdmin) return EVENTS
  return EVENTS.filter((event) => !ADMIN_ONLY_ENTITIES.includes(event.entity))
}

/** How many events the scoped (HR) view is hiding — drives the scope banner. */
export function hiddenEventCount() {
  return EVENTS.filter((event) => ADMIN_ONLY_ENTITIES.includes(event.entity)).length
}

export function filterEvents(isAdmin: boolean, filters: AuditFilters): AuditEvent[] {
  const q = filters.q.trim().toLowerCase()
  return visibleEvents(isAdmin).filter((event) => {
    if (q) {
      const actor = ACTORS[event.actor]
      const hit =
        event.entityId.toLowerCase().includes(q) ||
        event.summary.toLowerCase().includes(q) ||
        (actor?.name.toLowerCase().includes(q) ?? false)
      if (!hit) return false
    }
    if (filters.actor && event.actor !== filters.actor) return false
    if (filters.entity && event.entity !== filters.entity) return false
    const day = event.ts.slice(0, 10)
    if (filters.from && day < filters.from) return false
    if (filters.to && day > filters.to) return false
    return true
  })
}

/** Actor / entity dropdown options, limited to what the role can see. */
export function filterOptions(isAdmin: boolean) {
  const events = visibleEvents(isAdmin)
  const actorKeys = [...new Set(events.map((event) => event.actor))]
  const entityKeys = [...new Set(events.map((event) => event.entity))]
  return {
    actors: actorKeys.map((key) => ({ value: key, label: ACTORS[key]?.name ?? key })),
    entities: entityKeys.map((key) => ({ value: key, label: entityLabel(key) })),
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "30 Jun 2026" — the log is IST wall-clock, so this parses, never converts. */
export function formatDate(ts: string) {
  const [year, month, day] = ts.slice(0, 10).split('-')
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`
}

/** "30 Jun" — the table's compact first line. */
export function formatDateShort(ts: string) {
  const [, month, day] = ts.slice(0, 10).split('-')
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`
}

export function formatTime(ts: string) {
  return ts.slice(11, 19)
}

/** Oldest→newest span of a result set, for the footer's range label. */
export function rangeLabel(events: AuditEvent[]) {
  if (events.length === 0) return 'no events in range'
  const days = events.map((event) => event.ts.slice(0, 10)).sort()
  const first = formatDate(days.at(0) ?? '')
  const last = formatDate(days.at(-1) ?? '')
  return first === last ? first : `${first} – ${last}`
}

export function initials(actor: AuditActor) {
  return actor.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

/** RFC-4180 CSV of the current view. Mutations don't exist here — export is the
 *  only "action" the append-only log offers. */
export function toCsv(events: AuditEvent[]) {
  const escape = (value: string) =>
    /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
  const header = [
    'timestamp_ist',
    'actor',
    'actor_role',
    'action',
    'entity_type',
    'entity_id',
    'source',
    'event_id',
  ]
  const lines = [header.join(',')]
  for (const event of events) {
    const actor = ACTORS[event.actor]
    lines.push(
      [
        event.ts,
        actor?.name ?? event.actor,
        actor?.role ?? '',
        event.action,
        event.entity,
        event.entityId,
        event.source,
        event.id,
      ]
        .map(escape)
        .join(','),
    )
  }
  // Leading BOM so Excel reads the en-dashes and bullets as UTF-8.
  return '﻿' + lines.join('\r\n')
}
