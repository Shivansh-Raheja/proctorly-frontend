// Detection Types
export interface SuspiciousObject {
  type: string
  confidence: number
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface DetectionStatus {
  isFocused: boolean
  faceDetected: boolean
  suspiciousObjects: SuspiciousObject[]
  eyeClosure: boolean
  audioNoise: boolean
}

export interface SessionStats {
  focusLostCount: number
  suspiciousEventsCount: number
  integrityScore: number
  totalDuration: number
}

export interface Alert {
  id: number
  type: 'focus' | 'suspicious' | 'warning' | 'info'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
}

export interface Candidate {
  candidateId: string
  name: string
  email: string
  interviewStartTime: Date
  interviewEndTime?: Date
  totalDuration?: number
  focusLostCount?: number
  suspiciousEventsCount?: number
  integrityScore?: number
  status: 'active' | 'completed' | 'paused'
}
