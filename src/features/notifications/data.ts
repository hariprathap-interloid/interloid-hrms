/* ---------------------------------------------------------------------------
 * Notifications data (design: Notifications.dc.html, project 8f1502f5).
 *
 * ⚠ FLAG — none of this is on the persona, and the design's own CLAUDE.md notes
 * the API spec defines NO notifications endpoint/schema (GET /notifications +
 * mark-read must be added). So this is demo data; swap for a real feed later.
 * Only the current user's `role` (from resolveUser) is used — to hide approval
 * items from plain employees.
 * ------------------------------------------------------------------------- */

export type NotifKind = 'approval' | 'leave' | 'system'
export type NotifGroup = 'today' | 'yesterday' | 'earlier'

export interface Notification {
  id: string
  kind: NotifKind
  group: NotifGroup
  title: string
  body: string
  time: string
  unread: boolean
}

export const GROUP_LABELS: Record<NotifGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  earlier: 'Earlier',
}

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    kind: 'approval',
    group: 'today',
    title: 'Leave request from Diya Sharma',
    body: 'Casual · 9–10 Jul · awaiting your review',
    time: '2m ago',
    unread: true,
  },
  {
    id: 'n2',
    kind: 'system',
    group: 'today',
    title: 'Attendance synced',
    body: '248 punches imported from 6 devices',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'n3',
    kind: 'approval',
    group: 'today',
    title: 'Regularisation from Kabir Nair',
    body: 'Missed punch-out · 4 Jul',
    time: '3h ago',
    unread: false,
  },
  {
    id: 'n4',
    kind: 'leave',
    group: 'yesterday',
    title: 'Your leave was approved',
    body: 'Earned leave · 21–25 Jul · by Priya Nair',
    time: 'Yesterday 16:40',
    unread: false,
  },
  {
    id: 'n5',
    kind: 'system',
    group: 'yesterday',
    title: 'Holiday calendar updated',
    body: 'Independence Day added · 15 Aug',
    time: 'Yesterday 11:02',
    unread: false,
  },
  {
    id: 'n6',
    kind: 'leave',
    group: 'earlier',
    title: 'Leave balance credited',
    body: '1.5 earned-leave days accrued',
    time: '1 Jul',
    unread: false,
  },
  {
    id: 'n7',
    kind: 'system',
    group: 'earlier',
    title: 'Password changed',
    body: 'From a new device · Bengaluru',
    time: '28 Jun',
    unread: false,
  },
]
