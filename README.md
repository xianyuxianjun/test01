# 好莱坞电影数据可视化大屏项目文档

## 1. 项目概述

本项目是一个基于 Web 技术的好莱坞电影数据可视化大屏应用。它旨在通过多种交互式图表，展示和分析2007年至2011年期间好莱坞电影的商业数据，包括票房、预算、盈利能力、电影类型分布、制片厂表现以及通过主成分分析（PCA）探索数据间的深层关系。

## 2. 项目结构

```
.
├── README.md                 # 项目文档 (本文档)
├── index.html                # 项目主页面，承载所有可视化图表
├── css/
│   └── style.css             # 全局样式表，定义大屏布局和元素外观
├── js/
│   ├── main.js               # 主要 JavaScript 文件，负责数据加载、处理和图表生成逻辑
│   ├── pca.js                # PCA (主成分分析) 算法的实现
│   └── echarts.min.js        # ECharts 图表库
├── data/                     # 存放原始数据文件
│   ├── _Most Profitable Hollywood Stories - US 2011.xlsx
│   ├── _Most Profitable Hollywood Stories - US 2010.xlsx
│   ├── _Most_Profitable_Hollywood_Stories_US_2009.xlsx
│   ├── _Most_Profitable_Hollywood_Stories_US_2008.xlsx
│   └── _Most_Profitable_Hollywood_Stories_US_2007.xlsx
└── (其他可能存在的配置文件或资源文件)
```

## 3. 技术栈

*   **前端框架**: 无特定框架，主要使用原生 HTML, CSS, JavaScript
*   **可视化库**:
    *   [ECharts](https://echarts.apache.org/): 用于生成大部分交互式图表。
    *   [D3.js](https://d3js.org/) (在 `main.js` 中有部分图表使用了 D3.js): 用于数据驱动的文档操作，辅助图表生成。
*   **数据处理**:
    *   [SheetJS (xlsx.full.min.js)](https://sheetjs.com/): 用于读取和解析 Excel (.xlsx) 数据文件。
    *   自定义 JavaScript 函数进行数据清洗、转换和聚合。
*   **核心算法**:
    *   PCA (主成分分析): 在 `js/pca.js` 中实现，用于数据降维和特征提取。

## 4. 数据来源

*   数据主要来源于 `data/` 目录下的 Excel 文件。这些文件包含了2007年至2011年好莱坞电影的各项指标，例如：
    *   电影名称 (Film)
    *   制片厂 (Lead Studio)
    *   烂番茄评分 (Rotten Tomatoes %)*
    *   观众评分 (Audience score %)*
    *   电影类型 (Genre)
    *   预算 (Budget (million $))
    *   国内票房 (Domestic Gross (million $))
    *   国外票房 (Foreign Gross (million $))
    *   全球总票房 (Worldwide Gross (million $))
    *   盈利能力 (Profitability)
    *   开画周末票房 (Opening Weekend)
    *   *注：部分数据字段在代码中被使用和处理，具体字段依据 `main.js` 中的数据加载逻辑。*

*   数据周期: 2007-2011年。
*   数据在 `js/main.js` 中被加载、解析，并进行初步处理（如提取年份、转换票房数据单位等）。

## 5. 主要功能

`index.html` 页面展示了一个包含多个卡片式图表的数据大屏，主要的可视化图表包括：

1.  **国内票房与国外票房对比 (柱状图)**:
    *   展示不同年份电影的国内票房和国外票房的对比情况。
    *   通过堆叠柱状图清晰显示各项票房贡献。
    *   提供 tooltip 显示具体电影的票房数据。

2.  **预算 vs. 票房收入 (散点图)**:
    *   探索电影预算与总票房收入（国内+国外）之间的关系。
    *   每个点代表一部电影。

3.  **烂番茄评分 vs. 盈利能力 (散点图)**:
    *   分析电影的烂番茄评分与其市场盈利能力之间的潜在关联。

4.  **不同类型电影数量的占比 (饼图)**:
    *   展示在选定年份（或总体）中，不同电影类型的数量占比情况。

5.  **年度盈利能力 (折线图/散点图)**:
    *   展示2007年至2011年电影的平均盈利能力趋势。
    *   同时以散点形式标出每年盈利能力最高和最低的电影。

6.  **制片厂盈利能力 (雷达图)**:
    *   对比顶尖制片厂在多个维度上的表现，包括平均盈利能力、最高盈利能力、平均烂番茄评分和预算控制能力。
    *   数据经过归一化处理以便于比较。

7.  **电影数据PCA分析 (散点图)**:
    *   使用PCA对电影的多个数值特征（如预算、票房、盈利能力、评分）进行降维。
    *   在二维散点图上展示降维后的主成分1和主成分2，并根据电影年份进行着色，有助于发现数据中的模式或聚类。

**其他页面功能**:

*   **实时时间显示**: 页面头部显示当前时间。
*   **数据概览**: 页面头部显示数据周期、电影总数和最后更新日期。
*   **响应式布局**: 图表和页面元素会根据窗口大小进行调整。

## 6. 运行方式

1.  确保您的计算机上有一个现代的网页浏览器 (如 Chrome, Firefox, Edge, Safari)。
2.  将整个项目文件夹下载或克隆到本地。
3.  直接用浏览器打开根目录下的 `index.html` 文件即可查看数据可视化大屏。

    *注意: 由于项目使用了 `require('xlsx')` 这种 Node.js 风格的模块导入方式，但在浏览器中通过 `<script src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script>` 引入了 `xlsx` 库，因此直接在浏览器中打开 `index.html` 时，`main.js` 中的 `const XLSX = require('xlsx');` 可能会导致错误。实际在浏览器环境中，`XLSX` 应该是全局可用的。如果遇到问题，可以尝试移除或注释掉 `main.js` 中 `const XLSX = require('xlsx');` 这一行，因为 `index.html` 已经通过 script 标签引入了 `xlsx`。*

---

本文档由 AI 编程助手生成。 