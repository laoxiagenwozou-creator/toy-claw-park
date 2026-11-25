import AVFoundation
import Vision

/// One run of the front camera. Only normalized eye midpoint and separation leave this queue.
final class FaceCapture: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate {
    enum Event {
        case started
        case face(x: Double, y: Double, span: Double, orientation: Int, at: Double)
        case unavailable
    }
    // Serialize teardown and startup even when a new run replaces an old one.
    private static let queue = DispatchQueue(label: "PocketClaw.face-camera", qos: .userInitiated)
    private let session = AVCaptureSession()
    private let output = AVCaptureVideoDataOutput()
    private let detector = VNDetectFaceLandmarksRequest()
    private let notify: (FaceCapture, Event) -> Void
    private var observers: [NSObjectProtocol] = []
    private var orientation: AVCaptureVideoOrientation = .landscapeRight
    private var lastFrame = -Double.infinity

    init(notify: @escaping (FaceCapture, Event) -> Void) { self.notify = notify }

    static var frontCamera: AVCaptureDevice? {
        AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front)
            ?? AVCaptureDevice.default(.builtInUltraWideCamera, for: .video, position: .front)
    }

    private func send(_ event: Event) {
        DispatchQueue.main.async { self.notify(self, event) }
    }

    func start(orientation: AVCaptureVideoOrientation) {
        Self.queue.async {
            guard let camera = Self.frontCamera,
                  let input = try? AVCaptureDeviceInput(device: camera) else {
                self.send(.unavailable)
                return
            }
            AVCaptureDevice.centerStageControlMode = .app
            AVCaptureDevice.isCenterStageEnabled = false
            self.session.automaticallyConfiguresApplicationAudioSession = false
            self.session.beginConfiguration()
            if self.session.canSetSessionPreset(.hd1280x720) {
                self.session.sessionPreset = .hd1280x720
            } else if self.session.canSetSessionPreset(.vga640x480) {
                self.session.sessionPreset = .vga640x480
            }
            guard self.session.canAddInput(input) else {
                self.session.commitConfiguration()
                self.send(.unavailable)
                return
            }
            self.session.addInput(input)
            guard self.session.canAddOutput(self.output) else {
                self.session.commitConfiguration()
                self.send(.unavailable)
                return
            }
            self.output.alwaysDiscardsLateVideoFrames = true
            self.output.videoSettings = [
                kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarFullRange
            ]
            self.session.addOutput(self.output)
            self.output.setSampleBufferDelegate(self, queue: Self.queue)
            self.session.commitConfiguration()
            // Crop ultra-wide iPad front cameras (~122 deg) down to a natural ~72 deg FOV
            // and run at 60 fps when supported for crisp, zero-lag glasses-free 3D parallax.
            if (try? camera.lockForConfiguration()) != nil {
                if camera.activeFormat.videoFieldOfView > 80 {
                    let targetZoom = min(1.65, camera.activeFormat.videoMaxZoomFactor)
                    if targetZoom > 1.05 { camera.videoZoomFactor = targetZoom }
                }
                if camera.activeFormat.videoSupportedFrameRateRanges.contains(where: { $0.maxFrameRate >= 59 }) {
                    let frame60 = CMTime(value: 1, timescale: 60)
                    camera.activeVideoMinFrameDuration = frame60
                    camera.activeVideoMaxFrameDuration = frame60
                }
                camera.unlockForConfiguration()
            }
            guard let connection = self.output.connection(with: .video),
                  connection.isVideoOrientationSupported, connection.isVideoMirroringSupported else {
                self.send(.unavailable)
                return
            }
            self.orientation = orientation
            connection.videoOrientation = orientation
            connection.automaticallyAdjustsVideoMirroring = false
            connection.isVideoMirrored = true
            for name in [AVCaptureSession.runtimeErrorNotification, AVCaptureSession.wasInterruptedNotification] {
                let observer = NotificationCenter.default.addObserver(forName: name, object: self.session, queue: nil) { [weak self] _ in
                    self?.send(.unavailable)
                }
                self.observers.append(observer)
            }
            self.session.startRunning()
            self.send(self.session.isRunning ? .started : .unavailable)
        }
    }

    func stop() {
        Self.queue.async {
            self.observers.forEach(NotificationCenter.default.removeObserver)
            self.observers.removeAll()
            self.output.setSampleBufferDelegate(nil, queue: nil)
            if self.session.isRunning { self.session.stopRunning() }
        }
    }

    private static func eyeCenter(_ region: VNFaceLandmarkRegion2D?, in box: CGRect) -> CGPoint? {
        guard let region, region.pointCount > 0 else { return nil }
        let pts = region.normalizedPoints
        var sx = 0.0, sy = 0.0
        for p in pts { sx += Double(p.x); sy += Double(p.y) }
        let n = Double(pts.count)
        return CGPoint(x: box.origin.x + (sx / n) * box.width,
                       y: box.origin.y + (sy / n) * box.height)
    }

    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer,
                       from connection: AVCaptureConnection) {
        let now = ProcessInfo.processInfo.systemUptime
        guard now - lastFrame >= 1.0 / 60,
              let pixels = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        lastFrame = now
        // VideoDataOutput has already rotated and mirrored these pixels. Vision's Y origin is at the bottom.
        let request = VNImageRequestHandler(cvPixelBuffer: pixels, orientation: .up)
        do { try request.perform([detector]) } catch { send(.unavailable); return }
        guard let face = detector.results?.max(by: {
            $0.boundingBox.width * $0.boundingBox.height < $1.boundingBox.width * $1.boundingBox.height
        }) else { return }
        let box = face.boundingBox
        if let left = Self.eyeCenter(face.landmarks?.leftEye, in: box),
           let right = Self.eyeCenter(face.landmarks?.rightEye, in: box) {
            let mx = (left.x + right.x) * 0.5
            let my = 1.0 - (left.y + right.y) * 0.5
            let ipd = hypot(right.x - left.x, right.y - left.y)
            if ipd > 0.025 {
                send(.face(x: mx, y: my, span: ipd, orientation: orientation.rawValue, at: now))
                return
            }
        }
        send(.face(x: box.midX, y: 1 - box.midY, span: box.width * 0.42,
                   orientation: orientation.rawValue, at: now))
    }
}
