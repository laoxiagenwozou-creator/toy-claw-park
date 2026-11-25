import XCTest
import WebKit
import AVFoundation

@MainActor
final class AudioTests: XCTestCase {
    func testGameAudioAndLayout() async throws {
        let windows = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.flatMap { $0.windows }
        let root = try XCTUnwrap(windows.first(where: { $0.isKeyWindow })?.rootViewController)
        let web = try XCTUnwrap(root.view.subviews.compactMap { $0 as? WKWebView }.first)
        func waitFor(_ expression: String) async throws {
            let limit = Date().addingTimeInterval(60)
            repeat {
                if (try? await web.evaluateJavaScript(expression)) as? Bool == true { return }
                try await Task.sleep(nanoseconds: 150_000_000)
            } while Date() < limit
            throw NSError(domain: "PocketClaw.QA", code: 1, userInfo: [NSLocalizedDescriptionKey: expression])
        }
        try await waitFor("document.querySelectorAll('.stage-card').length === 12")
        XCTAssertTrue(root.view.safeAreaLayoutGuide.layoutFrame.insetBy(dx: -1, dy: -1).contains(web.frame))
        _ = try await web.evaluateJavaScript("""
        (() => {
          window.audioProbe = [];
          const start = AudioBufferSourceNode.prototype.start;
          AudioBufferSourceNode.prototype.start = function(...args) {
            const b = this.buffer;
            if (b?.duration > 1) {
              let peak = 0;
              for (const x of b.getChannelData(0)) peak = Math.max(peak, Math.abs(x));
              audioProbe.push({loop: this.loop, duration: b.duration, peak});
              window.testAudioContext = this.context;
            }
            return start.apply(this, args);
          };
          document.querySelector('[data-stage=yard]').click();
        })()
        """)
        try await waitFor("document.getElementById('machine').dataset.mode==='play'")
        let hasCamera = try await web.evaluateJavaScript("typeof window.BudNative.setCameraEnabled === 'function'") as? Bool
        let cameraVisible = try await web.evaluateJavaScript("!document.getElementById('camera').hidden && Boolean(window.BudCamera)") as? Bool
        XCTAssertEqual(cameraVisible, hasCamera)
        try await waitFor("audioProbe.some(x => x.loop && x.duration > 30 && x.peak > .01)")
        _ = try await web.evaluateJavaScript("document.getElementById('request-open').click();document.getElementById('read-request').click()")
        try await waitFor("audioProbe.some(x => !x.loop && x.duration > 1 && x.peak > .01) && testAudioContext.state==='running'")
        print("Decoded and started original audio", try await web.evaluateJavaScript("JSON.stringify(audioProbe)") as Any)
        _ = try await web.evaluateJavaScript("window.BudSound.setForeground(false)")
        try await waitFor("testAudioContext.state==='suspended'")
        _ = try await web.evaluateJavaScript("window.BudSound.setForeground(true)")
        try await waitFor("testAudioContext.state==='running'")
        _ = try await web.evaluateJavaScript("document.getElementById('room-close').click();document.getElementById('menu-button').click();document.getElementById('shelf-open').click();document.getElementById('request-tab').click()")
        let stages = ["yard", "town", "lookout", "garden", "snow", "space", "reef", "pony", "peppa", "sheriff", "chicks", "spidey"]
        for stage in stages {
            let count = try await web.evaluateJavaScript("audioProbe.length") as? Int ?? 0
            _ = try await web.evaluateJavaScript("document.querySelector('#shelf-stages [data-theme=\(stage)]').click();document.getElementById('read-request').click()")
            try await waitFor("audioProbe.length > \(count) && !audioProbe.at(-1).loop && audioProbe.at(-1).peak > .01")
        }
        let audio = AVAudioSession.sharedInstance()
        print("12 original voices played", audio.currentRoute.outputs.map { $0.portType.rawValue }, "volume", audio.outputVolume)
    }
}

extension AudioTests {
    /// Interactive hardware check. The owner chooses camera access and moves in front of the iPad.
    func testFrontCameraMovesMachineProjection() async throws {
        #if targetEnvironment(simulator)
        throw XCTSkip("需要一台有前置摄像头的 iPad 和真人。")
        #else
        let scene = try XCTUnwrap(UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first)
        let root = try XCTUnwrap(scene.keyWindow?.rootViewController)
        let web = try XCTUnwrap(root.view.subviews.compactMap { $0 as? WKWebView }.first)
        func waitFor(_ expression: String, seconds: Int) async throws -> Bool {
            let deadline = Date().addingTimeInterval(TimeInterval(seconds))
            repeat {
                if (try? await web.evaluateJavaScript(expression)) as? Bool == true { return true }
                try await Task.sleep(nanoseconds: 200_000_000)
            } while Date() < deadline
            return false
        }
        let ready = try await waitFor("document.querySelectorAll('.stage-card').length === 12", seconds: 30)
        XCTAssertTrue(ready)
        let camera = try await web.evaluateJavaScript("typeof window.BudNative.setCameraEnabled === 'function'") as? Bool
        try XCTSkipUnless(camera == true, "没有可用的前置摄像头")
        // Observe real input and the rendered projection. Never synthesize face frames or store images.
        _ = try await web.evaluateJavaScript("""
        (() => {
          const probe = window.cameraQA = {samples:0, low:null, high:null, state:'', audio:false};
          const camera = window.BudCamera, sample = camera.sample, state = camera.state;
          camera.sample = (...args) => { probe.samples++; return sample.apply(camera, args); };
          camera.state = value => { probe.state = value; return state.call(camera, value); };
          const gl = WebGL2RenderingContext.prototype, names = new WeakMap();
          const get = gl.getUniformLocation, set = gl.uniformMatrix4fv;
          gl.getUniformLocation = function(program, name) {
            const loc = get.call(this, program, name);
            if (loc) names.set(loc, name);
            return loc;
          };
          gl.uniformMatrix4fv = function(loc, transpose, data, ...rest) {
            if (names.get(loc) === 'projectionMatrix' && data[11] === -1 && data[15] === 0 &&
                document.querySelector('#machine').dataset.mode === 'play' &&
                document.querySelector('#view-mode').dataset.mode === 'live') {
              probe.low = Math.min(probe.low ?? data[8], data[8]);
              probe.high = Math.max(probe.high ?? data[8], data[8]);
            }
            return set.call(this, loc, transpose, data, ...rest);
          };
          const start = AudioBufferSourceNode.prototype.start;
          AudioBufferSourceNode.prototype.start = function(...args) {
            if (this.loop && this.buffer?.duration > 30) probe.audio = true;
            return start.apply(this, args);
          };
          document.querySelector('.stage-card[data-stage=yard]').click();
        })()
        """)
        let opened = try await waitFor("document.querySelector('#machine').dataset.mode === 'play'", seconds: 45)
        XCTAssertTrue(opened)
        print("Camera hardware scenario opened machine:", opened)
        let finished = try await waitFor("""
            cameraQA.high - cameraQA.low > .045 ||
            ['unavailable','denied'].includes(cameraQA.state)
            """, seconds: 75)
        let report = try await web.evaluateJavaScript("JSON.stringify(cameraQA)") as? String ?? ""
        print("Camera hardware result", report)
        let attachment = XCTAttachment(string: report)
        attachment.name = "实测前置摄像头和机台透视"
        attachment.lifetime = .keepAlways
        add(attachment)
        let moving = try await web.evaluateJavaScript("cameraQA.samples >= 3 && cameraQA.high - cameraQA.low > .045") as? Bool
        XCTAssertTrue(finished && moving == true, report)
        guard moving == true else { return }

        // Let the normal gallery read a sample earned medal once. No fixture is written to the device.
        _ = try await web.evaluateJavaScript("""
        (() => {
          document.querySelector('#menu-button').click();
          const key = 'toy-park-v2', read = Storage.prototype.getItem;
          const saved = localStorage.getItem(key);
          const fixture = JSON.stringify({town:{round:6, total:6, clears:1, slots:Array(6).fill(null)}});
          try {
            Storage.prototype.getItem = function(k) {
              return this === localStorage && k === key ? fixture : read.call(this, k);
            };
            document.querySelector('#wall-open').click();
          } finally { Storage.prototype.getItem = read; }
          document.querySelector('.medal-slot[data-stage=town]').click();
          const card = document.querySelector('#wall-medal .foil-card');
          const probe = window.medalQA = {low:null, high:null, savedIntact:localStorage.getItem(key) === saved};
          new MutationObserver(() => {
            if (!card.classList.contains('is-gaze') || document.querySelector('#view-mode').dataset.mode !== 'live') return;
            const yaw = parseFloat(card.style.getPropertyValue('--yaw'));
            if (!Number.isFinite(yaw)) return;
            probe.low = Math.min(probe.low ?? yaw, yaw);
            probe.high = Math.max(probe.high ?? yaw, yaw);
          }).observe(card, {attributes:true, attributeFilter:['style']});
        })()
        """)
        let tilted = try await waitFor("medalQA.high - medalQA.low > 1.2 && medalQA.savedIntact", seconds: 55)
        let medalReport = try await web.evaluateJavaScript("JSON.stringify(medalQA)") as? String ?? ""
        print("Camera hardware medal result", medalReport)
        XCTAssertTrue(tilted, medalReport)
        _ = try await web.evaluateJavaScript("document.querySelector('#wall-close').click()")
        #endif
    }
}
