'use client'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-8"></div>
        <h1 className="text-3xl font-bold text-white mb-4">Proctorly</h1>
        <p className="text-gray-300 text-lg">Initializing AI Models...</p>
        <div className="mt-4 text-sm text-gray-400">
          Loading TensorFlow.js and MediaPipe models
        </div>
      </div>
    </div>
  )
}
