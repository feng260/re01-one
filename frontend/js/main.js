document.addEventListener('DOMContentLoaded', function() {
    const filterBtn = document.getElementById('filter-btn');
    const stockCodesInput = document.getElementById('stock-codes');
    const filterTypeSelect = document.getElementById('filter-type');
    const customStocksDiv = document.getElementById('custom-stocks');
    const loading = document.getElementById('loading');
    const resultsTable = document.getElementById('results-table').querySelector('tbody');
    const noResults = document.getElementById('no-results');
    const resultsPanel = document.querySelector('.results-panel');
    const analysisPanel = document.querySelector('.analysis-panel');
    const backBtn = document.getElementById('back-btn');
    const stockInfo = document.getElementById('stock-info');
    const priceChart = echarts.init(document.getElementById('price-chart'));
    const volumeChart = echarts.init(document.getElementById('volume-chart'));
    
    // 监听筛选范围选择变化
    filterTypeSelect.addEventListener('change', function() {
        if (this.value === 'all') {
            customStocksDiv.style.display = 'none';
        } else {
            customStocksDiv.style.display = 'block';
        }
    });
    
    // 股票数据（模拟数据）
    const mockStockData = {
        'sh600519': {
            name: '贵州茅台',
            short_term_gain: 15.2,
            current_price: 1850.00,
            volume: 1250000,
            fund_flow: {
                net_inflow: 150000000,
                net_inflow_rate: 12.5
            },
            industry_heat: {
                industry_gain: 18.5,
                up_stocks_ratio: 0.85
            },
            history: [
                { date: '2024-01-01', close: 1600.00, volume: 1000000 },
                { date: '2024-01-02', close: 1620.00, volume: 1100000 },
                { date: '2024-01-03', close: 1650.00, volume: 1150000 },
                { date: '2024-01-04', close: 1680.00, volume: 1200000 },
                { date: '2024-01-05', close: 1700.00, volume: 1250000 },
                { date: '2024-01-08', close: 1720.00, volume: 1300000 },
                { date: '2024-01-09', close: 1750.00, volume: 1350000 },
                { date: '2024-01-10', close: 1780.00, volume: 1400000 },
                { date: '2024-01-11', close: 1800.00, volume: 1450000 },
                { date: '2024-01-12', close: 1850.00, volume: 1500000 }
            ]
        },
        'sz000858': {
            name: '五粮液',
            short_term_gain: 12.8,
            current_price: 168.50,
            volume: 2500000,
            fund_flow: {
                net_inflow: 80000000,
                net_inflow_rate: 10.2
            },
            industry_heat: {
                industry_gain: 18.5,
                up_stocks_ratio: 0.85
            },
            history: [
                { date: '2024-01-01', close: 150.00, volume: 2000000 },
                { date: '2024-01-02', close: 152.00, volume: 2100000 },
                { date: '2024-01-03', close: 155.00, volume: 2150000 },
                { date: '2024-01-04', close: 158.00, volume: 2200000 },
                { date: '2024-01-05', close: 160.00, volume: 2250000 },
                { date: '2024-01-08', close: 162.00, volume: 2300000 },
                { date: '2024-01-09', close: 164.00, volume: 2350000 },
                { date: '2024-01-10', close: 165.00, volume: 2400000 },
                { date: '2024-01-11', close: 166.50, volume: 2450000 },
                { date: '2024-01-12', close: 168.50, volume: 2500000 }
            ]
        },
        'sh601318': {
            name: '中国平安',
            short_term_gain: 8.5,
            current_price: 48.20,
            volume: 5000000,
            fund_flow: {
                net_inflow: 50000000,
                net_inflow_rate: 6.8
            },
            industry_heat: {
                industry_gain: 10.2,
                up_stocks_ratio: 0.72
            },
            history: [
                { date: '2024-01-01', close: 44.50, volume: 4500000 },
                { date: '2024-01-02', close: 44.80, volume: 4600000 },
                { date: '2024-01-03', close: 45.00, volume: 4650000 },
                { date: '2024-01-04', close: 45.50, volume: 4700000 },
                { date: '2024-01-05', close: 46.00, volume: 4750000 },
                { date: '2024-01-08', close: 46.50, volume: 4800000 },
                { date: '2024-01-09', close: 47.00, volume: 4850000 },
                { date: '2024-01-10', close: 47.50, volume: 4900000 },
                { date: '2024-01-11', close: 47.80, volume: 4950000 },
                { date: '2024-01-12', close: 48.20, volume: 5000000 }
            ]
        }
    };
    
    // 筛选按钮点击事件
    filterBtn.addEventListener('click', function() {
        let stockCodes = [];
        const filterType = filterTypeSelect.value;
        
        if (filterType === 'custom') {
            stockCodes = stockCodesInput.value.trim().split(',').map(code => code.trim());
            
            if (stockCodes.length === 0 || (stockCodes.length === 1 && stockCodes[0] === '')) {
                alert('请输入股票代码');
                return;
            }
        } else if (filterType === 'all') {
            // 全部股票模式，发送特殊标记
            stockCodes = ['all'];
        }
        
        // 显示加载状态
        loading.style.display = 'block';
        resultsTable.innerHTML = '';
        noResults.style.display = 'none';
        
        // 获取数据来源
        const dataSource = document.getElementById('data-source').value;
        
        // 调用后端API
        fetch('/api/filter_stocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stock_codes: stockCodes, data_source: dataSource })
        })
        .then(response => response.json())
        .then(data => {
            // 隐藏加载状态
            loading.style.display = 'none';
            
            // 显示筛选结果
            if (data.length > 0) {
                data.forEach(stock => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${stock.code}</td>
                        <td>${stock.name}</td>
                        <td>${stock.short_term_gain}</td>
                        <td>${stock.current_price.toFixed(2)}</td>
                        <td>${stock.volume.toLocaleString()}</td>
                        <td><button class="analysis-btn" data-code="${stock.code}">详细分析</button></td>
                    `;
                    resultsTable.appendChild(row);
                });
                
                // 添加详细分析按钮点击事件
                document.querySelectorAll('.analysis-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const stockCode = this.getAttribute('data-code');
                        showAnalysis(stockCode);
                    });
                });
            } else {
                noResults.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('筛选股票失败:', error);
            loading.style.display = 'none';
            alert('筛选股票失败，请稍后重试');
        });
    });
    
    // 返回按钮点击事件
    backBtn.addEventListener('click', function() {
        analysisPanel.style.display = 'none';
        resultsPanel.style.display = 'block';
    });
    
    // 显示详细分析
    function showAnalysis(stockCode) {
        console.log('开始获取股票详情:', stockCode);
        // 显示加载状态
        stockInfo.innerHTML = '<div style="text-align: center; padding: 40px;">正在加载分析数据...</div>';
        
        // 显示分析面板，隐藏结果面板
        resultsPanel.style.display = 'none';
        analysisPanel.style.display = 'block';
        
        // 获取数据来源
        const dataSource = document.getElementById('data-source').value;
        
        // 调用后端API获取股票详细信息
        fetch(`/api/stock_detail?code=${stockCode}&data_source=${dataSource}`)
            .then(response => {
                console.log('响应状态:', response.status);
                return response.json();
            })
            .then(stock => {
                console.log('获取到的股票数据:', stock);
                if (!stock) {
                    console.error('股票数据为null或undefined');
                    stockInfo.innerHTML = '<div style="text-align: center; padding: 40px; color: red;">获取股票信息失败</div>';
                    return;
                }
                
                if (!stock.history || !Array.isArray(stock.history)) {
                    console.error('股票数据中没有history字段或history不是数组');
                    stockInfo.innerHTML = '<div style="text-align: center; padding: 40px; color: red;">股票数据格式错误</div>';
                    return;
                }
                
                // 显示股票信息
                stockInfo.innerHTML = `
                    <h3>${stock.name} (${stock.code})</h3>
                    <p><strong>当前价格：</strong>${stock.current_price.toFixed(2)}元</p>
                    <p><strong>短期涨幅：</strong>${stock.short_term_gain}%</p>
                    <p><strong>成交量：</strong>${stock.volume.toLocaleString()}</p>
                    <p><strong>资金净流入：</strong>${(stock.fund_flow.net_inflow / 10000).toFixed(2)}万元</p>
                    <p><strong>资金净流入率：</strong>${stock.fund_flow.net_inflow_rate}%</p>
                    <p><strong>行业涨幅：</strong>${stock.industry_heat.industry_gain}%</p>
                    <p><strong>行业上涨股票占比：</strong>${(stock.industry_heat.up_stocks_ratio * 100).toFixed(1)}%</p>
                    
                    <h4>分析依据</h4>
                    <ul>
                        <li><strong>短期涨幅：</strong>涨幅${stock.short_term_gain}%，大于10%的筛选标准</li>
                        <li><strong>趋势强度：</strong>5日均线大于10日均线，最近5个交易日中有4个交易日收盘价在5日均线上方，5日均线斜率为正</li>
                        <li><strong>量价配合：</strong>最近5日平均成交量比前5日平均成交量放大至少30%，价格上涨日的平均成交量大于价格下跌日的平均成交量</li>
                        <li><strong>资金流向：</strong>最近3个交易日资金净流入${(stock.fund_flow.net_inflow / 10000).toFixed(2)}万元，资金净流入率${stock.fund_flow.net_inflow_rate}%，大于5%的筛选标准</li>
                        <li><strong>行业热度：</strong>行业指数涨幅${stock.industry_heat.industry_gain}%，大于8%的筛选标准；行业内上涨股票数量占比${(stock.industry_heat.up_stocks_ratio * 100).toFixed(1)}%，大于60%的筛选标准</li>
                        <li><strong>风险控制：</strong>波动率小于同期沪深300指数波动率的1.5倍，最大回撤小于15%，夏普比率大于0.5</li>
                    </ul>
                `;
                
                try {
                    console.log('开始处理股票数据');
                    
                    // 检查history数据
                    console.log('history数据:', stock.history);
                    console.log('history长度:', stock.history.length);
                    
                    // 处理K线数据
                    console.log('开始处理K线数据');
                    const dates = stock.history.map(item => item.date);
                    console.log('dates:', dates);
                    
                    const klineData = stock.history.map(item => [
                        item.open,
                        item.close,
                        item.low,
                        item.high
                    ]);
                    console.log('klineData:', klineData);
                    
                    // 生成未来5天的预测数据（简单线性预测）
                    console.log('开始生成预测数据');
                    const futureDates = [];
                    const futureData = [];
                    const lastDate = new Date(stock.history[stock.history.length - 1].date);
                    console.log('lastDate:', lastDate);
                    
                    let lastClose = stock.history[stock.history.length - 1].close;
                    let lastOpen = stock.history[stock.history.length - 1].open;
                    let lastHigh = stock.history[stock.history.length - 1].high;
                    let lastLow = stock.history[stock.history.length - 1].low;
                    
                    // 计算平均涨幅
                    console.log('开始计算平均涨幅');
                    let totalChange = 0;
                    for (let i = 1; i < stock.history.length; i++) {
                        totalChange += (stock.history[i].close - stock.history[i-1].close) / stock.history[i-1].close;
                    }
                    const avgChange = totalChange / (stock.history.length - 1);
                    console.log('avgChange:', avgChange);
                    
                    for (let i = 1; i <= 5; i++) {
                        const nextDate = new Date(lastDate);
                        nextDate.setDate(lastDate.getDate() + i);
                        const dateStr = nextDate.toISOString().split('T')[0];
                        futureDates.push(dateStr);
                        
                        // 简单线性预测
                        const predictedClose = lastClose * (1 + avgChange);
                        const predictedOpen = lastOpen * (1 + avgChange * 0.5);
                        const predictedHigh = Math.max(predictedOpen, predictedClose) * 1.02;
                        const predictedLow = Math.min(predictedOpen, predictedClose) * 0.98;
                        
                        futureData.push([
                            predictedOpen,
                            predictedClose,
                            predictedLow,
                            predictedHigh
                        ]);
                        
                        // 更新最后价格用于下一天预测
                        lastClose = predictedClose;
                        lastOpen = predictedOpen;
                        lastHigh = predictedHigh;
                        lastLow = predictedLow;
                    }
                    console.log('futureDates:', futureDates);
                    console.log('futureData:', futureData);
                    
                    // 合并历史日期和预测日期
                    const allDates = [...dates, ...futureDates];
                    console.log('allDates:', allDates);
                    
                    // 绘制K线图
                    console.log('开始绘制K线图');
                    priceChart.setOption({
                        title: {
                            text: '价格走势图（含预测）',
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'cross'
                            }
                        },
                        legend: {
                            data: ['K线', '预测']
                        },
                        xAxis: {
                            type: 'category',
                            data: allDates,
                            boundaryGap: false
                        },
                        yAxis: {
                            type: 'value',
                            scale: true
                        },
                        series: [{
                            name: 'K线',
                            type: 'line',
                            data: stock.history.map(item => item.close),
                            itemStyle: {
                                color: '#3498db'
                            }
                        }]
                    });
                    console.log('K线图绘制完成');
                    
                    // 处理成交量数据
                    console.log('开始处理成交量数据');
                    const volumes = stock.history.map(item => item.volume);
                    console.log('volumes:', volumes);
                    
                    // 生成未来5天的预测成交量（基于历史平均）
                    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
                    const futureVolumes = [];
                    for (let i = 1; i <= 5; i++) {
                        // 模拟成交量波动
                        const predictedVolume = avgVolume * (1 + (Math.random() - 0.5) * 0.2);
                        futureVolumes.push(predictedVolume);
                    }
                    console.log('futureVolumes:', futureVolumes);
                    
                    // 合并历史成交量和预测成交量
                    const allVolumes = [...volumes, ...futureVolumes];
                    console.log('allVolumes:', allVolumes);
                    
                    // 绘制成交量图
                    console.log('开始绘制成交量图');
                    volumeChart.setOption({
                        title: {
                            text: '成交量走势图（含预测）',
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        xAxis: {
                            type: 'category',
                            data: allDates,
                            boundaryGap: false
                        },
                        yAxis: {
                            type: 'value'
                        },
                        series: [{
                            name: '成交量',
                            data: volumes,
                            type: 'bar',
                            itemStyle: {
                                color: '#27ae60'
                            }
                        }, {
                            name: '预测成交量',
                            data: Array(volumes.length).fill(null).concat(futureVolumes),
                            type: 'bar',
                            itemStyle: {
                                color: '#ff9800'
                            }
                        }]
                    });
                    console.log('成交量图绘制完成');
                    
                    // 调整图表大小，确保图表能够正确显示
                    setTimeout(function() {
                        priceChart.resize();
                        volumeChart.resize();
                    }, 100);
                } catch (error) {
                    console.error('处理股票数据时出错:', error);
                    console.error('错误堆栈:', error.stack);
                    stockInfo.innerHTML = `<div style="text-align: center; padding: 40px; color: red;">处理股票数据时出错: ${error.message}</div>`;
                }
            })
            .catch(error => {
                console.error('获取股票详情失败:', error);
                stockInfo.innerHTML = '<div style="text-align: center; padding: 40px; color: red;">获取股票信息失败，请稍后重试</div>';
            });
    }
    
    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        priceChart.resize();
        volumeChart.resize();
    });
});