import { useState, useRef, useEffect, useCallback, MutableRefObject } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Headphones,
  Music,
} from 'lucide-react'
import type { FileRecord } from '../../store/fileStore'

interface Props {
  tracks: FileRecord[]
  eventId: string
  getFileUrl: (eventId: string, fileId: string) => Promise<FileRecord>
  isPlayingExternal: boolean
  onPlayingChange: (playing: boolean) => void
  toggleRef: MutableRefObject<(() => void) | null>
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export default function PresenterAudioPlayer({
  tracks,
  eventId,
  getFileUrl,
  onPlayingChange,
  toggleRef,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentTrack = tracks[currentIndex]

  const loadTrack = useCallback(
    async (index: number) => {
      if (!tracks[index]) return
      try {
        const file = await getFileUrl(eventId, tracks[index].id)
        if (file.downloadUrl) {
          setAudioUrl(file.downloadUrl)
        }
      } catch {
        // Failed to load track
      }
    },
    [tracks, eventId, getFileUrl],
  )

  useEffect(() => {
    if (tracks.length > 0) {
      loadTrack(currentIndex)
    }
  }, [currentIndex, tracks, loadTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => {
      if (currentIndex < tracks.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        setIsPlaying(false)
        onPlayingChange(false)
      }
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [currentIndex, tracks.length, onPlayingChange])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false)
        onPlayingChange(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, audioUrl, onPlayingChange])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume / 100
  }, [volume, isMuted])

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev
      onPlayingChange(next)
      return next
    })
  }, [onPlayingChange])

  // Expose toggle to parent for keyboard shortcut
  useEffect(() => {
    toggleRef.current = togglePlay
  }, [togglePlay, toggleRef])

  const prevTrack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setIsPlaying(true)
      onPlayingChange(true)
    }
  }

  const nextTrack = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsPlaying(true)
      onPlayingChange(true)
    }
  }

  const toggleMute = () => setIsMuted((prev) => !prev)

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = (value / 100) * duration
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value))
    setIsMuted(false)
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  if (tracks.length === 0) {
    return (
      <div className="h-[72px] bg-[#231E18] border-t border-[#3A3228] flex items-center justify-center px-5 shrink-0">
        <div className="flex items-center gap-2 text-[#5A4F44]">
          <Music className="w-4 h-4" />
          <span className="text-[13px]">Нет аудиофайлов</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      <div className="h-[72px] bg-[#231E18] border-t border-[#3A3228] flex items-center px-5 gap-4 shrink-0">
        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevTrack}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#2D2620] transition-colors duration-150"
          >
            <SkipBack className="w-4 h-4 text-[#9A8A7C]" />
          </button>
          <button
            onClick={togglePlay}
            className="w-11 h-11 bg-[#A98B76] hover:bg-[#96796A] rounded-full flex items-center justify-center transition-colors duration-150"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
          <button
            onClick={nextTrack}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#2D2620] transition-colors duration-150"
          >
            <SkipForward className="w-4 h-4 text-[#9A8A7C]" />
          </button>
        </div>

        {/* Track Info & Progress */}
        <div className="flex-1 mx-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Headphones className="w-3.5 h-3.5 text-[#A98B76]" />
              <span className="text-[13px] font-medium text-[#E8DDD3] truncate max-w-[260px]">
                {currentTrack?.name || '—'}
              </span>
            </div>
            <span className="text-[11px] text-[#7A6A5C] tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={handleProgressChange}
            className="w-full h-1 bg-[#3A3228] rounded-full appearance-none cursor-pointer accent-[#A98B76]"
          />
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2D2620] transition-colors duration-150"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-[#7A6A5C]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#9A8A7C]" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-[#3A3228] rounded-full appearance-none cursor-pointer accent-[#A98B76]"
          />
        </div>

        {/* Playlist indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2D2620] rounded-lg ml-2">
          <Music className="w-3.5 h-3.5 text-[#7A6A5C]" />
          <span className="text-[11px] text-[#7A6A5C] font-medium">
            {currentIndex + 1}/{tracks.length}
          </span>
        </div>
      </div>
    </>
  )
}
