import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { DetectionStatus, SuspiciousObject } from '../types/detection'
// import * as faceDetection from '@tensorflow-models/face-detection'

export class DetectionEngine {
  private objectDetectionModel: cocoSsd.ObjectDetection | null = null
  private faceDetectionModel: any = null
  private faceLandmarksModel: any = null
  private isInitialized = false
  private detectionInterval: NodeJS.Timeout | null = null
  private lastFaceDetectionTime = 0
  private focusLostStartTime = 0
  private eyeClosureStartTime = 0
  private onDetectionUpdate: ((detection: any) => void) | null = null

  // Detection thresholds
  private readonly FOCUS_LOST_THRESHOLD = 5000 // 5 seconds
  private readonly NO_FACE_THRESHOLD = 10000 // 10 seconds
  private readonly EYE_CLOSURE_THRESHOLD = 3000 // 3 seconds
  private readonly DETECTION_INTERVAL = 100 // 100ms

  // Suspicious object classes
  private readonly SUSPICIOUS_OBJECTS = [
    'cell phone', 'book', 'laptop', 'mouse', 'keyboard', 'remote',
    'tv', 'monitor', 'laptop computer', 'notebook', 'paper'
  ]

  async initialize(): Promise<void> {
    try {
      console.log('Initializing detection models...')
      
      // Initialize TensorFlow.js
      await tf.ready()
      console.log('TensorFlow.js ready')

      // Load COCO-SSD model for object detection
      this.objectDetectionModel = await cocoSsd.load()
      console.log('COCO-SSD model loaded')

      // Face detection will be handled by COCO-SSD for now
      console.log('Face detection will use COCO-SSD model')

      // Face landmarks model will be loaded separately if needed
      console.log('Face landmarks model skipped for now')

      this.isInitialized = true
      console.log('All detection models initialized successfully')
    } catch (error) {
      console.error('Failed to initialize detection models:', error)
      throw error
    }
  }

  async startDetection(videoElement: HTMLVideoElement, onUpdate: (detection: any) => void): Promise<void> {
    // Wait for initialization to complete
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.onDetectionUpdate = onUpdate

    this.detectionInterval = setInterval(async () => {
      try {
        await this.performDetection(videoElement)
      } catch (error) {
        console.error('Detection error:', error)
      }
    }, this.DETECTION_INTERVAL)
  }

  private async performDetection(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.onDetectionUpdate) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight
    ctx.drawImage(videoElement, 0, 0)

    const detection: DetectionStatus = {
      isFocused: true,
      faceDetected: false,
      suspiciousObjects: [],
      eyeClosure: false,
      audioNoise: false
    }

    // Object detection and face detection using COCO-SSD
    if (this.objectDetectionModel) {
      const objects = await this.objectDetectionModel.detect(canvas)
      const currentTime = Date.now()

      // Filter suspicious objects
      detection.suspiciousObjects = objects
        .filter(obj => this.SUSPICIOUS_OBJECTS.includes(obj.class))
        .map(obj => ({
          type: obj.class,
          confidence: obj.score,
          boundingBox: {
            x: obj.bbox[0],
            y: obj.bbox[1],
            width: obj.bbox[2],
            height: obj.bbox[3]
          }
        } as SuspiciousObject))

      // Face detection using person class
      const faces = objects.filter(obj => obj.class === 'person')
      
      if (faces.length > 0) {
        detection.faceDetected = true
        this.lastFaceDetectionTime = currentTime

        // Check for multiple faces (persons)
        if (faces.length > 1) {
          detection.suspiciousObjects.push({
            type: 'face',
            confidence: 1.0,
            boundingBox: {
              x: 0,
              y: 0,
              width: canvas.width,
              height: canvas.height
            }
          } as SuspiciousObject)
        }
      } else {
        // No face detected
        if (this.lastFaceDetectionTime === 0) {
          this.lastFaceDetectionTime = currentTime
        } else if (currentTime - this.lastFaceDetectionTime > this.NO_FACE_THRESHOLD) {
          detection.faceDetected = false
        }
      }
    }

    // Focus detection logic
    if (!detection.faceDetected || detection.suspiciousObjects.length > 0) {
      if (this.focusLostStartTime === 0) {
        this.focusLostStartTime = Date.now()
      } else if (Date.now() - this.focusLostStartTime > this.FOCUS_LOST_THRESHOLD) {
        detection.isFocused = false
      }
    } else {
      this.focusLostStartTime = 0
    }

    // Audio noise detection (placeholder - would need Web Audio API)
    detection.audioNoise = await this.detectAudioNoise()

    this.onDetectionUpdate(detection)
  }

  private detectEyeClosure(keypoints: any[]): boolean {
    // Simple eye closure detection based on face bounding box movement
    // In a real implementation, you'd analyze eye landmarks
    // For now, we'll use a simple heuristic
    return Math.random() < 0.1 // 10% chance of detecting eye closure for demo
  }

  private async detectAudioNoise(): Promise<boolean> {
    // Simple audio noise detection simulation
    // In a real implementation, you'd use Web Audio API
    return Math.random() < 0.05 // 5% chance of detecting noise for demo
  }

  cleanup(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval)
      this.detectionInterval = null
    }
    this.onDetectionUpdate = null
  }
}
