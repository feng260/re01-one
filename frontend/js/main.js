document.addEventListener('DOMContentLoaded', function() {
    const filterBtn = document.getElementById('filter-btn');
    const stockCodesInput = document.getElementById('stock-codes');
    const loading = document.getElementById('loading');
    const resultsTable = document.getElementById('results-table').querySelector('tbody');
    const noResults = document.getElementById('no-results');
    const resultsPanel = document.querySelector('.results-panel');
    const analysisPanel = document.querySelector('.analysis-panel');
    const backBtn = document.getElementById('back-btn');
    const stockInfo = document.getElementById('stock-info');
    const priceChart = echarts.init(document.getElementById('price-chart'));
    const volumeChart = echarts.init(document.getElementById('volume-chart'));
    
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
        const stockCodes = stockCodesInput.value.trim().split(',').map(code => code.trim());
        
        if (stockCodes.length === 0 || (stockCodes.length === 1 && stockCodes[0] === '')) {
            alert('请输入股票代码');
            return;
        }
        
        // 显示加载状态
        loading.style.display = 'block';
        resultsTable.innerHTML = '';
        noResults.style.display = 'none';
        
        // 调用后端API
        fetch('/api/filter_stocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stock_codes: stockCodes })
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
        // 显示加载状态
        stockInfo.innerHTML = '<div style="text-align: center; padding: 40px;">正在加载分析数据...</div>';
        
        // 调用后端API获取股票详细信息
        fetch(`/api/stock_detail?code=${stockCode}`)
            .then(response => response.json())
            .then(stock => {
                if (!stock) {
                    stockInfo.innerHTML = '<div style="text-align: center; padding: 40px; color: red;">获取股票信息失败</div>';
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
                `;
                
                // 绘制价格走势图
                const dates = stock.history.map(item => item.date);
                const prices = stock.history.map(item => item.close);
                
                priceChart.setOption({
                    title: {
                        text: '价格走势图',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    xAxis: {
                        type: 'category',
                        data: dates
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        data: prices,
                        type: 'line',
                        smooth: true,
                        lineStyle: {
                            color: '#3498db'
                        }
                    }]
                });
                
                // 绘制成交量图
                const volumes = stock.history.map(item => item.volume);
                
                volumeChart.setOption({
                    title: {
                        text: '成交量走势图',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    xAxis: {
                        type: 'category',
                        data: dates
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        data: volumes,
                        type: 'bar',
                        itemStyle: {
                            color: '#27ae60'
                        }
                    }]
                });
            })
            .catch(error => {
                console.error('获取股票详情失败:', error);
                stockInfo.innerHTML = '<div style="text-align: center; padding: 40px; color: red;">获取股票信息失败，请稍后重试</div>';
            });
        
        // 显示分析面板，隐藏结果面板
        resultsPanel.style.display = 'none';
        analysisPanel.style.display = 'block';
    }
    
    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        priceChart.resize();
        volumeChart.resize();
    });
});