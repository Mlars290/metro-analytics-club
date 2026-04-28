import { STATUS_CLASS, LEVEL_CLASS } from '../utils/helpers'

export function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_CLASS[status] || 'badge-todo'}`}>{status}</span>
}

export function LevelBadge({ level }) {
  return <span className={`badge ${LEVEL_CLASS[level] || 'badge-mixed'}`}>{level}</span>
}

export function TypeBadge({ type }) {
  return <span className="badge bg-navy-100 text-navy-800">{type}</span>
}
