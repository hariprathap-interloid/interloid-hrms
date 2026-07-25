import type { DemoUser } from '@/features/auth/demo-users'

/* ---------------------------------------------------------------------------
 * My Profile data (design: My Profile.dc.html, project 8f1502f5).
 *
 * The persona (DemoUser) carries only name / email / id / title / department, so
 * buildProfile() DERIVES the rest per-persona: identity-bearing fields (personal
 * email, emergency contact) from the persona's own name, the remainder as
 * deterministic demo keyed off the persona id. Each account therefore sees its
 * OWN self-consistent record — never another identity's contact/emergency data.
 * A real GET /employees/{id} + /documents replaces buildProfile().
 *
 * ⚠ Note: the design's per-field "submit edit for HR approval" workflow is NOT
 * blocked on data — the design runs it on local component state. It is simply not
 * built yet (audit Tier 1). Do not mislabel it as data-deferred.
 * ------------------------------------------------------------------------- */

export interface Field {
  label: string
  value: string
}

export interface EmployeeDoc {
  id: string
  name: string
  size: string
  date: string
  ext: string
}

export interface ProfileData {
  personal: Field[]
  contact: Field[]
  employment: Field[]
  documents: EmployeeDoc[]
}

/**
 * A submitted profile-field edit awaiting HR review. Stub shaped like the real
 * `profile_change_requests` endpoint (POST creates one; a review approves/rejects
 * it). Today these live in local screen state — the workflow needs no backend.
 */
export interface ProfileChangeRequest {
  id: string
  /** Field id — its label, which is unique across the profile. */
  field: string
  from: string
  to: string
  status: 'pending' | 'approved' | 'rejected'
  /** ISO timestamp; the UI shows "awaiting HR review", the shape carries the time. */
  submittedAt: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ADDRESSES = [
  { address: '42 MG Road, Indiranagar', city: 'Bengaluru 560038' },
  { address: '12 Turner Road, Bandra West', city: 'Mumbai 400050' },
  { address: '8 Park Street', city: 'Kolkata 700016' },
  { address: '221 Sector 44', city: 'Gurugram 122003' },
]
const RELATIVES = ['Meera', 'Anil', 'Kavya', 'Ravi', 'Nisha', 'Vikram']

// Deterministic per-persona seed (FNV-1a over the employee id).
function seed(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pick<T>(list: T[], s: number): T {
  return list[s % list.length]!
}

function fmtDate(day: number, monthIdx: number, year: number): string {
  return `${String(day).padStart(2, '0')} ${MONTHS[monthIdx]} ${year}`
}

// Manager routes up the org, never to self: employee→lead, lead/hr→admin, admin→board.
function managerFor(user: DemoUser): string {
  switch (user.role) {
    case 'admin':
      return 'Board of Directors'
    case 'hr':
    case 'lead':
      return 'Devi Krishnan'
    default:
      return 'Rohan Gupta'
  }
}

/**
 * Build the signed-in persona's profile. Identity-bearing fields are derived from
 * the persona so an account never shows another person's data; fields the persona
 * doesn't carry are deterministic demo keyed off its id. Gender/marital are not
 * carried and are NOT inferred from the name — gender shows "Not specified".
 */
export function buildProfile(user: DemoUser): ProfileData {
  const s = seed(user.id)
  const parts = user.name.trim().split(/\s+/)
  const first = parts[0] ?? user.name
  const last = parts.length > 1 ? parts[parts.length - 1]! : first
  const handle = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '')

  const joined = fmtDate(1 + ((s >>> 4) % 28), (s >>> 2) % 12, 2019 + (s % 6))
  const place = pick(ADDRESSES, s)
  const mobile = `+91 ${60000 + (s % 40000)} ${10000 + ((s >>> 3) % 90000)}`
  const emergencyPhone = `+91 ${60000 + ((s >>> 7) % 40000)} ${10000 + ((s >>> 11) % 90000)}`

  const personal: Field[] = [
    { label: 'Date of birth', value: fmtDate(1 + (s % 28), s % 12, 1988 + (s % 11)) },
    { label: 'Gender', value: 'Not specified' },
    { label: 'Marital status', value: pick(['Single', 'Married'], s) },
    { label: 'Blood group', value: pick(['O+', 'B+', 'A+', 'AB+', 'O−'], s) },
    { label: 'Nationality', value: 'Indian' },
  ]
  const contact: Field[] = [
    { label: 'Personal email', value: `${handle}@gmail.com` },
    { label: 'Mobile', value: mobile },
    { label: 'Address', value: place.address },
    { label: 'City / PIN', value: place.city },
    { label: 'Emergency contact', value: `${pick(RELATIVES, s)} ${last}` },
    { label: 'Emergency phone', value: emergencyPhone },
  ]
  const employment: Field[] = [
    { label: 'Manager', value: managerFor(user) },
    { label: 'Employment', value: 'Full-time' },
    { label: 'Joined', value: joined },
  ]
  const documents: EmployeeDoc[] = [
    { id: 'd1', name: 'Offer letter.pdf', size: '248 KB', date: joined, ext: 'PDF' },
    { id: 'd2', name: 'Aadhaar card.pdf', size: '1.2 MB', date: joined, ext: 'PDF' },
    { id: 'd3', name: 'PAN card.pdf', size: '180 KB', date: joined, ext: 'PDF' },
  ]

  return { personal, contact, employment, documents }
}
