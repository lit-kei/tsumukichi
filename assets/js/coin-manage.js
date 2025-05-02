// DOM要素の取得
const coinInput = document.getElementById('coinInput');
const saveButton = document.getElementById('saveButton');
const coinChartCanvas = document.getElementById('coinChart');

let selectedDay = new Date().toLocaleDateString();
let failure = true;



// localStorageからコインの履歴を読み込む
let coinHistory = JSON.parse(localStorage.getItem('coinHistory')) || [];
let interpolatedCoinHistory = interpolateData(coinHistory);

document.getElementById('coinChart').style.height = "560px"; //htmlと同じ高さを設定
//document.getElementById('coinChart').style.width = String(coinHistory.length * 180) + "px"; //　グラフの幅を設定　ここをコメントアウトすると、幅いっぱい使える
window.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // 月は0始まりなので+1
    const dd = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${yyyy}-${mm}-${dd}`;
    document.getElementById('dateInput').value = formattedDate;

    try{
        const newData = coinHistory[coinHistory.length-1];
        if (newData.date == new Date().toLocaleDateString()) {
            coinInput.value = newData.coins;
            kanmaChange(coinInput);
        }
        chartConfig = {
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
                                        return `コイン数: ${dataset.data[dataIndex].toLocaleString()} (補間値)`;
                                    } else {
                                        return `コイン数: ${dataset.data[dataIndex].toLocaleString()}`;
                                    }
                                } else {
                                    if (dataset.backgroundColor[dataIndex] === 'orange') {
                                        return `コイン数: ${dataset.data[dataIndex].toLocaleString()} (補間値), 前日比: ${dataset.data[dataIndex] - dataset.data[dataIndex - 1]}`;
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
        coinChart = new Chart(coinChartCanvas, chartConfig);
        updateChart();
        failure = false;
    } catch {
        console.error('The table is undefined');
    }
    
  });

// グラフの設定
let chartConfig;

// Chart.jsグラフのインスタンス
let coinChart;


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
    if (failure) {
        failure = false;
        chartConfig = {
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
        coinChart = new Chart(coinChartCanvas, chartConfig);
    }
    const labels = interpolatedCoinHistory.map(entry => entry.date);
    const data = interpolatedCoinHistory.map(entry => entry.coins);

    coinChart.data.labels = labels;
    coinChart.data.datasets[0].data = data;
    coinChart.data.datasets[0].backgroundColor = interpolatedCoinHistory.map(item => item.isInterpolated ? 'orange' : '#007BFF'), // isInterpolatedがtrueならオレンジ色
    coinChart.data.datasets[0].borderColor = interpolatedCoinHistory.map(item => item.isInterpolated ? 'orange' : '#007BFF'), // 同様に枠線の色も設定
    coinChart.update();
}

function compareDates(dateStr1, dateStr2) {
    // 文字列を "yyyy-mm-dd" に変換してから比較する\
    const [year1, month1, day1] = dateStr1.split('/').map(Number); // 年、月、日を取り出す
    const [year2, month2, day2] = dateStr2.split('/').map(Number); // 年、月、日を取り出す

    // 年、月、日を順番に比較する
    if (year1 < year2) return -1;  // dateStr1 が早い
    if (year1 > year2) return 1;   // dateStr1 が遅い
    if (month1 < month2) return -1; // 月を比較
    if (month1 > month2) return 1;  // 月を比較
    if (day1 < day2) return -1;    // 日を比較
    if (day1 > day2) return 1;     // 日を比較
    return 0; // 日付が同じ
}


//二分探索
function binarySearchInsertIndex() {
    let low = 0;
    let high = coinHistory.length - 1;
    
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midDate = coinHistory[mid].date; // 配列の各要素の日付
        const comparison = compareDates(midDate, selectedDay);

        if (comparison < 0) {
            low = mid + 1; // targetDate が midDate よりも大きい
        } else if (comparison > 0) {
            high = mid - 1; // targetDate が midDate よりも小さい
        } else {
            return mid; // 日付が一致した場合、そのインデックスを返す
        }
    }

    return low; // 挿入位置を返す
}


// コイン数を保存する関数
function saveCoinData() {
    const coinValue = parseNumber(coinInput.value);
    if (!isNaN(coinValue)) {
        if (!selectedDay.includes("NaN")) {
            const insertIndex = binarySearchInsertIndex();
            if (coinHistory.findIndex(entry => entry.date === selectedDay) !== -1) {
                coinHistory[insertIndex].coins = coinValue; // 上書き
            } else {
                coinHistory.splice(insertIndex, 0, { date: selectedDay, coins: coinValue }); // 新しいデータを追加
            }
        

            // localStorageに保存
            localStorage.setItem('coinHistory', JSON.stringify(coinHistory));
    
            // グラフを更新
            updateChart();
        }
    }
}

document.getElementById('dateInput').addEventListener('change', function(event) {
    const inputDate = new Date(event.target.value);
    selectedDay = `${inputDate.getFullYear()}/${inputDate.getMonth() + 1}/${inputDate.getDate()}`; // "yyyy/m/d"

    const match = coinHistory.find(item => item.date === selectedDay);

    coinInput.value = match ? match.coins : null;
  });

// 保存ボタンのクリックイベント
saveButton.addEventListener('click', saveCoinData);

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

document.getElementById('deleteButton').addEventListener('click', function() {
    if (selectedDay.includes('NaN')) {
        alert("日付が正しく選択されていません。");
    } else {
        let result = confirm(selectedDay + "のデータを削除しますか？");
        if (result) {
            const deleteIndex = coinHistory.findIndex(entry => entry.date === selectedDay);
            if (deleteIndex != -1) {
                coinHistory.splice(deleteIndex, 1);
                localStorage.setItem('coinHistory', JSON.stringify(coinHistory));
                
                alert("削除に成功しました。");
                coinInput.value = null;
                
                // グラフを更新
                updateChart();
            } else {
                alert("失敗：データがありませんでした。");
            }
        }
    }
});