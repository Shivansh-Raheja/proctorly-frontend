declare module 'recordrtc' {
  interface RecordRTCOptions {
    type?: 'video' | 'audio' | 'canvas' | 'gif'
    mimeType?: string
    videoBitsPerSecond?: number
    audioBitsPerSecond?: number
    bitsPerSecond?: number
    frameRate?: number
    width?: number
    height?: number
    sampleRate?: number
    bufferSize?: number
    numberOfAudioChannels?: number
    timeSlice?: number
    checkForInactiveTracks?: boolean
    disableLogs?: boolean
    getNativeBlob?: boolean
    ondataavailable?: (blob: Blob) => void
  }

  class RecordRTC {
    constructor(stream: MediaStream, options?: RecordRTCOptions)
    startRecording(): void
    stopRecording(): void
    pauseRecording(): void
    resumeRecording(): void
    getBlob(): Blob
    getDataURL(): string
    reset(): void
    destroy(): void
    isRecording: boolean
    isPaused: boolean
  }

  export = RecordRTC
}
