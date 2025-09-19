# Proctorly - AI-Powered Video Proctoring System

A comprehensive video proctoring system built with **MERN stack**, **WebRTC**, **TensorFlow.js**, **MediaPipe**, and **YOLO models** for real-time monitoring and detection of suspicious activities during online interviews and exams.

## 🚀 Features

### Core Features
- **Real-time Video Capture** using WebRTC and MediaPipe
- **AI-Powered Focus Detection** with face tracking and attention monitoring
- **Object Detection** using COCO-SSD for suspicious items (phones, books, devices)
- **Comprehensive Logging** with MongoDB storage and timestamped events
- **PDF Report Generation** with detailed analytics and integrity scoring
- **Real-time Alerts** for suspicious activities

### Detection Capabilities
- ✅ **Focus Loss Detection** - Alerts when candidate looks away for >5 seconds
- ✅ **Face Detection** - Monitors for face presence and multiple faces
- ✅ **Object Detection** - Identifies phones, books, electronic devices
- ✅ **Eye Closure Detection** - Detects prolonged eye closure/drowsiness
- ✅ **Audio Noise Detection** - Monitors background noise levels
- ✅ **Multiple Face Detection** - Flags when multiple people are in frame

### Bonus Features
- 🎯 **Real-time Overlays** with bounding boxes and status indicators
- 📊 **Live Statistics Dashboard** with integrity scoring
- 🔔 **Alert System** with severity-based notifications
- 📱 **Responsive Design** with modern UI/UX
- 📈 **Time-based Analytics** for detailed reporting

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **TensorFlow.js** for AI models
- **MediaPipe** for face detection and landmarks
- **COCO-SSD** for object detection
- **WebRTC** for video capture

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **PDFKit** for report generation
- **CORS** and **Helmet** for security
- **Rate Limiting** for API protection

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 4.4+
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd proctorly
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Create server/.env file
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/proctorly
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🎯 Usage

### For Candidates

1. **Start a Session**
   - Navigate to http://localhost:3000
   - Fill in candidate information (name, email)
   - Click "Start Proctored Session"

2. **During the Session**
   - Keep your face visible to the camera
   - Maintain focus on the screen
   - Avoid prohibited items (phones, books, etc.)
   - Monitor the real-time status panel

3. **Session Monitoring**
   - View live integrity score
   - See detection status indicators
   - Receive real-time alerts for violations

### For Administrators

1. **View Reports**
   ```bash
   # Get JSON report
   GET /api/reports/:candidateId?format=json
   
   # Get PDF report
   GET /api/reports/:candidateId?format=pdf
   ```

2. **Monitor Logs**
   ```bash
   # Get all logs for a candidate
   GET /api/logs/:candidateId
   
   # Get statistics
   GET /api/logs/stats/:candidateId
   ```

## 🔧 API Endpoints

### Candidates
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates/:candidateId` - Get candidate details
- `PUT /api/candidates/:candidateId` - Update candidate
- `POST /api/candidates/:candidateId/end` - End interview

### Logs
- `POST /api/logs` - Create log entry
- `GET /api/logs/:candidateId` - Get candidate logs
- `GET /api/logs/stats/:candidateId` - Get statistics

### Reports
- `GET /api/reports/:candidateId` - Generate report (JSON/PDF)

## 🎨 Detection Engine

The system uses multiple AI models for comprehensive monitoring:

### Face Detection
- **MediaPipe Face Detection** for real-time face tracking
- **Face Landmarks Detection** for eye closure monitoring
- **Multiple Face Detection** for unauthorized persons

### Object Detection
- **COCO-SSD** for detecting suspicious objects:
  - Mobile phones
  - Books and papers
  - Electronic devices
  - Laptops and tablets

### Focus Monitoring
- **Attention Tracking** based on face orientation
- **Gaze Direction** analysis
- **Screen Focus** detection

## 📊 Reporting System

### Integrity Scoring
The system calculates an integrity score (0-100) based on:
- Focus lost events: -2 points each
- Suspicious object detection: -5 points each
- Multiple face detection: -10 points
- No face detected: -15 points

### Report Contents
- Candidate information and session duration
- Event timeline with timestamps
- Statistical analysis by time periods
- Risk level assessment
- Detailed violation breakdown

## 🔒 Security Features

- **Rate Limiting** on API endpoints
- **CORS Protection** for cross-origin requests
- **Input Validation** and sanitization
- **Secure Headers** with Helmet.js
- **Data Encryption** in transit and at rest

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   PORT=5000
   ```

2. **Build and Start**
   ```bash
   npm run build
   npm start
   ```

3. **Docker Deployment** (Optional)
   ```dockerfile
   # Add Dockerfile for containerized deployment
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- [ ] Advanced eye tracking with MediaPipe
- [ ] Voice analysis for stress detection
- [ ] Browser tab monitoring
- [ ] Screen sharing detection
- [ ] Machine learning-based anomaly detection
- [ ] Multi-language support
- [ ] Mobile app companion

---

**Built with ❤️ using modern web technologies for secure and reliable online proctoring.**
