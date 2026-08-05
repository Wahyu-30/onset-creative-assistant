import './FilterBar.css'

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'PENDING', label: '⏳ Pending' },
  { value: 'TAKE_DONE', label: '✅ Done' },
  { value: 'REVISI', label: '🔄 Revisi' },
]

export default function FilterBar({ scenes, activeScene, activeStatus, onSceneChange, onStatusChange }) {
  return (
    <div className="filter-bar">
      <div className="filter-bar-inner">
        {/* Scene Filter */}
        <div className="filter-bar__scroll">
          <button
            className={`filter-bar__scene-btn ${activeScene === null ? 'active' : ''}`}
            onClick={() => onSceneChange(null)}
          >
            All
          </button>
          {scenes.map(scene => (
            <button
              key={scene}
              className={`filter-bar__scene-btn ${activeScene === scene ? 'active' : ''}`}
              onClick={() => onSceneChange(scene)}
            >
              S{scene}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="filter-bar__status">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-bar__status-btn ${activeStatus === f.value ? 'active' : ''}`}
              onClick={() => onStatusChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
