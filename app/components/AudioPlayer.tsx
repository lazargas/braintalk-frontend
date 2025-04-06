import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
  duration: number;
}

export default function AudioPlayer({ audioUrl, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Reset player when audio URL changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setIsLoaded(false);
    
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      // Log for debugging
      console.log('Playing audio from URL:', audioUrl);
      
      // Force reload the audio element before playing
      audioRef.current.load();
      
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('Failed to play audio. Error: ' + error.message);
      });
      
      progressIntervalRef.current = window.setInterval(() => {
        if (audioRef.current) {
          const currentProgress = (audioRef.current.currentTime / (audioRef.current.duration || duration)) * 100;
          setProgress(currentProgress);
        }
      }, 100);
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleCanPlayThrough = () => {
    setIsLoaded(true);
    console.log('Audio loaded and ready to play');
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error('Audio error:', e);
    const audioElement = e.target as HTMLAudioElement;
    console.error('Audio error code:', audioElement.error?.code);
    console.error('Audio error message:', audioElement.error?.message);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="audio-player">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onEnded={handleAudioEnded}
        onCanPlayThrough={handleCanPlayThrough}
        onError={handleError}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        preload="auto"
        crossOrigin="anonymous"
      />
      
      <button 
        className={`btn-play ${isPlaying ? 'playing' : ''}`} 
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        title={isPlaying ? 'Pause' : 'Play'}
        disabled={!audioUrl}
      >
        <span aria-hidden="true">{isPlaying ? '❚❚' : '▶'}</span>
      </button>
      
      <div className="audio-progress" style={{ flex: 1 }}>
        <div 
          className="progress-bar" 
          style={{ 
            height: '4px', 
            backgroundColor: 'var(--light-olive)', 
            borderRadius: '2px',
            position: 'relative'
          }}
        >
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progress}%`, 
              height: '100%', 
              backgroundColor: 'var(--primary-color)',
              borderRadius: '2px',
              transition: 'width 0.1s linear'
            }}
          />
        </div>
        <div className="duration small-text" style={{ marginTop: '4px' }}>
          {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}