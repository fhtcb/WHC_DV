# 世界遗产数据可视化项目

本项目是一个基于 Vue 3 + Element Plus 的世界遗产数据可视化分析平台，旨在通过多维度交互式图表和组件，帮助用户探索和分析全球世界遗产的分布、类别、濒危状态等信息。

## 项目特色

- **多组件联动交互**：主图、地区分布、类别关系、时间轴、详情面板等多个可视化组件，支持筛选条件的全局联动。
- **交互丰富**：支持点击、筛选、切换模式（如濒危/类别）、时间区间选择等多种交互方式。
- **暗黑主题**：整体采用暗色风格，视觉效果现代且适合长时间数据分析。
- **响应式布局**：采用 CSS Grid 和 Element Plus 卡片容器，适配不同分辨率。

## 主要功能模块

- **主图（MainModule）**：3D 地球可视化，点位展示世界遗产分布，支持按类别/濒危状态切换点颜色，点击点可查看简介。
- **地区分布（RegionBar）**：各大洲遗产数量分布柱状图，支持与主图联动筛选。
- **类别关系（RelationGraph）**：遗产类别间的关系网络图，展示类别共现关系。
- **时间轴（TimeAxis）**：遗产入选年份分布折线图，支持时间区间筛选。
- **详情面板（Discription）**：展示当前选中遗产的详细信息，包括简介、类别、国家等。
- **濒危切换按钮（MainModule_DangerViewButton）**：一键切换主图点位的颜色模式（类别/濒危）。

## 使用方法

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/WHC_DV.git
cd WHC_DV
```
### 2. 安装依赖

```bash
npm install
```
### 3. 运行项目

```bash
npm run dev
``` 
### 4. 在浏览器中访问

打开浏览器，访问 `http://localhost:xxxx`（端口号以实际为准）。


## 数据说明

 - 数据来源于[UNESCO World Heritage Convention](https://whc.unesco.org/)。数据文件位于 public/data/data.json，包含世界遗产的基本信息、地理坐标、类别、濒危状态等字段。可根据实际需求扩展数据字段或替换数据源。

## 组件联动说明

- 所有筛选条件（如地区、类别、时间区间、濒危状态等）通过 `filter` 对象在各组件间传递，实现全局联动。
- 点击主图、地区图、类别图等均可触发筛选，详情面板实时展示当前选中遗产的详细信息。

## 技术栈

- [Vue 3](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [ECharts](https://echarts.apache.org/)
- [echarts-gl](https://github.com/ecomfe/echarts-gl)（3D地球可视化）
