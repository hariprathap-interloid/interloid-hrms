/* ---------------------------------------------------------------------------
 * My Profile data (design: My Profile.dc.html, project 8f1502f5).
 *
 * ⚠ FLAG — the persona carries only name / email / id / title / department. Every
 * field below (personal, contact, employment meta beyond dept/title, documents,
 * and the design's per-field HR-approval edit workflow) is DEMO. A real GET
 * /employees/{id} + /documents + profile_change_requests replaces it.
 * ------------------------------------------------------------------------- */

export interface Field {
  label: string
  value: string
}

export const PERSONAL_FIELDS: Field[] = [
  { label: 'Date of birth', value: '14 Mar 1996' },
  { label: 'Gender', value: 'Male' },
  { label: 'Marital status', value: 'Single' },
  { label: 'Blood group', value: 'O+' },
  { label: 'Nationality', value: 'Indian' },
]

export const CONTACT_FIELDS: Field[] = [
  { label: 'Personal email', value: 'aarav.mehta@gmail.com' },
  { label: 'Mobile', value: '+91 98765 43210' },
  { label: 'Address', value: '42 MG Road, Indiranagar' },
  { label: 'City / PIN', value: 'Bengaluru 560038' },
  { label: 'Emergency contact', value: 'Sunita Mehta' },
  { label: 'Emergency phone', value: '+91 98765 11111' },
]

// Employment meta shown in the header — dept/title come from the persona; the
// rest is demo.
export const EMPLOYMENT_META: Field[] = [
  { label: 'Manager', value: 'Diya Sharma' },
  { label: 'Employment', value: 'Full-time' },
  { label: 'Joined', value: '12 Mar 2024' },
]

export interface EmployeeDoc {
  id: string
  name: string
  size: string
  date: string
  ext: string
}

export const DOCUMENTS: EmployeeDoc[] = [
  { id: 'd1', name: 'Offer letter.pdf', size: '248 KB', date: '12 Mar 2024', ext: 'PDF' },
  { id: 'd2', name: 'Aadhaar card.pdf', size: '1.2 MB', date: '12 Mar 2024', ext: 'PDF' },
  { id: 'd3', name: 'PAN card.pdf', size: '180 KB', date: '12 Mar 2024', ext: 'PDF' },
]
