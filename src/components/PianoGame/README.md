# Piano Game Component

这是一个交互式钢琴游戏组件，具有以下特点：

## 功能特性

- 🎹 完整的钢琴键盘界面
- 🎵 真实的钢琴音效
- 🎮 两种游戏模式：
  - 练习模式：自由演奏
  - 挑战模式：记忆并重复音符序列
- ⌨️ 支持键盘控制
- 🎯 计分系统
- ✨ 流畅的动画效果

## 使用方法

```tsx
import { PianoGame } from './PianoGame';

function App() {
  return (
    <div>
      <PianoGame className="my-8" />
    </div>
  );
}
```

## 键盘映射

钢琴键盘映射到以下键位：

- 白键：A S D F G H J
- 黑键：W E T Y U

## 依赖

- React
- Framer Motion
- Tailwind CSS
- clsx
- tailwind-merge

## 安装依赖

```bash
npm install framer-motion clsx tailwind-merge
```

## 自定义样式

组件使用 Tailwind CSS 进行样式设置，可以通过 className 属性进行自定义：

```tsx
<PianoGame className="bg-gray-100 rounded-lg shadow-xl" />
```
