# 节奏菜鸡 rythm-rookie

一款运行在浏览器上的音乐节奏游戏，致敬《节奏天国》（不抄袭），整体走扁平 2D、搞怪无厘头路线。ALL BUILD WITH K3。

## 玩法

跟着音乐拍点，用 **空格 / 点击** 完成每个小游戏的节奏挑战。判定宽松，跟着耳朵按就行。

- **咸鱼翻身**（BPM 100）：锅铲按节奏拍过来，拍点瞬间翻身躲开。完美=空中转体，失误=被拍扁贴板
- **拍蒜大师**（BPM 120）：蒜头滚到刀下时拍扁它，从四分音符渐进到八分、切分、尾杀连打；连续漏 3 个会被蒜糊一脸

每关结算给出 S/A/B/C 评级与"菜鸡指数"，最佳评级存在 localStorage。

## 技术栈

- **Vite + TypeScript**，无游戏引擎、无前端框架
- **Canvas2D**：全部画面为代码手绘矢量图形（大色块 + 粗描边 + 高饱和撞色），零图片资源
- **WebAudio**：音乐与音效全部程序化合成（chiptune 鼓/贝斯/方波 lead），零音频素材、零版权风险
- **自研节奏引擎**：以 `AudioContext.currentTime` 为唯一时钟，lookahead 调度音符，谱面事件与判定拍点共用同一张节拍网格，音画严格同步；判定窗 perfect ±80ms / good ±150ms，并扣除扬声器输出延迟校准

## 本地运行

```sh
npm install
npm run dev    # http://localhost:5173
```

构建：`npm run build`（产物在 `dist/`，纯静态可任意托管）。

冒烟测试（Playwright 全流程截图 + 报错收集）：

```sh
node scripts/smoke.mjs   # 需要 dev server 已启动，截图输出到 shots/
```

## 项目结构

```
src/
├── core/        # 节奏内核：conductor(时钟调度) / sequencer(合成乐器) / judge(判定) / sfx / input / scene / tween
├── render/      # 舞台(DPR 适配) 与扁平绘制库(咸鱼、锅铲、菜刀、蒜…)
├── songs/       # 原创谱面 + 判定拍点表
├── games/       # 小游戏基类 + 咸鱼翻身 / 拍蒜大师
└── scenes/      # 标题 / 选关 / 结算
```
