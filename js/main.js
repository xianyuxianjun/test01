// 全局变量
let allMovies = []; // 存储所有电影数据
let charts = {}; // 存储所有图表实例

// 数据加载和处理
async function loadData() {
  try {
    console.log('开始加载数据...');
    // 如果数据已加载，不再重复加载
    if (allMovies.length > 0) {
      console.log('数据已加载，电影总数:', allMovies.length);
      return allMovies;
    }
    
    // 加载所有年份的数据
    const years = [2007, 2008, 2009, 2010, 2011];
    let loadedCount = 0;
    
    for (const year of years) {
      try {
        let filename;
        if (year <= 2008) {
          filename = `data/_Most_Profitable_Hollywood_Stories_US_${year}.xlsx`;
        } else if (year === 2009) {
          filename = `data/_Most_Profitable_Hollywood_Stories_US_${year}.xlsx`;
        } else {
          filename = `data/_Most Profitable Hollywood Stories - US ${year}.xlsx`;
        }
        
        console.log(`尝试加载数据文件: ${filename}`);
        const response = await fetch(filename);
        
        if (!response.ok) {
          throw new Error(`加载文件 ${filename} 失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.arrayBuffer();
        if (!data || data.byteLength === 0) {
          throw new Error(`文件 ${filename} 内容为空`);
        }
        
        console.log(`成功获取文件: ${filename}, 大小: ${data.byteLength} 字节`);
        
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error(`文件 ${filename} 中没有工作表`);
        }
        
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log(`${year}年数据解析完成，共 ${jsonData.length} 条记录`);
        
        // 数据验证
        if (!jsonData || jsonData.length === 0) {
          throw new Error(`${year}年没有有效数据记录`);
        }
        
        // 添加年份字段
        const moviesWithYear = jsonData.map(movie => ({
          ...movie,
          Year: year,
          // 确保所有数值字段都是数字类型
          'Profitability': parseFloat(movie['Profitability']) || 0,
          'Budget (million $)': parseFloat(movie['Budget']) || 0,
          'Domestic Gross (million $)': parseFloat(movie['Domestic Gross']) || 0,
          'Foreign Gross (million $)': parseFloat(movie['Foreign Gross']) || 0,
          'Worldwide Gross (million $)': parseFloat(movie['Worldwide Gross']) || 0,
          'Rotten Tomatoes %': parseFloat(movie['Rotten Tomatoes']) || 0,
          'Audience score %': parseFloat(movie['Audience Score']) || 0,
        }));
        
        // 调试输出第一条记录
        if (moviesWithYear.length > 0) {
          console.log(`${year}年第一条数据示例:`, JSON.stringify(moviesWithYear[0]));
        }
        
        allMovies = [...allMovies, ...moviesWithYear];
        loadedCount++;
        
      } catch (yearError) {
        console.error(`加载${year}年数据时出错:`, yearError);
      }
    }
    
    if (loadedCount === 0) {
      throw new Error('没有成功加载任何年份的数据');
    }
    
    console.log('数据加载完成，电影总数:', allMovies.length);
    
    // 数据完整性验证
    if (allMovies.length === 0) {
      throw new Error('加载的电影数据为空');
    }
    
    // 检查必要的字段
    const sampleMovie = allMovies[0];
    const requiredFields = ['Film', 'Year', 'Budget (million $)', 'Domestic Gross (million $)', 'Foreign Gross (million $)'];
    const missingFields = requiredFields.filter(field => !(field in sampleMovie));
    
    if (missingFields.length > 0) {
      console.warn('数据中缺少必要字段:', missingFields.join(', '));
    }
    
    return allMovies;
  } catch (error) {
    console.error('加载数据时出错:', error);
    // 返回空数组，表示加载失败
    return [];
  }
}

// 获取不同年份的电影数据
function getMoviesByYear(year) {
  if (year === 'all') {
    return allMovies;
  }
  return allMovies.filter(movie => movie.Year === year);
}

// 获取不同类型的电影数据
function getMoviesByGenre(genre) {
  if (genre === 'all') {
    return allMovies;
  }
  return allMovies.filter(movie => movie.Genre === genre);
}

// 获取不同制片厂的电影数据
function getMoviesByStudio(studio) {
  if (studio === 'all') {
    return allMovies;
  }
  return allMovies.filter(movie => movie['Lead Studio'] === studio);
}

// 获取所有唯一的电影类型
function getAllGenres() {
  const genreSet = new Set(allMovies.map(movie => movie.Genre));
  return Array.from(genreSet);
}

// 获取所有唯一的制片厂
function getAllStudios() {
  const studioSet = new Set(allMovies.map(movie => movie['Lead Studio']));
  return Array.from(studioSet);
}

// 数据统计与计算
function calculateStatistics(movies) {
  const totalBudget = movies.reduce((sum, movie) => sum + (movie['Budget (million $)'] || 0), 0);
  const totalDomesticGross = movies.reduce((sum, movie) => sum + (movie['Domestic Gross (million $)'] || 0), 0);
  const totalForeignGross = movies.reduce((sum, movie) => sum + (movie['Foreign Gross (million $)'] || 0), 0);
  const totalWorldwideGross = movies.reduce((sum, movie) => sum + (movie['Worldwide Gross (million $)'] || 0), 0);
  
  const averageProfitability = movies.reduce((sum, movie) => sum + (movie['Profitability'] || 0), 0) / movies.length;
  const averageRottenTomatoes = movies.reduce((sum, movie) => sum + (movie['Rotten Tomatoes %'] || 0), 0) / movies.length;
  
  return {
    totalBudget,
    totalDomesticGross,
    totalForeignGross,
    totalWorldwideGross,
    averageProfitability,
    averageRottenTomatoes
  };
}

// 创建年份选择器
function createYearSelector() {
  const years = [2007, 2008, 2009, 2010, 2011];
  const selectors = document.querySelectorAll('.year-selector');
  
  selectors.forEach(selector => {
    // 添加"所有年份"选项
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = '所有年份';
    selector.appendChild(allOption);
    
    // 添加各年份选项
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = `${year}年`;
      selector.appendChild(option);
    });
    
    // 添加change事件监听器
    selector.addEventListener('change', function() {
      const targetChart = this.getAttribute('data-target');
      const selectedYear = this.value;
      
      if (targetChart === 'all') {
        // 更新所有图表
        updateAllCharts(selectedYear);
      } else {
        // 更新特定图表
        updateChart(targetChart, selectedYear);
      }
    });
  });
}

// 更新所有图表
function updateAllCharts(year) {
  updateDomesticVsForeignBarChart(year);
  updateBudgetVsGrossScatter(year);
  updateRottenTomatoesVsProfitScatter(year);
  updateGenrePieChart(year);
  updateYearlyProfitLine(year);
  updateStudioRadarChart(year);
  updatePCAScatter(year);
}

// 创建所有可视化图表
function createVisualizations() {
  // 确保数据已加载
  if (allMovies.length === 0) {
    loadData().then(() => {
      // 创建年份选择器
      createYearSelector();
      
      // 创建各个图表
      createDomesticVsForeignBarChart('all');
      createBudgetVsGrossScatter('all');
      createRottenTomatoesVsProfitScatter('all');
      createGenrePieChart('all');
      createYearlyProfitLine();
      createStudioRadarChart('all');
      createPCAScatter('all');
    });
  } else {
    // 如果数据已加载，直接创建图表
    createYearSelector();
    createDomesticVsForeignBarChart('all');
    createBudgetVsGrossScatter('all');
    createRottenTomatoesVsProfitScatter('all');
    createGenrePieChart('all');
    createYearlyProfitLine();
    createStudioRadarChart('all');
    createPCAScatter('all');
  }
}

// 1. 国内票房与国外票房对比柱状图
function createDomesticVsForeignBarChart(year) {
  const chartDom = document.getElementById('domesticVsForeignBarChart');
  if (!chartDom) {
    console.error('找不到图表DOM元素：domesticVsForeignBarChart');
    return;
  }
  
  console.log('初始化国内票房与国外票房对比图表...');
  try {
    charts.domesticVsForeign = echarts.init(chartDom);
    console.log('图表初始化成功，DOM尺寸:', chartDom.offsetWidth, 'x', chartDom.offsetHeight);
    
    // 先设置一个简单的选项确认图表是否工作
    charts.domesticVsForeign.setOption({
      title: {
        text: '正在加载数据...',
        left: 'center'
      },
      series: []
    });
    
    // 添加年份选择器
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'selector-container';
    selectorContainer.innerHTML = `
      <label for="yearSelectorBarChart">选择年份: </label>
      <select id="yearSelectorBarChart" class="year-selector" data-target="domesticVsForeign">
        <!-- 选项将由createYearSelector函数填充 -->
      </select>
    `;
    chartDom.parentNode.insertBefore(selectorContainer, chartDom);
    
    // 更新图表数据
    updateDomesticVsForeignBarChart(year);
  } catch (error) {
    console.error('初始化国内票房与国外票房对比图表时出错:', error);
  }
}

function updateDomesticVsForeignBarChart(year) {
  try {
    // 检查图表实例是否存在
    if (!charts.domesticVsForeign) {
      console.error('国内票房与国外票房对比图表实例不存在');
      return;
    }
    
    // 获取数据
    const movies = getMoviesByYear(year);
    
    if (!movies || movies.length === 0) {
      console.error('没有找到符合条件的电影数据');
      // 显示空数据提示
      charts.domesticVsForeign.setOption({
        title: {
          text: '没有可用的电影数据',
          left: 'center'
        },
        series: []
      });
      return;
    }
    
    console.log(`处理${year === 'all' ? '所有年份' : year + '年'}的${movies.length}部电影数据`);
    
    // 按照国内票房排序前20部电影
    const topMovies = [...movies]
      .filter(movie => 
        !isNaN(movie['Domestic Gross (million $)']) && 
        !isNaN(movie['Foreign Gross (million $)']))
      .sort((a, b) => (b['Domestic Gross (million $)'] + b['Foreign Gross (million $)']) 
            - (a['Domestic Gross (million $)'] + a['Foreign Gross (million $)']))
      .slice(0, 20);
    
    if (topMovies.length === 0) {
      console.error('筛选后没有有效的电影数据');
      charts.domesticVsForeign.setOption({
        title: {
          text: '没有有效的电影数据',
          left: 'center'
        },
        series: []
      });
      return;
    }
    
    console.log('处理后的Top电影数据:', topMovies.length, '部');
    // 打印第一条数据用于调试
    console.log('第一部电影数据示例:', JSON.stringify(topMovies[0]));
    
    const filmNames = topMovies.map(movie => movie.Film);
    const domesticGross = topMovies.map(movie => movie['Domestic Gross (million $)']);
    const foreignGross = topMovies.map(movie => movie['Foreign Gross (million $)']);
    const years = topMovies.map(movie => movie.Year);
    
    console.log('电影名称数组:', filmNames);
    console.log('国内票房数组:', domesticGross);
    console.log('国外票房数组:', foreignGross);
    
    const option = {
      title: {
        text: year === 'all' ? '2007-2011年电影国内外票房对比' : `${year}年电影国内外票房对比`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          const movieIndex = params[0].dataIndex;
          const movie = topMovies[movieIndex];
          return `<div>
            <strong>${movie.Film}</strong> (${movie.Year})<br/>
            国内票房: ${movie['Domestic Gross (million $)']} 百万美元<br/>
            国外票房: ${movie['Foreign Gross (million $)']} 百万美元<br/>
            总票房: ${movie['Worldwide Gross (million $)']} 百万美元<br/>
            制片厂: ${movie['Lead Studio']}<br/>
            类型: ${movie.Genre}
          </div>`;
        }
      },
      legend: {
        data: ['国内票房 (百万美元)', '国外票房 (百万美元)'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: filmNames,
        axisLabel: {
          interval: 0,
          rotate: 45,
          textStyle: {
            fontSize: 10
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '票房 (百万美元)'
      },
      series: [
        {
          name: '国内票房 (百万美元)',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: domesticGross,
          itemStyle: {
            color: '#5470c6'
          }
        },
        {
          name: '国外票房 (百万美元)',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: foreignGross,
          itemStyle: {
            color: '#91cc75'
          }
        }
      ],
      dataZoom: [
        {
          type: 'slider',
          show: true,
          start: 0,
          end: 100,
          bottom: 0
        }
      ]
    };
    
    console.log('为图表设置选项...');
    charts.domesticVsForeign.setOption(option);
    console.log('国内票房与国外票房对比图表已更新');
    
    // 强制重新渲染图表
    setTimeout(() => {
      if (charts.domesticVsForeign) {
        charts.domesticVsForeign.resize();
        console.log('图表大小已重置');
      }
    }, 100);
  } catch (error) {
    console.error('更新国内票房与国外票房对比图表时出错:', error);
  }
}

// 2.1 预算 vs. 票房收入散点图
function createBudgetVsGrossScatter(year) {
  const chartDom = document.getElementById('ScatterPlot');
  charts.budgetVsGross = echarts.init(chartDom);
  updateBudgetVsGrossScatter(year);
  
  // 添加年份选择器
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'selector-container';
  selectorContainer.innerHTML = `
    <label for="yearSelectorScatter">选择年份: </label>
    <select id="yearSelectorScatter" class="year-selector" data-target="budgetVsGross">
      <!-- 选项将由createYearSelector函数填充 -->
    </select>
  `;
  chartDom.parentNode.insertBefore(selectorContainer, chartDom);
}

function updateBudgetVsGrossScatter(year) {
  const movies = getMoviesByYear(year);
  
  const data = movies.map(movie => {
    const budget = movie['Budget (million $)'];
    const totalGross = movie['Domestic Gross (million $)'] + movie['Foreign Gross (million $)'];
    return [budget, totalGross, movie.Film, movie.Year, movie.Genre];
  });
  
  // 计算回归线
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  const n = data.length;
  
  data.forEach(point => {
    sumX += point[0];
    sumY += point[1];
    sumXY += point[0] * point[1];
    sumX2 += point[0] * point[0];
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // 生成回归线数据点
  const regressionData = [];
  let minX = Infinity, maxX = -Infinity;
  
  data.forEach(point => {
    minX = Math.min(minX, point[0]);
    maxX = Math.max(maxX, point[0]);
  });
  
  regressionData.push([minX, minX * slope + intercept]);
  regressionData.push([maxX, maxX * slope + intercept]);
  
  const option = {
    title: {
      text: year === 'all' ? '预算 vs. 总票房收入 (2007-2011)' : `预算 vs. 总票房收入 (${year})`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        if (params.seriesIndex === 1) return; // 忽略回归线的tooltip
        
        const [budget, gross, film, year, genre] = params.data;
        return `<div>
          <strong>${film}</strong> (${year})<br/>
          预算: ${budget} 百万美元<br/>
          总票房: ${gross.toFixed(2)} 百万美元<br/>
          类型: ${genre}
        </div>`;
      }
    },
    legend: {
      data: ['电影', '回归线'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '预算 (百万美元)',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: '总票房 (百万美元)',
      nameLocation: 'middle',
      nameGap: 30
    },
    series: [
      {
        name: '电影',
        type: 'scatter',
        symbolSize: 10,
        data: data,
        itemStyle: {
          color: function(params) {
            // 根据电影类型或年份设置不同颜色
            const genres = Array.from(new Set(movies.map(m => m.Genre)));
            const colorMap = [
              '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
              '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#B27200'
            ];
            const genreIndex = genres.indexOf(params.data[4]);
            return colorMap[genreIndex % colorMap.length];
          }
        }
      },
      {
        name: '回归线',
        type: 'line',
        showSymbol: false,
        data: regressionData,
        lineStyle: {
          color: '#ff7f0e',
          width: 2,
          type: 'dashed'
        }
      }
    ]
  };
  
  charts.budgetVsGross.setOption(option);
}

// 2.2 烂番茄评分 vs. 盈利能力散点图
function createRottenTomatoesVsProfitScatter(year) {
  const chartDom = document.getElementById('ScatterPlotRTvsProfit');
  charts.rtVsProfit = echarts.init(chartDom);
  updateRottenTomatoesVsProfitScatter(year);
  
  // 添加年份选择器
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'selector-container';
  selectorContainer.innerHTML = `
    <label for="yearSelectorRTvsProfit">选择年份: </label>
    <select id="yearSelectorRTvsProfit" class="year-selector" data-target="rtVsProfit">
      <!-- 选项将由createYearSelector函数填充 -->
    </select>
  `;
  chartDom.parentNode.insertBefore(selectorContainer, chartDom);
}

function updateRottenTomatoesVsProfitScatter(year) {
  const movies = getMoviesByYear(year);
  
  const data = movies.map(movie => {
    return [
      movie['Rotten Tomatoes %'], 
      movie['Profitability'], 
      movie.Film, 
      movie.Year, 
      movie.Genre
    ];
  });
  
  // 计算回归线
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  const n = data.length;
  
  data.forEach(point => {
    sumX += point[0];
    sumY += point[1];
    sumXY += point[0] * point[1];
    sumX2 += point[0] * point[0];
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // 生成回归线数据点
  const regressionData = [];
  let minX = Infinity, maxX = -Infinity;
  
  data.forEach(point => {
    minX = Math.min(minX, point[0]);
    maxX = Math.max(maxX, point[0]);
  });
  
  regressionData.push([minX, minX * slope + intercept]);
  regressionData.push([maxX, maxX * slope + intercept]);
  
  const option = {
    title: {
      text: year === 'all' ? '烂番茄评分 vs. 盈利能力 (2007-2011)' : `烂番茄评分 vs. 盈利能力 (${year})`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        if (params.seriesIndex === 1) return; // 忽略回归线的tooltip
        
        const [rtScore, profitability, film, year, genre] = params.data;
        return `<div>
          <strong>${film}</strong> (${year})<br/>
          烂番茄评分: ${rtScore}%<br/>
          盈利能力: ${profitability.toFixed(2)}<br/>
          类型: ${genre}
        </div>`;
      }
    },
    legend: {
      data: ['电影', '回归线'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '烂番茄评分 (%)',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: '盈利能力',
      nameLocation: 'middle',
      nameGap: 30
    },
    series: [
      {
        name: '电影',
        type: 'scatter',
        symbolSize: 10,
        data: data,
        itemStyle: {
          color: function(params) {
            // 根据电影类型或年份设置不同颜色
            const genres = Array.from(new Set(movies.map(m => m.Genre)));
            const colorMap = [
              '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
              '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#B27200'
            ];
            const genreIndex = genres.indexOf(params.data[4]);
            return colorMap[genreIndex % colorMap.length];
          }
        }
      },
      {
        name: '回归线',
        type: 'line',
        showSymbol: false,
        data: regressionData,
        lineStyle: {
          color: '#ff7f0e',
          width: 2,
          type: 'dashed'
        }
      }
    ]
  };
  
  charts.rtVsProfit.setOption(option);
}

// 3. 不同类型电影数量占比饼图
function createGenrePieChart(year) {
  const chartDom = document.getElementById('PieChart');
  charts.genrePie = echarts.init(chartDom);
  updateGenrePieChart(year);
  
  // 添加年份选择器
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'selector-container';
  selectorContainer.innerHTML = `
    <label for="yearSelectorPie">选择年份: </label>
    <select id="yearSelectorPie" class="year-selector" data-target="genrePie">
      <!-- 选项将由createYearSelector函数填充 -->
    </select>
  `;
  chartDom.parentNode.insertBefore(selectorContainer, chartDom);
}

function updateGenrePieChart(year) {
  const movies = getMoviesByYear(year);
  
  // 统计不同类型电影的数量
  const genreCounts = {};
  movies.forEach(movie => {
    if (!movie.Genre) return;
    
    const genre = movie.Genre;
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });
  
  // 转换为ECharts饼图需要的数据格式
  const data = Object.entries(genreCounts).map(([genre, count]) => {
    return { value: count, name: genre };
  });
  
  // 按数量排序
  data.sort((a, b) => b.value - a.value);
  
  const option = {
    title: {
      text: year === 'all' ? '电影类型分布 (2007-2011)' : `电影类型分布 (${year})`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      type: 'scroll',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '电影类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  };
  
  charts.genrePie.setOption(option);
}

// 4. 年度盈利能力折线图
function createYearlyProfitLine() {
  const chartDom = document.getElementById('YearlyProfitLine');
  charts.yearlyProfit = echarts.init(chartDom);
  updateYearlyProfitLine('all');
}

function updateYearlyProfitLine(selectedYear) {
  const years = [2007, 2008, 2009, 2010, 2011];
  
  // 计算每年的平均盈利能力和极值
  const yearlyData = years.map(year => {
    const yearMovies = allMovies.filter(movie => movie.Year === year);
    
    const avgProfit = yearMovies.reduce((sum, movie) => sum + movie['Profitability'], 0) / yearMovies.length;
    
    // 找出盈利能力最高和最低的电影
    yearMovies.sort((a, b) => b['Profitability'] - a['Profitability']);
    const highestProfit = yearMovies[0];
    const lowestProfit = yearMovies[yearMovies.length - 1];
    
    return {
      year,
      avgProfit,
      highestProfit,
      lowestProfit
    };
  });
  
  // 如果选择了特定年份，只显示该年份的数据
  let filteredData = yearlyData;
  if (selectedYear !== 'all' && selectedYear !== undefined) {
    filteredData = yearlyData.filter(item => item.year.toString() === selectedYear.toString());
  }
  
  const xAxisData = filteredData.map(item => item.year);
  const avgProfitData = filteredData.map(item => item.avgProfit);
  
  // 最高和最低盈利能力的散点数据
  const highestProfitData = filteredData.map(item => {
    return [
      item.year, 
      item.highestProfit['Profitability'], 
      item.highestProfit.Film
    ];
  });
  
  const lowestProfitData = filteredData.map(item => {
    return [
      item.year, 
      item.lowestProfit['Profitability'], 
      item.lowestProfit.Film
    ];
  });
  
  const option = {
    title: {
      text: '2007-2011年电影盈利能力趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let content = `${params[0].name}年<br/>`;
        
        params.forEach(param => {
          if (param.seriesName === '平均盈利能力') {
            content += `${param.seriesName}: ${param.value.toFixed(2)}<br/>`;
          } else if (param.seriesName === '最高盈利能力' || param.seriesName === '最低盈利能力') {
            content += `${param.seriesName}: ${param.value[1].toFixed(2)}<br/>`;
            content += `电影: ${param.value[2]}<br/>`;
          }
        });
        
        return content;
      }
    },
    legend: {
      data: ['平均盈利能力', '最高盈利能力', '最低盈利能力'],
      top: 30
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      name: '年份',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: '盈利能力',
      nameLocation: 'middle',
      nameGap: 30
    },
    series: [
      {
        name: '平均盈利能力',
        type: 'line',
        data: avgProfitData,
        lineStyle: {
          width: 3,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowBlur: 10,
          shadowOffsetY: 8
        },
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '最高盈利能力',
        type: 'scatter',
        symbolSize: 15,
        data: highestProfitData,
        itemStyle: {
          color: '#91cc75'
        }
      },
      {
        name: '最低盈利能力',
        type: 'scatter',
        symbolSize: 15,
        data: lowestProfitData,
        itemStyle: {
          color: '#ee6666'
        }
      }
    ]
  };
  
  charts.yearlyProfit.setOption(option);
}

// 5. 制片厂盈利能力雷达图
function createStudioRadarChart(year) {
  const chartDom = document.getElementById('StudioRadar');
  charts.studioRadar = echarts.init(chartDom);
  updateStudioRadarChart(year);
  
  // 添加年份选择器
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'selector-container';
  selectorContainer.innerHTML = `
    <label for="yearSelectorRadar">选择年份: </label>
    <select id="yearSelectorRadar" class="year-selector" data-target="studioRadar">
      <!-- 选项将由createYearSelector函数填充 -->
    </select>
  `;
  chartDom.parentNode.insertBefore(selectorContainer, chartDom);
}

function updateStudioRadarChart(year) {
  const movies = getMoviesByYear(year);
  
  // 获取电影数量最多的前5个制片厂
  const studioCounts = {};
  movies.forEach(movie => {
    const studio = movie['Lead Studio'];
    if (!studio) return;
    
    studioCounts[studio] = (studioCounts[studio] || 0) + 1;
  });
  
  const topStudios = Object.entries(studioCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
  
  // 计算每个制片厂的指标
  const studioMetrics = topStudios.map(studio => {
    const studioMovies = movies.filter(movie => movie['Lead Studio'] === studio);
    
    // 平均盈利能力
    const avgProfitability = studioMovies.reduce((sum, movie) => {
      return sum + (movie['Profitability'] || 0);
    }, 0) / studioMovies.length;
    
    // 最高盈利能力
    const maxProfitability = Math.max(...studioMovies.map(movie => movie['Profitability'] || 0));
    
    // 平均烂番茄评分
    const avgRottenTomatoes = studioMovies.reduce((sum, movie) => {
      return sum + (movie['Rotten Tomatoes %'] || 0);
    }, 0) / studioMovies.length;
    
    // 预算控制能力（反比，值越小预算控制能力越强）
    const avgBudgetToGross = studioMovies.reduce((sum, movie) => {
      const budget = movie['Budget (million $)'] || 0;
      const totalGross = (movie['Domestic Gross (million $)'] || 0) + (movie['Foreign Gross (million $)'] || 0);
      return sum + (budget > 0 ? budget / totalGross : 0);
    }, 0) / studioMovies.length;
    
    // 归一化预算控制能力（值越大越好）
    const normalizedBudgetControl = 1 - avgBudgetToGross;
    
    return {
      studio,
      avgProfitability,
      maxProfitability,
      avgRottenTomatoes,
      budgetControl: normalizedBudgetControl
    };
  });
  
  // 将数据归一化到0-100之间，便于在雷达图上展示
  const normalizeValue = (value, min, max) => {
    return ((value - min) / (max - min)) * 100;
  };
  
  const avgProfitValues = studioMetrics.map(item => item.avgProfitability);
  const minAvgProfit = Math.min(...avgProfitValues);
  const maxAvgProfit = Math.max(...avgProfitValues);
  
  const maxProfitValues = studioMetrics.map(item => item.maxProfitability);
  const minMaxProfit = Math.min(...maxProfitValues);
  const maxMaxProfit = Math.max(...maxProfitValues);
  
  const rtValues = studioMetrics.map(item => item.avgRottenTomatoes);
  const minRT = Math.min(...rtValues);
  const maxRT = Math.max(...rtValues);
  
  const budgetValues = studioMetrics.map(item => item.budgetControl);
  const minBudget = Math.min(...budgetValues);
  const maxBudget = Math.max(...budgetValues);
  
  // 创建归一化的指标数据
  const radarData = studioMetrics.map(item => {
    return {
      name: item.studio,
      value: [
        normalizeValue(item.avgProfitability, minAvgProfit, maxAvgProfit),
        normalizeValue(item.maxProfitability, minMaxProfit, maxMaxProfit),
        normalizeValue(item.avgRottenTomatoes, minRT, maxRT),
        normalizeValue(item.budgetControl, minBudget, maxBudget)
      ]
    };
  });
  
  const option = {
    title: {
      text: year === 'all' ? '顶尖制片厂表现对比 (2007-2011)' : `顶尖制片厂表现对比 (${year})`,
      left: 'center'
    },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'middle',
      data: radarData.map(item => item.name)
    },
    radar: {
      indicator: [
        { name: '平均盈利能力', max: 100 },
        { name: '最高盈利能力', max: 100 },
        { name: '烂番茄评分', max: 100 },
        { name: '预算控制能力', max: 100 }
      ],
      center: ['45%', '55%'],
      radius: '65%'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const studio = params.name;
        const studioData = studioMetrics.find(item => item.studio === studio);
        
        return `<div>
          <strong>${studio}</strong><br/>
          平均盈利能力: ${studioData.avgProfitability.toFixed(2)}<br/>
          最高盈利能力: ${studioData.maxProfitability.toFixed(2)}<br/>
          平均烂番茄评分: ${studioData.avgRottenTomatoes.toFixed(2)}%<br/>
          预算控制能力: ${studioData.budgetControl.toFixed(2)}
        </div>`;
      }
    },
    series: [
      {
        name: '制片厂表现',
        type: 'radar',
        data: radarData,
        areaStyle: {}
      }
    ]
  };
  
  charts.studioRadar.setOption(option);
}

// 6. PCA分析和k-means聚类散点图
function createPCAScatter(year) {
  const chartDom = document.getElementById('PCAScatter');
  charts.pcaScatter = echarts.init(chartDom);
  updatePCAScatter(year);
  
  // 添加年份选择器和聚类控制
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'selector-container';
  selectorContainer.innerHTML = `
    <label for="yearSelectorPCA">选择年份: </label>
    <select id="yearSelectorPCA" class="year-selector" data-target="pcaScatter">
      <!-- 选项将由createYearSelector函数填充 -->
    </select>
    
    <label for="clusterNumberControl" style="margin-left: 20px;">聚类数量: </label>
    <input type="range" id="clusterNumberControl" min="2" max="8" value="3" style="width: 100px;">
    <span id="clusterNumberDisplay">3</span>
    
    <button id="applyClusteringButton" style="margin-left: 10px;">应用聚类</button>
  `;
  chartDom.parentNode.insertBefore(selectorContainer, chartDom);
  
  // 为聚类控件添加事件监听器
  document.getElementById('clusterNumberControl').addEventListener('input', function() {
    document.getElementById('clusterNumberDisplay').textContent = this.value;
  });
  
  document.getElementById('applyClusteringButton').addEventListener('click', function() {
    const clusterNumber = parseInt(document.getElementById('clusterNumberControl').value);
    const selectedYear = document.getElementById('yearSelectorPCA').value;
    updatePCAScatter(selectedYear, clusterNumber);
  });
}

function updatePCAScatter(year, clusterCount = 0) {
  const movies = getMoviesByYear(year);
  
  // 准备PCA特征
  const features = [
    'Budget (million $)', 
    'Domestic Gross (million $)', 
    'Foreign Gross (million $)', 
    'Profitability', 
    'Rotten Tomatoes %'
  ];
  
  // 运行PCA算法
  const pcaResult = pca(movies, features);
  
  // 将分析结果与原始电影数据关联
  const scatterData = pcaResult.pcScores.map((score, i) => {
    return {
      pcaX: score[0],
      pcaY: score[1],
      movie: movies[i]
    };
  });
  
  // 如果指定了聚类数量，执行k-means聚类
  let clusterResult = null;
  if (clusterCount > 0) {
    const kmeansData = scatterData.map(item => [item.pcaX, item.pcaY]);
    clusterResult = kMeans(kmeansData, clusterCount);
  }
  
  // 准备散点图数据
  const seriesData = [];
  
  if (clusterResult) {
    // 使用聚类结果
    for (let i = 0; i < clusterCount; i++) {
      const clusterData = [];
      
      for (let j = 0; j < scatterData.length; j++) {
        if (clusterResult.clusters[j] === i) {
          clusterData.push([
            scatterData[j].pcaX,
            scatterData[j].pcaY,
            scatterData[j].movie.Film,
            scatterData[j].movie.Year,
            scatterData[j].movie.Genre
          ]);
        }
      }
      
      seriesData.push({
        name: `聚类 ${i + 1}`,
        type: 'scatter',
        data: clusterData,
        symbolSize: 10
      });
    }
    
    // 添加聚类中心
    const centerData = clusterResult.centroids.map((center, i) => {
      return {
        name: `中心 ${i + 1}`,
        type: 'effectScatter',
        data: [[center[0], center[1], `聚类中心 ${i + 1}`]],
        symbolSize: 20,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke'
        },
        itemStyle: {
          color: '#fff',
          borderColor: '#5873c6',
          borderWidth: 2
        }
      };
    });
    
    seriesData.push(...centerData);
  } else {
    // 不使用聚类，按年份或类型着色
    const data = scatterData.map(item => [
      item.pcaX,
      item.pcaY,
      item.movie.Film,
      item.movie.Year,
      item.movie.Genre
    ]);
    
    seriesData.push({
      name: 'PCA数据点',
      type: 'scatter',
      data: data,
      symbolSize: 10,
      itemStyle: {
        color: function(params) {
          // 按年份着色
          const years = [2007, 2008, 2009, 2010, 2011];
          const colorMap = [
            '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'
          ];
          const yearIndex = years.indexOf(params.data[3]);
          return colorMap[yearIndex];
        }
      }
    });
  }
  
  // 计算解释方差比例
  const varianceExplained = pcaResult.varianceExplained;
  const pc1Var = (varianceExplained[0] * 100).toFixed(2);
  const pc2Var = (varianceExplained[1] * 100).toFixed(2);
  
  const option = {
    title: {
      text: year === 'all' ? 'PCA分析 (2007-2011)' : `PCA分析 (${year})`,
      subtext: clusterCount > 0 ? `K-means聚类 (k=${clusterCount})` : '',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        if (params.seriesName.includes('中心')) {
          return params.data[2];
        }
        
        const [x, y, film, year, genre] = params.data;
        return `<div>
          <strong>${film}</strong> (${year})<br/>
          类型: ${genre}<br/>
          主成分1: ${x.toFixed(2)}<br/>
          主成分2: ${y.toFixed(2)}<br/>
          ${clusterCount > 0 ? params.seriesName : ''}
        </div>`;
      }
    },
    legend: {
      data: seriesData.map(item => item.name),
      top: 30,
      type: 'scroll'
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: `主成分1 (${pc1Var}%)`,
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: `主成分2 (${pc2Var}%)`,
      nameLocation: 'middle',
      nameGap: 30
    },
    series: seriesData
  };
  
  charts.pcaScatter.setOption(option);
  
  // 显示主成分的特征权重
  console.log('主成分1特征权重:', pcaResult.eigenvectors[0]);
  console.log('主成分2特征权重:', pcaResult.eigenvectors[1]);
}

// 窗口大小改变时重新调整图表大小
window.addEventListener("resize", function () {
  Object.values(charts).forEach((chart) => {
    chart.resize();
  });
});
