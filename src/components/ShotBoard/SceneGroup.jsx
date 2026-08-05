import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import ShotCard from './ShotCard';
import './SceneGroup.css';

export default function SceneGroup({ 
  scene, 
  shots, 
  onAddShot,
  onStatusChange,
  onNoteChange,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const doneCount = shots.filter(s => s.status === 'TAKE_DONE').length;
  const isAllDone = shots.length > 0 && doneCount === shots.length;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`scene-group ${isAllDone ? 'scene-group--done' : ''}`}
    >
      <div 
        className="scene-group__header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="scene-group__header-left">
          <div className="scene-group__badge">S{scene}</div>
          <h3 className="scene-group__title">{shots[0]?.sceneLabel || `Scene ${scene}`}</h3>
          <span className="scene-group__count">{shots.length} Shot{shots.length > 1 ? 's' : ''}</span>
        </div>
        <div className="scene-group__header-right">
          <button 
            className="scene-group__add-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddShot(scene);
            }}
            title="Tambah Shot ke Scene Ini"
          >
            <Plus size={14} />
          </button>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="scene-group__content"
          >
            <div className="scene-group__shots">
              {shots.map((shot, i) => (
                <ShotCard
                  key={shot.id}
                  shot={shot}
                  index={i}
                  totalShots={shots.length}
                  onStatusChange={onStatusChange}
                  onNoteChange={onNoteChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMoveUp={(e) => { e.stopPropagation(); onMoveUp(shot.id); }}
                  onMoveDown={(e) => { e.stopPropagation(); onMoveDown(shot.id); }}
                  isFirst={i === 0}
                  isLast={i === shots.length - 1}
                  isMultiShot={true}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
