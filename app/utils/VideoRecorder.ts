// Import RecordRTC only on client side
let RecordRTC: any = null
import { API_ENDPOINTS } from '../config/api'

export class VideoRecorder {
  private recorder: any = null
  private isRecording = false
  private recordedChunks: Blob[] = []

  async startRecording(videoStream: MediaStream, audioStream?: MediaStream): Promise<void> {
    try {
      // Dynamically import RecordRTC only when needed
      if (!RecordRTC) {
        RecordRTC = (await import('recordrtc')).default
      }

      const combinedStream = new MediaStream()
      
      // Add video tracks
      videoStream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track)
      })
      
      // Add audio tracks
      if (audioStream) {
        audioStream.getAudioTracks().forEach(track => {
          combinedStream.addTrack(track)
        })
      } else {
        videoStream.getAudioTracks().forEach(track => {
          combinedStream.addTrack(track)
        })
      }

      this.recorder = new RecordRTC(combinedStream, {
        type: 'video',
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
        audioBitsPerSecond: 128000,  // 128 kbps
        timeSlice: 1000, // Record in 1-second chunks
        ondataavailable: (blob: Blob) => {
          this.recordedChunks.push(blob)
        }
      })

      await this.recorder.startRecording()
      this.isRecording = true
      console.log('Video recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.recorder || !this.isRecording) {
        reject(new Error('No active recording'))
        return
      }

      this.recorder.stopRecording(() => {
        try {
          const blob = this.recorder!.getBlob()
          this.isRecording = false
          console.log('Video recording stopped')
          resolve(blob)
        } catch (error) {
          console.error('Failed to stop recording:', error)
          reject(error)
        }
      })
    })
  }

  async pauseRecording(): Promise<void> {
    if (this.recorder && this.isRecording) {
      this.recorder.pauseRecording()
      console.log('Video recording paused')
    }
  }

  async resumeRecording(): Promise<void> {
    if (this.recorder && this.isRecording) {
      this.recorder.resumeRecording()
      console.log('Video recording resumed')
    }
  }

  getRecordingState(): boolean {
    return this.isRecording
  }

  getRecordingDuration(): number {
    if (this.recorder) {
      return this.recorder.getTimeSlice()
    }
    return 0
  }

  async downloadRecording(filename?: string): Promise<void> {
    if (this.recorder) {
      const blob = this.recorder.getBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || `proctoring-recording-${Date.now()}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  async uploadRecording(candidateId: string): Promise<string> {
    if (!this.recorder) {
      throw new Error('No recording available')
    }

    const blob = this.recorder.getBlob()
    const formData = new FormData()
    formData.append('video', blob, `recording-${candidateId}-${Date.now()}.webm`)
    formData.append('candidateId', candidateId)

    try {
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      return result.filePath
    } catch (error) {
      console.error('Failed to upload recording:', error)
      throw error
    }
  }

  cleanup(): void {
    if (this.recorder) {
      this.recorder.destroy()
      this.recorder = null
    }
    this.isRecording = false
    this.recordedChunks = []
  }
}
