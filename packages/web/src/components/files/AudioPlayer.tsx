import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import type { FileRecord } from '../../store/fileStore'
import { useFileStore } from '../../store/fileStore'

interface AudioPlayerProps {
  tracks: FileRecord[]
  eventId: string
}

export default function AudioPlayer({ tracks, eventId }: AudioPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { getFileUrl } = useFileStore()

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
  }, [currentIndex, tracks.length])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying, audioUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume / 100
  }, [volume, isMuted])

  const togglePlay = () => setIsPlaying((prev) => !prev)
  const prevTrack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setIsPlaying(true)
    }
  }
  const nextTrack = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsPlaying(true)
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

  const selectTrack = (index: number) => {
    setCurrentIndex(index)
    setIsPlaying(true)
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  if (tracks.length === 0) return null

  return (
    <>
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Player Bar */}
      <div className="mx-5 mb-4 bg-[#1B4332] rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevTrack}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-150"
            >
              <SkipBack className="w-4 h-4 text-white/70" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-[#40916C] hover:bg-[#52B788] rounded-full flex items-center justify-center transition-colors duration-150"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>
            <button
              onClick={nextTrack}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-150"
            >
              <SkipForward className="w-4 h-4 text-white/70" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium text-white truncate max-w-[240px]">
                {currentTrack?.name || '—'}
              </span>
              <span className="text-[11px] text-white/50">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={handleProgressChange}
              className="w-full h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-[#52B788]"
            />
          </div>

          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={toggleMute}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-150"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-white/60" />
              ) : (
                <Volume2 className="w-4 h-4 text-white/60" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-[#52B788]"
            />
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="px-5 pb-4">
        {tracks.map((track, idx) => (
          <div
            key={track.id}
            onClick={() => selectTrack(idx)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 ${
              idx === currentIndex ? 'bg-[#2D6A4F]/10' : 'hover:bg-[#2D6A4F]/5'
            } cursor-pointer group`}
          >
            <div className="w-7 h-7 flex items-center justify-center">
              {idx === currentIndex && isPlaying ? (
                <div className="flex items-end gap-[2px] h-3.5">
                  <div
                    className="w-[3px] bg-[#2D6A4F] rounded-full animate-pulse"
                    style={{ height: '60%' }}
                  />
                  <div
                    className="w-[3px] bg-[#2D6A4F] rounded-full animate-pulse"
                    style={{ height: '100%', animationDelay: '0.15s' }}
                  />
                  <div
                    className="w-[3px] bg-[#2D6A4F] rounded-full animate-pulse"
                    style={{ height: '40%', animationDelay: '0.3s' }}
                  />
                </div>
              ) : (
                <span className="text-[12px] text-[#52796F]/60 font-medium">{idx + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-[13px] truncate ${
                  idx === currentIndex ? 'text-[#1B4332] font-semibold' : 'text-[#2D6A4F]'
                }`}
              >
                {track.name}
              </p>
            </div>
            <span className="text-[11px] text-[#52796F]/40">{formatFileSize(track.size)}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
