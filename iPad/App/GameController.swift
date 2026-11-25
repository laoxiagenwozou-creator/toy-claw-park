import UIKit
import WebKit
import LocalAuthentication
import AVFoundation

final class GameController: UIViewController, WKNavigationDelegate, WKScriptMessageHandler {
    // A stable HTTPS origin enables Web Crypto, IndexedDB and localStorage after updates.
    // The response (including every subresource) comes from the application bundle.
    private static let pageURL = URL(string: "https://pupclaw.invalid/")!
    private var web: WKWebView!
    private var playing = false
    private var foreground = false
    private var parentAuth: LAContext?

    private var cameraWanted = false
    private var requestingCamera = false
    private var capture: FaceCapture?
    private var captureOrientation: AVCaptureVideoOrientation?
    private var deliveringSample = false

    override var prefersStatusBarHidden: Bool { true }
    override var prefersHomeIndicatorAutoHidden: Bool { true }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 1, green: 0.96, blue: 0.87, alpha: 1)
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        do {
            let script = try bundledText("Bridge", "js")
            config.userContentController.addUserScript(WKUserScript(source: "const parkHasFrontCamera = \(FaceCapture.frontCamera != nil);\n" + script,
                injectionTime: .atDocumentStart, forMainFrameOnly: true))
        } catch {
            showFailure()
            return
        }
        config.userContentController.add(WeakHandler(self), name: "park")
        web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self
        web.allowsLinkPreview = false
        web.isMultipleTouchEnabled = true
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.scrollView.bounces = false
        web.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(web)
        let safe = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            web.leadingAnchor.constraint(equalTo: safe.leadingAnchor),
            web.trailingAnchor.constraint(equalTo: safe.trailingAnchor),
            web.topAnchor.constraint(equalTo: safe.topAnchor),
            web.bottomAnchor.constraint(equalTo: view.keyboardLayoutGuide.topAnchor)
        ])
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
        loadPark()
    }

    private func bundledText(_ name: String, _ ext: String) throws -> String {
        guard let url = Bundle.main.url(forResource: name, withExtension: ext) else {
            throw CocoaError(.fileNoSuchFile)
        }
        return try String(contentsOf: url, encoding: .utf8)
    }

    private func loadPark() {
        do {
            let html = try bundledText("Park", "html")
            web.loadSimulatedRequest(URLRequest(url: Self.pageURL), responseHTML: html)
        } catch { showFailure() }
    }

    private func showFailure() {
        let label = UILabel()
        label.text = "游戏资源读取失败，请重新构建并安装。"
        label.textAlignment = .center
        label.frame = view.bounds
        label.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(label)
    }

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let local = action.targetFrame?.isMainFrame == true && action.request.url == Self.pageURL
        decisionHandler(local && action.navigationType == .other ? .allow : .cancel)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        lockParentSettings()
        cameraWanted = false
        stopCamera()
        playing = false
        updateDisplay()
        loadPark()
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, message.frameInfo.securityOrigin.host == Self.pageURL.host,
              message.frameInfo.securityOrigin.protocol == "https",
              let body = message.body as? [String: Any] else { return }
        switch body["action"] as? String {
        case "game":
            playing = body["active"] as? Bool == true
            updateDisplay()
        case "camera":
            cameraWanted = body["enabled"] as? Bool == true
            updateCamera()
        case "parent":
            if let ticket = body["ticket"] as? Int, ticket > 0 { authenticate(ticket) }
        default: break
        }
    }

    private func authenticate(_ ticket: Int) {
        let context = LAContext()
        guard foreground, parentAuth == nil,
              context.canEvaluatePolicy(.deviceOwnerAuthentication, error: nil) else {
            parentResult(ticket, false)
            return
        }
        parentAuth = context
        context.evaluatePolicy(.deviceOwnerAuthentication,
                               localizedReason: "验证本机锁屏身份以重设家长 PIN") { [weak self] ok, _ in
            DispatchQueue.main.async {
                guard let self, self.parentAuth === context else { return }
                self.parentAuth = nil
                self.parentResult(ticket, ok)
            }
        }
    }

    private func parentResult(_ ticket: Int, _ ok: Bool) {
        web?.evaluateJavaScript("window.ParkParent?.confirmed(\(ticket),\(ok ? "true" : "false"))")
    }

    func lockParentSettings() {
        parentAuth?.invalidate()
        parentAuth = nil
        web?.evaluateJavaScript("document.querySelector('#parent-settings[open]')?.close()")
    }

    func setForeground(_ active: Bool) {
        foreground = active
        updateCamera()
        updateDisplay()
        web?.evaluateJavaScript("window.BudSound?.setForeground(\(active ? "true" : "false"))")
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        if capture != nil { updateCamera() }
    }

    private func stopCamera() {
        let old = capture
        capture = nil
        captureOrientation = nil
        deliveringSample = false
        old?.stop()
    }

    private func updateCamera() {
        guard cameraWanted, foreground else { stopCamera(); return }
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            let direction: AVCaptureVideoOrientation = view.window?.windowScene?.interfaceOrientation == .landscapeLeft ? .landscapeLeft : .landscapeRight
            if captureOrientation == direction { return }
            stopCamera()
            let camera = FaceCapture { [weak self] source, event in self?.cameraEvent(source, event) }
            capture = camera
            captureOrientation = direction
            camera.start(orientation: direction)
        case .notDetermined:
            guard !requestingCamera else { return }
            requestingCamera = true
            AVCaptureDevice.requestAccess(for: .video) { [weak self] _ in
                DispatchQueue.main.async {
                    self?.requestingCamera = false
                    self?.updateCamera()
                }
            }
        default:
            cameraWanted = false
            stopCamera()
            web?.evaluateJavaScript("window.BudCamera?.state('denied')")
        }
    }

    private func cameraEvent(_ source: FaceCapture, _ event: FaceCapture.Event) {
        guard source === capture, foreground, cameraWanted else { return }
        switch event {
        case .started:
            web.evaluateJavaScript("window.BudCamera?.state('starting')")
        case .unavailable:
            cameraWanted = false
            stopCamera()
            web.evaluateJavaScript("window.BudCamera?.state('unavailable')")
        case let .face(x, y, span, orientation, at):
            guard !deliveringSample, ProcessInfo.processInfo.systemUptime - at < 0.18 else { return }
            deliveringSample = true
            web.evaluateJavaScript("window.BudCamera?.sample(\(x),\(y),\(span),\(orientation),\(at * 1000))") { [weak self] _, _ in
                if self?.capture === source { self?.deliveringSample = false }
            }
        }
    }

    private func updateDisplay() {
        UIApplication.shared.isIdleTimerDisabled = playing && foreground
    }
}

private final class WeakHandler: NSObject, WKScriptMessageHandler {
    private weak var target: GameController?
    init(_ target: GameController) { self.target = target }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.userContentController(controller, didReceive: message)
    }
}
