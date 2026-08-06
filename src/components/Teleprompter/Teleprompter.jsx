import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Minus, Plus, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './Teleprompter.css';

// Custom parser for Teleprompter to show tags as colored text instead of badges
function parsePrompterTags(text) {
  if (!text) return null;
  const parts = text.split(/(<[^>]+>)/g);
  return parts.map((part, i) => {
    if (part.match(/^<[^>]+>$/)) {
      const inner = part.slice(1, -1).toUpperCase();
      const lower = inner.toLowerCase();
      let colorClass = 'prompter-tag--action'; // Default red
      
      if (lower.includes('nada') || lower.includes('cepat') || lower.includes('lambat') || lower.includes('antusias')) {
        colorClass = 'prompter-tag--tone'; // Yellow
      }
      if (lower.includes('senyum') || lower.includes('hangat') || lower.includes('tawa') || lower.includes('ramah')) {
        colorClass = 'prompter-tag--positive'; // Green
      }
      
      return (
        <span key={i} className={`prompter-tag ${colorClass}`}>
          {inner}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Teleprompter({ shots, onClose, projectName }) {
  const { theme, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState(36);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1 to 10
  const [showControls, setShowControls] = useState(true);
  
  const scrollRef = useRef(null);
  const requestRef = useRef();
  const controlsTimeoutRef = useRef();

  // Auto-hide controls
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    // Only auto-hide if playing
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [isPlaying]);

  // Handle auto-scrolling
  const animateScroll = () => {
    if (isPlaying && scrollRef.current) {
      // Speed multiplier for smoother scaling. 
      // Speed 1 is very slow, Speed 10 is fast.
      const scrollAmount = speed * 0.5; 
      scrollRef.current.scrollTop += scrollAmount;
      
      // Stop if reached bottom
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight) {
        setIsPlaying(false);
      }
    }
    requestRef.current = requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateScroll);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, speed]);

  const handleZoomIn = () => setFontSize(prev => Math.min(prev + 4, 80));
  const handleZoomOut = () => setFontSize(prev => Math.max(prev - 4, 20));

  // Group shots by scene to render headers
  const sceneGroups = shots.reduce((acc, shot) => {
    if (!acc[shot.scene]) acc[shot.scene] = [];
    acc[shot.scene].push(shot);
    return acc;
  }, {});

  return (
    <div 
      className="teleprompter-overlay" 
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
    >
      {/* Header Controls */}
      <div className={`teleprompter-header ${showControls ? 'visible' : 'hidden'}`}>
        <div className="teleprompter-header__left">
          <span className="teleprompter-title">{projectName || 'Teleprompter'}</span>
        </div>
        
        <div className="teleprompter-header__center">
          <button className="icon-btn" onClick={handleZoomOut} aria-label="Perkecil Font">
            <Minus size={20} />
          </button>
          <span className="font-size-indicator">{fontSize}px</span>
          <button className="icon-btn" onClick={handleZoomIn} aria-label="Perbesar Font">
            <Plus size={20} />
          </button>
        </div>
        
        <div className="teleprompter-header__right">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-purple-500" />}
          </button>
          <div className="divider"></div>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="Tutup">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="teleprompter-content" 
        ref={scrollRef}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="teleprompter-spacer-top"></div>
        
        {Object.entries(sceneGroups).map(([sceneNum, sceneShots]) => (
          <div key={sceneNum} className="teleprompter-scene">
            <div className="teleprompter-scene-divider">
              <span>SCENE {sceneNum}</span>
            </div>
            
            {sceneShots.map((shot) => (
              <div key={shot.id} className="teleprompter-shot">
                {shot.dialog ? (
                  <p className="teleprompter-dialog">
                    {parsePrompterTags(shot.dialog)}
                  </p>
                ) : (
                  <p className="teleprompter-no-dialog">
                    [{shot.briefAction || 'Tidak ada dialog'}]
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
        
        <div className="teleprompter-spacer-bottom"></div>
      </div>

      {/* Footer Controls */}
      <div className={`teleprompter-footer ${showControls ? 'visible' : 'hidden'}`}>
        <button 
          className="play-pause-btn" 
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
        </button>
        
        <div className="speed-control">
          <span className="speed-label">Lambat</span>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1" 
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="speed-slider"
          />
          <span className="speed-label">Cepat</span>
        </div>
      </div>
    </div>
  );
}
