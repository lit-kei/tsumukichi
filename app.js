// DOM要素の取得
const coinInput = document.getElementById('coinInput');
const saveButton = document.getElementById('saveButton');
const coinChartCanvas = document.getElementById('coinChart');

// localStorageからコインの履歴を読み込む
let coinHistory = JSON.parse(localStorage.getItem('coinHistory')) || [];
let interpolatedCoinHistory = interpolateData(coinHistory);

document.getElementById('coinChart').style.height = "560px"; //htmlと同じ高さを設定
//document.getElementById('coinChart').style.width = String(coinHistory.length * 180) + "px"; //　グラフの幅を設定　ここをコメントアウトすると、幅いっぱい使える
try{
    const newData = coinHistory[coinHistory.length-1];
    if (newData.date == new Date().toLocaleDateString()) {
        coinInput.value = newData.coins;
        kanmaChange(coinInput);
    }
} catch {
    console.error('The table is undefined');
}

// グラフの設定
const chartConfig = {
    type: 'line',
    data: {
            labels: interpolatedCoinHistory.map(item => item.date),
            datasets: [{
              label: 'Coins',
              data: interpolatedCoinHistory.map(item => item.coins),
              backgroundColor: interpolatedCoinHistory.map(item => item.isInterpolated ? 'orange' : '#007BFF'), // isInterpolatedがtrueならオレンジ色
              borderColor: interpolatedCoinHistory.map(item => item.isInterpolated ? 'orange' : '#007BFF'), // 同様に枠線の色も設定
              borderWidth: 1
            }]
          },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: '日付'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'コイン数'
                },
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString(); // コイン数をカンマ区切りで表示
                    }
                },
                min: 0,
                max : function() {
                    const maxDataValue = Math.max(...coinHistory.map(entry => entry.coins));
                    const ketasu = Math.floor(Math.log10(maxDataValue));//桁数-1
                    return Math.floor((10**ketasu * 0.5 + maxDataValue) / (10**(ketasu-1))) * 10**(ketasu-1);
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    title: function(tooltipItem) {
                        return tooltipItem[0].label;
                    },
                    label: function(tooltipItem) {
                        const dataIndex = tooltipItem.dataIndex;
                        const datasetIndex = tooltipItem.datasetIndex;
                        const dataset = tooltipItem.chart.data.datasets[datasetIndex];

                        if (dataIndex === 0) {
                            if (dataset.backgroundColor[dataIndex] === 'orange') {
                                return `コイン数: ${dataset.data[dataIndex].toLocaleString()} (補完値)`;
                            } else {
                                return `コイン数: ${dataset.data[dataIndex].toLocaleString()}`;
                            }
                        } else {
                            if (dataset.backgroundColor[dataIndex] === 'orange') {
                                return `コイン数: ${dataset.data[dataIndex].toLocaleString()} (補完値), 前日比: ${dataset.data[dataIndex] - dataset.data[dataIndex - 1]}`;
                            } else {
                                return `コイン数: ${dataset.data[dataIndex].toLocaleString()}, 前日比: ${dataset.data[dataIndex] - dataset.data[dataIndex - 1]}`;
                            }
                        }
                    }
                }
            }
        }
    }
};

// Chart.jsグラフのインスタンス
const coinChart = new Chart(coinChartCanvas, chartConfig);


// 2点間の補間を計算する関数
function interpolateData(data) {
    const interpolatedData = [];
    
    for (let i = 0; i < data.length - 1; i++) {
        interpolatedData.push(data[i]);

        const start = data[i];
        const end = data[i + 1];
        
        const startDate = new Date(start.date);
        const endDate = new Date(end.date);
        const dateDiff = (endDate - startDate) / (1000 * 3600 * 24); // 日数差
        
        // 傾き（1日あたりの変化量）
        const slope = (end.coins - start.coins) / dateDiff;
        
        // 各日付で補完された値を追加
        for (let j = 1; j < dateDiff; j++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + j);
            const currentCoins = Math.floor(start.coins + slope * j);
            
            interpolatedData.push({
                date: currentDate.toLocaleDateString(),
                coins: currentCoins,
                isInterpolated: true
            });
        }
    }
    interpolatedData.push(data[data.length-1]);

    return interpolatedData;
}


// グラフのデータを更新する関数
function updateChart() {
    interpolatedCoinHistory = interpolateData(coinHistory);
    const labels = interpolatedCoinHistory.map(entry => entry.date);
    const data = interpolatedCoinHistory.map(entry => entry.coins);

    coinChart.data.labels = labels;
    coinChart.data.datasets[0].data = data;
    coinChart.update();
}

// コイン数を保存する関数
function saveCoinData() {
    const coinValue = parseNumber(coinInput.value);
    if (!isNaN(coinValue)) {
        const today = new Date().toLocaleDateString();
        
        // 同じ日付がすでに存在する場合、上書きする
        const existingIndex = coinHistory.findIndex(entry => entry.date === today);
        if (existingIndex !== -1) {
            coinHistory[existingIndex].coins = coinValue; // 上書き
        } else {
            coinHistory.push({ date: today, coins: coinValue }); // 新しいデータを追加
        }

        // localStorageに保存
        localStorage.setItem('coinHistory', JSON.stringify(coinHistory));

        // グラフを更新
        updateChart();
    }
}

// 保存ボタンのクリックイベント
saveButton.addEventListener('click', saveCoinData);

// 初回ロード時にグラフを表示
updateChart();

function kanmaChange(inputAns){
    let inputAnsValue = inputAns.value;
    let numberAns = inputAnsValue.replace(/[^0-9]/g, "");
    kanmaAns = numberAns.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    if(kanmaAns.match(/[^0-9]/g)){
     inputAns.value= kanmaAns;
     return true;
    }
};

function parseNumber(str) {
    // カンマを取り除いてから数値型に変換
    if (str == '') {
        return NaN;
    } else {
        return Number(str.replace(/,/g, ''));
    }
  }