---
name: "口袋抓娃乐园"
description: "横屏七主题抓娃娃机、取物与玩具收藏"
colors:
  card-ivory: "#fff9e9"
  card-ink: "#263f40"
  grab-coral: "#d9604d"
  stick-amber: "#e69b29"
  dialog-green: "#307e72"
  marker-teal: "#257d91"
  shelf-teal: "#236e70"
  shelf-wood: "#b17d50"
  park-cream: "#fff4dd"
typography:
  display:
    fontFamily: "system-ui, \"PingFang SC\", \"Microsoft YaHei UI\", \"Noto Sans CJK SC\", sans-serif"
    fontSize: "clamp(24px,5.4dvh,58px)"
    fontWeight: 900
    lineHeight: 1.13
    letterSpacing: ".035em"
  title:
    fontSize: "clamp(13px,min(2.95dvh,2.05vw),26px)"
    fontWeight: 850
    lineHeight: 1.24
  grab:
    fontSize: "clamp(20px,4.4dvh,42px)"
    fontWeight: 850
rounded:
  card: "18px"
  brand: "24%"
  grab: "100px"
  dialog: "27px"
  room: "22px"
  dialog-button: "14px"
components:
  park-header:
    backgroundColor: "{colors.park-cream}"
    typography: "{typography.display}"
  shelf-open:
    backgroundColor: "{colors.shelf-teal}"
    textColor: "#fff6dc"
    rounded: "{rounded.card}"
    padding: ".50em .88em"
  stage-card:
    backgroundColor: "{colors.card-ivory}"
    textColor: "{colors.card-ink}"
    rounded: "{rounded.card}"
    padding: "clamp(3px,.55dvh,6px)"
  grab:
    typography: "{typography.grab}"
    rounded: "{rounded.grab}"
    height: "clamp(44px,8.7dvh,86px)"
  round-score:
    backgroundColor: "#28474d"
    textColor: "#fff6d7"
    rounded: "0 0 12px 12px"
    padding: "2px .72em .16em"
  prize-bin:
    rounded: "6px 6px 9px 9px"
    height: "clamp(39px,7.6dvh,82px)"
  adjacent-bay:
    textColor: "#fffaf0"
  view-tools:
    backgroundColor: "#fffaf0"
    rounded: "16px"
    padding: "6px"
  aim-guide:
    rounded: "14px"
  camera-tracking:
    rounded: "14px"
  credits-link:
    textColor: "#44594f"
  dialog-primary:
    backgroundColor: "{colors.dialog-green}"
    rounded: "{rounded.dialog-button}"
    padding: "12px 16px"
  toy-dock:
    rounded: "15px"
    width: "27%"
    height: "75%"
---

# 口袋抓娃乐园

## Overview

**从机柜抓到玩具，再亲手摆上架**

选关页像一排有篷顶的玩具摊。孩子从七张大图选机柜，也可以直接打开右上角的“我的玩具架”。每台机柜有自己的抓爪、背板和库存，抓到的玩具从左前方取物口领取。

- 横屏按四张、三张排关卡，第二排居中。
- 七柜首尾相接，雪地玩偶屋左邻星空基地，右邻玩具车小镇。
- 收藏入口始终在选关页，机台里的视角辅助收在同一菜单。

## Colors

原图里的红白顶篷延续为选关页顶边的珊瑚红与奶油色条纹。收藏主入口用深青底和金星，带六枚小星的关卡卡片用象牙底和木色下缘。机柜保留主题色饰边、琥珀摇杆和珊瑚抓键。已领玩具放在浅木色搁板上。

## Typography

“口袋抓娃乐园”与原图徽标并排，是选关页的主标题。卡片用粗体地名，六枚星和本关进度在下行。收藏详情先标明主题，再以玩具名作标题。使用设备的中文无衬线字体，操作名如“点亮警灯”“停进消防站”直接写出动作。

## Layout

按横向平板构图。选关首排依次是雪地玩偶屋、玩具车小镇、汪汪队总部、布鲁伊的后院，第二排是奇妙花房、珊瑚海湾、星空基地。右上常驻“我的玩具架”，有待领玩具时附数量。底部并列家长设置、声音和模型署名。较矮的横屏收紧页头、卡片间距与操作台。

机台顶部中央显示本轮计分，左侧有任务图卡，右上显示选关、声音和视角。点“视角”展开瞄准圈、受支持的探头和回正／校准。落奖口位于主柜地面左前方，底部柜面有对应取物口、摇杆、状态窗和抓键。收藏弹层可在机柜上方或选关页内打开，沿用原页面位置。

## Elevation & Depth

**The Fixed Frame Rule.** 停靠后探头或拖动画面时，中央柜两根前柱留在原位，后柱、玩具和邻柜按深度产生视差。换柜时，玻璃前框与下方柜面一起横向经过。

**The Contact Shadow Rule.** 在玩具的轮胎、脚掌或底座下保留柔和投影，让孩子看清玩具接触地面的位置。

深青色遮罩调暗后面的机柜或选关页。收藏弹层用厚木色下缘压住画面，消防车详情左侧保留立体车身的接触阴影，右侧显示单独的消防站门。

## Shapes

用户原图作为完整的方形徽标显示，外框用圆角。主题卡、收藏架和设置面板采用不同尺度的圆角矩形。圆盘摇杆和长圆抓键保留机柜的实物造型。

## Components

- **七台机柜** 点主题卡可以直达机柜，点左右邻柜或名称可以横向换柜。途中暂停抓取，停靠后恢复操作。
- **抓取与通关** 顶部金星显示本轮件数，目标为六件。成功后抓爪把玩具送到左前方落奖口，柜面“领玩具”可进入详情。剩余两件或更少可补货。通关弹层可去下一关、重玩、返回选关，有待领奖品时可打开取物口。
- **视角辅助** 瞄准圈默认开启，七关共用并记住选择。关闭会隐藏地面弧线，抓取仍按爪子接触玩具的位置判定。探头根据双眼中点调整左右视差。面朝屏幕稳定停在新的远近位置、眼距持续偏离校准值后才调整前后距离。短时跟丢人脸时停在当前视角，重新识别后继续。
- **我的玩具架** 按七个主题筛选，分取物口中的待领玩具与木架上的已领玩具。“任务图卡”与“玩具架”并列。按“听一听”可朗读任务内容。已收藏的玩具可以再次查看，有多件时可调整左右位置。
- **旋转与入库** 在模型上轻点可玩一玩，直接滑动可转动观察。领取待领玩具时，按住左下“拖我入库”即可提起，也可以在模型上原地长按 360 毫秒。拖到右侧主题门内松手，或点门和下方主按钮完成摆放。进入门的范围会显示开门图、浅绿底和描边。归位后的“转一转”和玩具动作键仍可使用。
- **主题门** 一套门图按七个主题排列，每扇门都有关、开两种状态。任务送达点依次为雪地小屋、消防站、巡逻岗、野餐垫、温室、珊瑚礁、发射台。标签会随普通收纳或任务送达而变化。
- **减少动态效果** 系统选择减少动态效果时，换柜直接到位，取物口停止抖动和闪光，成功摆放直接回到收藏架。关卡进度和领奖结果照常显示。
- **模型署名** 选关页底部可打开署名弹层，表中记录三项外部来源与模型调整。

| 公仔 | 游戏内署名 | 游戏版处理与来源 |
| --- | --- | --- |
| 天天 | CappyAdams（YuriMayori），CC BY-NC 4.0 | 保留制服，烘焙毛色并简化网格。[Skye](https://cappyadams.itch.io/skye-paw-patrol) |
| 布鲁伊 | Arvin Subramanian，项目仓库采用 MIT 许可 | 简化并调整模型。[Bluey’s Backyard Games](https://github.com/ArvinAIEngineer/Bluey) |
| 宾果 | DonaldDucc，CC BY 4.0 | 调整姿态与材质。[Bingo](https://sketchfab.com/3d-models/bingo-1bea574935ff4073b031e49c6c3dad93) |

## Do's and Don'ts

- Do 使用用户提供的抓娃娃机原图，保留红白顶篷、抓爪和柜中的玩具。
- Do 在取物详情同时提供拖入目的地和点按摆放两种操作。
- Do 保留选关页底部的模型署名入口。
- Don't 把署名正文叠到抓取区。
