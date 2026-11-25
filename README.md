# 口袋抓娃乐园（Toy Claw Park）

一款离线运行的 **多主题裸眼 3D 抓娃娃机**，提供 **macOS 原生桌面版** 与 **iOS / iPadOS 原生版**（同时支持打包为跨平台离线单文件 HTML）。内置 12 台首尾相连的立体主题机台、72+ 款 3D 玩具模型、60Hz 摄像头裸眼 3D 视角追踪、取物口收藏书架、任务语音图卡、镭射通关纪念牌以及家长投币/抓中率控制。

---

## 核心特性

- **裸眼 3D 离轴透视（macOS / iOS / iPadOS）**
  - 原生调用本机前置摄像头与 Apple Vision **60Hz 真实双眼中点 + 瞳距（IPD）追踪**（所有检测均在本地完成，不保存、不上传任何画面）。
  - iPad 超广角前摄自动做硬件视野裁切；左右/上下轻轻探头即可从侧面或上方窥看夹爪与玩偶的真实 3D 纵深，前玻璃框固定在屏幕平面上。
  - 可在机台底部「视角」菜单中关闭默认的地面瞄准圈，纯靠大号立体夹爪、上沿滑块盘、侧轨刻度与裸眼 3D 视差挑战真实对准。
- **12 台相连的立体主题机台**
  - 雪地玩偶屋、玩具车小镇、汪汪队总部、布鲁伊的后院、奇妙花房、珊瑚海湾、星空基地、小马宝莉、小猪佩奇、啦咘啦哆警长、萌鸡小队、蜘蛛侠。
  - 顶部机台大招牌实时展示当前关卡名、本轮抓取进度（`★ 0 / 6`）以及通关成就状态；点击左右露出邻机即可平滑横向换台。
- **收藏、任务图卡与通关纪念牌**
  - 抓中玩具后自动送往左前方落奖口，可打开「取物口」3D 旋转试玩并拖入多层展示书架。
  - 每关内置离线普通话任务语音图卡；每抓满 6 件通关即可获得一枚带编号的 3D 镭射纪念牌（同样支持裸眼 3D 光影倾斜与翻面查看）。
- **家长设置**
  - 首页底部「家长设置」支持 4 位 PIN 码保护（含恢复码与本机 Touch ID / Face ID 锁屏验证），可独立调节投币限次额度与抓中概率（0%–100%，步进 5%）。

---

## 平台与操控

| 平台 | 运行方式 | 操控方式 |
|---|---|---|
| **macOS**（13.0+） | 运行 `PocketClaw.app`（见 Releases 中的 `.dmg` / `.zip`） | 方向键 / `WASD` 移爪，`Space` 下爪；前置摄像头自动支持裸眼 3D 探头，关闭探头后可鼠标拖动换视角 |
| **iOS / iPadOS**（16.0+） | Xcode 真机编译安装或安装 `.ipa`（支持 iPhone & iPad 横屏） | 左手虚拟摇杆瞄准 + 右手点「抓！」；前置摄像头 60Hz 裸眼 3D 探头，支持轻点玩具旋转、点两侧邻机换台 |
| **离线 Web** | 运行 `npm run bundle` 后直接双击生成的单文件 HTML | 键盘 + 鼠标拖动视角，零联网离线运行 |

---

## 目录结构

```text
.
├── web/                  # Three.js 0.180.0 核心 3D 引擎、12 主题场景、模型、音效与 UI
├── macOS/                # 原生 macOS App（AppKit + WKWebView + 60Hz 摄像头裸眼 3D）
│   ├── App/
│   └── PocketClawMac.xcodeproj
├── iPad/                 # 通用 iOS / iPadOS App（UIKit + WKWebView + 60Hz 眼部追踪）
│   ├── App/
│   ├── Tests/
│   ├── bundle-game.sh    # 将 web/ 与 Apple Lossless 音轨打包为离线 Park.html
│   └── PocketClaw.xcodeproj
├── scripts/
│   ├── build-macos.sh    # 一键构建 macOS Release .app / .dmg / .zip
│   └── build-ios.sh      # 一键构建通用 iOS/iPadOS Release .ipa（支持直装真机）
├── qa/                   # 头部追踪、概率、落点、几何、操控与全流程回归测试
├── art/                  # 离线渲染图卡、音轨与模型预处理脚本
├── android/              # 历史 Android WebView 壳工程
└── bundle.mjs            # esbuild 离线单文件/拆分资源打包脚本
```

---

## 从源码构建

### 环境要求

- **Node.js** 18+（建议 22/24）
- **Xcode** 15+（用于构建 macOS 与 iOS / iPadOS 版本）

安装前端构建依赖：

```bash
npm ci
```

### 1. 构建 macOS 版本（`.app` / `.dmg` / `.zip`）

```bash
npm run build:mac
# 产物输出到 dist/PocketClaw-macOS-v2.12.0.dmg 与 dist/PocketClaw-macOS-v2.12.0.zip
```

或直接用 Xcode 打开 `macOS/PocketClawMac.xcodeproj`，选择 `PocketClawMac` Scheme 点击 Run。

### 2. 构建 iOS / iPadOS 通用版本（`.ipa` 或真机安装）

```bash
# 仅构建通用 .ipa（如需指定自己的 Apple 开发者团队，可传入 DEVELOPMENT_TEAM=你的TeamID）
npm run build:ios

# 构建并覆盖安装到已连接的 iPhone / iPad（UDID 可通过 xcrun devicectl list devices 查看）
sh scripts/build-ios.sh <DEVICE_UDID>
```

或直接用 Xcode 打开 `iPad/PocketClaw.xcodeproj`，在 **Signing & Capabilities** 中选择你的 Apple 个人/团队签名并运行到真机。

### 3. 构建浏览器离线单文件 HTML

```bash
node bundle.mjs dist/toy-claw-park.html
```

---

## 回归测试

```bash
node qa/tracking.mjs     # 裸眼 3D 头部追踪与防抖测试
node qa/chances.mjs      # 抓中概率与抽取边界测试
node qa/landings.mjs     # 滑落弹跳与补货空位布局测试
node qa/toy-motion.mjs   # 玩具材质运动与存档边界测试
```

完整浏览器端到端测试（`qa/mechanics.cjs`、`qa/view-steering.cjs`、`qa/geometry.cjs`）基于 Playwright 运行，可通过 `TOY_CLAW_HTML` 指定待测离线包路径。

---

## 署名与许可说明

- 本项目仅供家庭与个人非商业学习、展示与游玩。
- 内置第三方开源库（Three.js 等）及外部 3D 模型署名（Skye / Bluey / Bingo）均完整保留在应用内「模型署名」页面中。
