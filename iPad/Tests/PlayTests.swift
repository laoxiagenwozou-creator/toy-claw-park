import XCTest

final class PlayTests: XCTestCase {
    @MainActor
    func testTouchAndColdLaunch() throws {
        try playRoundAndRelaunch { $0.launch() }
    }

    @MainActor
    private func playRoundAndRelaunch(start: (XCUIApplication) throws -> Void) throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        let web = app.webViews.firstMatch
        func button(_ text: String) -> XCUIElement {
            web.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", text)).firstMatch
        }
        func tap(_ text: String) {
            let b = button(text)
            XCTAssertTrue(b.waitForExistence(timeout: 45), text)
            XCTAssertTrue(b.wait(for: \.isEnabled, toEqual: true, timeout: 30))
            b.tap()
        }
        func enter() {
            tap("布鲁伊的后院")
            XCTAssertTrue(button("下爪抓玩具").waitForExistence(timeout: 60))
        }
        func screenshot(_ title: String) {
            let a = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
            a.name = title
            a.lifetime = .keepAlways
            add(a)
        }

        XCUIDevice.shared.orientation = .landscapeLeft
        try start(app)
        XCTAssertTrue(button("家长设置").waitForExistence(timeout: 45))
        screenshot("选关")
        enter()
        let stick = web.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "摇杆，")).firstMatch
        XCTAssertTrue(stick.exists)
        let grab = button("下爪抓玩具")
        XCTAssertGreaterThan(web.frame.width, web.frame.height)
        XCTAssertTrue(web.frame.contains(stick.frame))
        XCTAssertTrue(web.frame.contains(grab.frame))
        XCTAssertLessThan(stick.frame.maxX, grab.frame.minX)
        let origin = stick.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
        let right = stick.coordinate(withNormalizedOffset: CGVector(dx: 0.83, dy: 0.5))
        origin.press(forDuration: 0.12, thenDragTo: right, withVelocity: .slow, thenHoldForDuration: 0.18)
        screenshot("横屏机台")
        tap("下爪抓玩具")
        // The menu is enabled again after descent, delivery or miss, and return.
        let menu = button("选关")
        XCTAssertTrue(menu.wait(for: \.isEnabled, toEqual: true, timeout: 45))
        let muted = button("声音设置，已静音").exists
        tap("图卡")
        let readAloud = button("朗读图卡")
        XCTAssertTrue(readAloud.waitForExistence(timeout: 12))
        if muted {
            XCTAssertFalse(readAloud.isEnabled)
            print("Read-aloud stayed muted as configured on this device.")
        } else {
            tap("朗读图卡")
        }
        if button("接下任务").exists && button("接下任务").isEnabled { tap("接下任务") }
        let accepted = web.staticTexts.matching(NSPredicate(format: "label CONTAINS %@ OR label CONTAINS %@ OR label CONTAINS %@", "已接下", "等你送达", "已送达")).firstMatch
        XCTAssertTrue(accepted.waitForExistence(timeout: 8))
        XCUIDevice.shared.press(.home)
        app.activate()
        XCTAssertTrue(accepted.waitForExistence(timeout: 12))
        app.terminate()
        try start(app)
        enter()
        tap("图卡")
        XCTAssertTrue(accepted.waitForExistence(timeout: 12))
        screenshot("冷启动任务进度")
    }
}

extension PlayTests {
    @MainActor
    func testWalletAfterColdLaunch() throws {
        #if targetEnvironment(simulator)
        // This test sets a PIN. Only run it in our dedicated, disposable QA simulator.
        try XCTSkipUnless(ProcessInfo.processInfo.environment["SIMULATOR_DEVICE_NAME"]?.hasPrefix("PocketClaw QA") == true)
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launch()
        let web = app.webViews.firstMatch
        func button(_ prefix: String) -> XCUIElement {
            web.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", prefix)).firstMatch
        }
        func tap(_ name: String) {
            let b = button(name)
            XCTAssertTrue(b.waitForExistence(timeout: 45), name)
            XCTAssertTrue(b.wait(for: \.isEnabled, toEqual: true, timeout: 30))
            b.tap()
        }
        func fill(_ field: XCUIElement, _ text: String) {
            XCTAssertTrue(field.waitForExistence(timeout: 15))
            field.tap()
            field.typeText(text)
        }

        func unlock() {
            fill(web.secureTextFields.firstMatch, "5283")
            tap("解锁")
        }
        tap("家长设置")
        XCTAssertTrue(web.secureTextFields.firstMatch.waitForExistence(timeout: 20))
        if button("解锁").exists {
            unlock()
        } else {
            fill(web.secureTextFields.element(boundBy: 0), "5283")
            fill(web.secureTextFields.element(boundBy: 1), "5283")
            tap("确认 PIN")
        }
        let limit = button("投币限次")
        XCTAssertTrue(limit.waitForExistence(timeout: 20))
        if button("本次可玩").exists {
            limit.tap()
            tap("保存")
            tap("家长设置")
            unlock()
            XCTAssertTrue(limit.waitForExistence(timeout: 20))
        }
        limit.tap()
        tap("保存") // The normal first allowance defaults to five.
        tap("布鲁伊的后院")
        tap("投币，余 5 枚")
        XCTAssertTrue(button("已投币，余 4 枚").waitForExistence(timeout: 20))
        app.terminate()
        app.launch()
        tap("家长设置")
        fill(web.secureTextFields.firstMatch, "0001")
        tap("解锁")
        XCTAssertTrue(web.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "不正确")).firstMatch.waitForExistence(timeout: 12))
        tap("关闭家长设置")
        tap("玩具车小镇")
        XCTAssertTrue(button("已投币，余 4 枚").waitForExistence(timeout: 45))
        tap("下爪抓玩具")
        XCTAssertTrue(button("投币，余 4 枚").wait(for: \.isEnabled, toEqual: true, timeout: 45))
        app.terminate()
        app.launch()
        tap("玩具车小镇")
        XCTAssertTrue(button("投币，余 4 枚").waitForExistence(timeout: 45))
        XCTAssertTrue(button("先投币").waitForExistence(timeout: 30))
        XCTAssertFalse(button("先投币").isEnabled)
        tap("选关")
        tap("家长设置")
        unlock()
        XCTAssertTrue(limit.waitForExistence(timeout: 20))
        limit.tap()
        tap("保存")
        #else
        throw XCTSkip("此回归使用专用 iPad 模拟器。")
        #endif
    }
}

extension PlayTests {
    /// Only run when the owner requests a physical offline acceptance test, connected over USB.
    @MainActor
    func testAirplaneModeTouchAndColdLaunch() throws {
        try XCTSkipUnless(ProcessInfo.processInfo.environment["POCKETCLAW_OFFLINE_ACCEPTANCE"] == "1")
        let settings = XCUIApplication(bundleIdentifier: "com.apple.Preferences")
        settings.launch()
        let plane = settings.switches.matching(NSPredicate(format:
            "label CONTAINS[c] 'Airplane' OR label CONTAINS '飞行模式' OR identifier CONTAINS[c] 'AIRPLANE'")).firstMatch
        XCTAssertTrue(plane.waitForExistence(timeout: 12))
        let initial = try XCTUnwrap(plane.value as? String)
        func returnsToSidebar() {
            if !plane.exists {
                let back = settings.navigationBars.buttons.firstMatch
                if back.exists { back.tap() }
            }
        }
        func setSwitch(_ element: XCUIElement, to target: String) -> Bool {
            if element.value as? String == target { return true }
            let state = NSPredicate { _, _ in element.value as? String == target }
            print("Switch", element.identifier, "value", element.value ?? "", "frame", element.frame)
            for trailing in [true, false] {
                if trailing && element.frame.width > 90 {
                    let offset = 1 - 30 / element.frame.width
                    element.coordinate(withNormalizedOffset: CGVector(dx: offset, dy: 0.5)).tap()
                } else { element.tap() }
                if XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: state, object: nil)], timeout: 4) == .completed {
                    print("Switch confirmed", element.identifier, target)
                    return true
                }
            }
            print("Switch stayed", element.identifier, element.value ?? "")
            return false
        }
        var restoreWiFi = false
        func wifiSwitch() -> XCUIElement {
            let labels = "^(Wi-Fi|WLAN|无线局域网|無線區域網路|无线网络).*"
            let row = settings.cells.matching(NSPredicate(format: "label MATCHES[c] %@ OR identifier == 'WIFI'", labels)).firstMatch
            if row.exists { row.tap() }
            else {
                let text = settings.staticTexts.matching(NSPredicate(format: "label MATCHES[c] %@", labels)).firstMatch
                if text.exists { text.tap() }
            }
            return settings.switches.matching(NSPredicate(format: "label MATCHES[c] %@ OR identifier == 'Wi-Fi'", labels)).firstMatch
        }
        // Register before changing radios so XCTest also restores them after a launch exception.
        let restorePlane = ProcessInfo.processInfo.environment["POCKETCLAW_RESTORE_AIRPLANE"] ?? initial
        addTeardownBlock { @MainActor in
            settings.activate()
            returnsToSidebar()
            if restoreWiFi {
                let wifi = wifiSwitch()
                XCTAssertTrue(wifi.exists && setSwitch(wifi, to: "1"))
                returnsToSidebar()
            }
            XCTAssertTrue(plane.exists && setSwitch(plane, to: restorePlane))
        }
        func startFromHome(_ app: XCUIApplication) throws {
            if app.state != .notRunning { app.terminate() }
            XCUIDevice.shared.press(.home)
            let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
            let icon = springboard.icons.matching(NSPredicate(format: "label == %@", "口袋抓娃乐园")).firstMatch
            guard icon.waitForExistence(timeout: 8) else {
                throw NSError(domain: "PocketClaw.QA", code: 1, userInfo: [NSLocalizedDescriptionKey: "主屏上找不到游戏图标"])
            }
            icon.tap()
            guard app.wait(for: .runningForeground, timeout: 12) else {
                let alert = springboard.alerts.firstMatch
                let reason = alert.exists ? alert.staticTexts.allElementsBoundByIndex.map(\.label).joined(separator: " ") : "未进入游戏"
                throw NSError(domain: "PocketClaw.QA", code: 2, userInfo: [NSLocalizedDescriptionKey: reason])
            }
        }
        if ProcessInfo.processInfo.environment["POCKETCLAW_PRIME_SIGNING"] == "1" {
            guard setSwitch(plane, to: "0") else { throw NSError(domain: "PocketClaw.QA", code: 3) }
            let wifi = wifiSwitch()
            guard wifi.waitForExistence(timeout: 8), setSwitch(wifi, to: "1") else {
                throw NSError(domain: "PocketClaw.QA", code: 4)
            }
            let game = XCUIApplication()
            game.terminate()
            try startFromHome(game)
            XCTAssertTrue(game.webViews.firstMatch.waitForExistence(timeout: 30))
            game.terminate()
            settings.activate()
            returnsToSidebar()
        }
        guard setSwitch(plane, to: "1") else { throw NSError(domain: "PocketClaw.QA", code: 5) }
        let wifi = wifiSwitch()
        guard wifi.waitForExistence(timeout: 8) else { throw NSError(domain: "PocketClaw.QA", code: 6) }
        restoreWiFi = wifi.value as? String == "1"
        guard setSwitch(wifi, to: "0") else { throw NSError(domain: "PocketClaw.QA", code: 7) }
        print("Verified Airplane Mode on and Wi-Fi off before launching game")
        try playRoundAndRelaunch(start: startFromHome)
    }
}

extension PlayTests {
    @MainActor
    func testLongPressKeepsGameInControl() throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launch()
        let web = app.webViews.firstMatch
        func control(_ prefix: String) -> XCUIElement {
            web.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", prefix)).firstMatch
        }
        func holdLabel(_ prefix: String) {
            let label = web.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", prefix)).firstMatch
            XCTAssertTrue(label.waitForExistence(timeout: 20))
            label.coordinate(withNormalizedOffset: CGVector(dx: 0.25, dy: 0.5)).press(forDuration: 1.4)
            XCTAssertFalse(app.menus.firstMatch.exists)
            XCTAssertFalse(app.menuItems.firstMatch.exists)
        }
        holdLabel("选一台机台")
        control("家长设置").tap()
        let pin = web.secureTextFields.firstMatch
        XCTAssertTrue(pin.waitForExistence(timeout: 10))
        pin.tap()
        pin.typeText("1")
        XCTAssertEqual((pin.value as? String)?.count, 1)
        pin.typeText(XCUIKeyboardKey.delete.rawValue)
        control("关闭家长设置").tap()
        control("布鲁伊的后院").tap()
        let stick = control("摇杆，")
        XCTAssertTrue(stick.waitForExistence(timeout: 20))
        let center = stick.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
        let right = stick.coordinate(withNormalizedOffset: CGVector(dx: 0.82, dy: 0.5))
        center.press(forDuration: 0.1, thenDragTo: right, withVelocity: .slow, thenHoldForDuration: 0.25)
        holdLabel("对准再下爪")
        control("图卡").tap()
        XCTAssertTrue(control("朗读图卡").waitForExistence(timeout: 8))
    }
}
