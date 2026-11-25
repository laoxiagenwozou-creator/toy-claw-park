import Cocoa
import WebKit
import AVFoundation
import LocalAuthentication

final class GameWindowController: NSWindowController, WKNavigationDelegate, WKScriptMessageHandler, NSWindowDelegate {
    private static let pageURL = URL(string: "https://pupclaw.invalid/")!
    private var web: WKWebView!
    private var foreground = true
    private var parentAuth: LAContext?
    private var cameraWanted = false
    private var requestingCamera = false
    private var capture: FaceCaptureMac?
    private var deliveringSample = false

    init() {
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1280, height: 820),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "口袋抓娃乐园"
        window.minSize = NSSize(width: 900, height: 580)
        window.backgroundColor = NSColor(red: 1, green: 0.96, blue: 0.87, alpha: 1)
        window.collectionBehavior = [.fullScreenPrimary]
        window.center()
        super.init(window: window)
        window.delegate = self
        setupWebView()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError() }

    private func setupWebView() {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.mediaTypesRequiringUserActionForPlayback = []
        do {
            let script = try bundledText("Bridge", "js")
            let header = "const parkHasFrontCamera = \(FaceCaptureMac.webcam != nil);\n"
            config.userContentController.addUserScript(WKUserScript(
                source: header + script,
                injectionTime: .atDocumentStart,
                forMainFrameOnly: true
            ))
        } catch {
            showFailure()
            return
        }
        config.userContentController.add(WeakMacHandler(self), name: "park")
        web = WKWebView(frame: window?.contentView?.bounds ?? .zero, configuration: config)
        web.navigationDelegate = self
        web.autoresizingMask = [.width, .height]
        window?.contentView?.addSubview(web)
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
        } catch {
            showFailure()
        }
    }

    private func showFailure() {
        let label = NSTextField(labelWithString: "游戏资源读取失败，请重新构建应用。")
        label.alignment = .center
        label.frame = window?.contentView?.bounds ?? NSRect(x: 0, y: 0, width: 600, height: 100)
        label.autoresizingMask = [.width, .height]
        window?.contentView?.addSubview(label)
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
        loadPark()
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame,
              message.frameInfo.securityOrigin.host == Self.pageURL.host,
              message.frameInfo.securityOrigin.protocol == "https",
              let body = message.body as? [String: Any] else { return }
        switch body["action"] as? String {
        case "camera":
            cameraWanted = body["enabled"] as? Bool == true
            updateCamera()
        case "parent":
            if let ticket = body["ticket"] as? Int, ticket > 0 { authenticate(ticket) }
        default:
            break
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
                               localizedReason: "验证本机身份以重设家长 PIN") { [weak self] ok, _ in
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
        web?.evaluateJavaScript("window.BudSound?.setForeground(\(active ? "true" : "false"))")
    }

    func shutdown() {
        cameraWanted = false
        stopCamera()
    }

    func windowWillClose(_ notification: Notification) {
        shutdown()
    }

    private func stopCamera() {
        let old = capture
        capture = nil
        deliveringSample = false
        old?.stop()
    }

    private func updateCamera() {
        guard cameraWanted, foreground else { stopCamera(); return }
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            if capture != nil { return }
            let camera = FaceCaptureMac { [weak self] source, event in self?.cameraEvent(source, event) }
            capture = camera
            camera.start()
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

    private func cameraEvent(_ source: FaceCaptureMac, _ event: FaceCaptureMac.Event) {
        guard source === capture, foreground, cameraWanted else { return }
        switch event {
        case .started:
            web?.evaluateJavaScript("window.BudCamera?.state('starting')")
        case .unavailable:
            cameraWanted = false
            stopCamera()
            web?.evaluateJavaScript("window.BudCamera?.state('unavailable')")
        case let .face(x, y, span, orientation, at):
            guard !deliveringSample, ProcessInfo.processInfo.systemUptime - at < 0.18 else { return }
            deliveringSample = true
            web?.evaluateJavaScript("window.BudCamera?.sample(\(x),\(y),\(span),\(orientation),\(at * 1000))") { [weak self] _, _ in
                if self?.capture === source { self?.deliveringSample = false }
            }
        }
    }
}

private final class WeakMacHandler: NSObject, WKScriptMessageHandler {
    private weak var target: GameWindowController?
    init(_ target: GameWindowController) { self.target = target }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.userContentController(controller, didReceive: message)
    }
}
