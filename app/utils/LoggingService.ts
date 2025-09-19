import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { DetectionStatus, SuspiciousObject } from '../types/detection'

export class LoggingService {
  private candidateId: string

  constructor(candidateId: string) {
    this.candidateId = candidateId
  }

  async logDetection(detection: DetectionStatus): Promise<void> {
    try {
      const events = []

      // Log focus lost event
      if (!detection.isFocused) {
        events.push({
          candidateId: this.candidateId,
          eventType: 'focus_lost',
          severity: 'medium',
          metadata: {
            timestamp: new Date().toISOString(),
            detection: detection
          }
        })
      }

      // Log face detection events
      if (!detection.faceDetected) {
        events.push({
          candidateId: this.candidateId,
          eventType: 'no_face_detected',
          severity: 'high',
          metadata: {
            timestamp: new Date().toISOString(),
            detection: detection
          }
        })
      }

      // Log suspicious objects
      detection.suspiciousObjects.forEach((obj: SuspiciousObject) => {
        let eventType = 'device_detected'
        
        if (obj.type === 'cell phone') {
          eventType = 'phone_detected'
        } else if (obj.type === 'book' || obj.type === 'paper') {
          eventType = 'book_detected'
        } else if (obj.type === 'face' && detection.suspiciousObjects.filter((o: SuspiciousObject) => o.type === 'face').length > 1) {
          eventType = 'multiple_faces_detected'
        }

        events.push({
          candidateId: this.candidateId,
          eventType,
          confidence: obj.confidence,
          boundingBox: obj.boundingBox,
          severity: this.getSeverityForEvent(eventType),
          metadata: {
            timestamp: new Date().toISOString(),
            objectType: obj.type,
            detection: detection
          }
        })
      })

      // Log eye closure
      if (detection.eyeClosure) {
        events.push({
          candidateId: this.candidateId,
          eventType: 'eye_closure_detected',
          severity: 'medium',
          metadata: {
            timestamp: new Date().toISOString(),
            detection: detection
          }
        })
      }

      // Log audio noise
      if (detection.audioNoise) {
        events.push({
          candidateId: this.candidateId,
          eventType: 'audio_noise_detected',
          severity: 'low',
          metadata: {
            timestamp: new Date().toISOString(),
            detection: detection
          }
        })
      }

      // Send all events to the backend
      for (const event of events) {
        await this.sendLogEvent(event)
      }
    } catch (error) {
      console.error('Error logging detection:', error)
    }
  }

  private async sendLogEvent(event: any): Promise<void> {
    try {
      await axios.post(API_ENDPOINTS.LOGS, event)
    } catch (error) {
      console.error('Failed to send log event:', error)
    }
  }

  private getSeverityForEvent(eventType: string): string {
    switch (eventType) {
      case 'phone_detected':
      case 'multiple_faces_detected':
        return 'critical'
      case 'book_detected':
      case 'no_face_detected':
        return 'high'
      case 'device_detected':
      case 'focus_lost':
      case 'eye_closure_detected':
        return 'medium'
      case 'audio_noise_detected':
        return 'low'
      default:
        return 'medium'
    }
  }

  async getCandidateStats(): Promise<any> {
    try {
      const response = await axios.get(API_ENDPOINTS.LOGS_STATS(this.candidateId))
      return response.data
    } catch (error) {
      console.error('Failed to get candidate stats:', error)
      return null
    }
  }

  async endInterview(): Promise<void> {
    try {
      await axios.post(API_ENDPOINTS.END_INTERVIEW(this.candidateId))
    } catch (error) {
      console.error('Failed to end interview:', error)
    }
  }

  async syncCandidateStats(stats: {
    focusLostCount: number
    suspiciousEventsCount: number
    integrityScore: number
    totalDuration?: number
  }): Promise<void> {
    try {
      const updateData: any = {
        focusLostCount: stats.focusLostCount,
        suspiciousEventsCount: stats.suspiciousEventsCount,
        integrityScore: stats.integrityScore
      }
      
      if (stats.totalDuration !== undefined) {
        updateData.totalDuration = stats.totalDuration
      }
      
      await axios.put(API_ENDPOINTS.CANDIDATE_BY_ID(this.candidateId), updateData)
    } catch (error) {
      console.error('Failed to sync candidate stats:', error)
    }
  }
}
