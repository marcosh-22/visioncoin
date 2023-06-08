import { CoingeckoAPI } from "./CoingeckoAPI.js";

function isDarkMode(){
    return document.body.classList.contains('dark-theme');
}

class FreePlanError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FreePlanError';
    }
}

export class ChartManager {
    constructor(chartId) {
        this.chartId = chartId;
        this.chartElement = document.getElementById(chartId);
        this.chartData = { labels: [], datasets: [] };
        this.coinIds = null;
        this.chart = null;
        this.canvasManager = null;

        this.chartAnimationCompleted = false;

        this.__init__();
    }

    __init__() {
        this.createChart();
        this.createCanvasManager();
    }

    async update() {
        try {
            await this.fetchData();
            this.updateChart();
            this.canvasManager.setMeta(this.chart.getDatasetMeta(0));
        } catch (e) {
            if (e instanceof FreePlanError) {
                alert(e.message);
            }
            console.error(e);
        }
    }

    updateChart() {
        this.chart.update();
        this.canvasManager.update();
    }

    updateDatasetsTheme() {
        let flag = isDarkMode();
        for (let datasets of this.chartData.datasets) {
            datasets.backgroundColor = flag ? 'rgba(255, 99, 132, 0.3)' : 'rgba(89, 89, 254, 0.4)';
            datasets.borderColor = flag ? 'red' : 'blue';
        }
    }

    async fetchData() {
        const promises = this.coinIds.map((coinId) => {
            return CoingeckoAPI.get_market_chart(coinId, 1);
        });
        const responses = await Promise.all(promises);
        responses.forEach((response, index) => {
            if (response.response.ok) {
                this.chartData.datasets[index].data = response.data['data']['prices'];
                this.chartData.datasets[index].label = this.coinIds[index];
                this.chartData.labels = response.data['data']['prices'].map(
                    (price) => new Date(price[0]).toLocaleDateString()
                );
            } else {
                if (response.response.status === 429) {
                    throw new FreePlanError(`Calm down!! The free plan has a limited number of requests.`);
                }
                throw new Error('cannot get market chart, status: ' + response.response.status);
            }
        });
    }

    createDatasets() {
        this.coinIds.forEach((coinId, index) => {
            this.chartData.datasets.push({
                label: coinId,
                borderWidth: 1,
                pointRadius: 0,
                data: [],
                fill: true,
            });
        });
        this.updateDatasetsTheme();
    }

    createChart() {
        const ctx = this.chartElement.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: this.chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: false,
                    },
                    y: {
                        grid: {
                            color: function(context){
                                if (isDarkMode()) {
                                    return 'rgba(255, 99, 132, 0.2)';
                                }
                                return 'rgba(89, 89, 254, 0.4)';
                            },
                        }
                    }
                },
            },
        });
    }

    createCanvasManager() {
        this.canvasManager = new CanvasManager(
            this.chart,
            this.chartElement,
        );
    }

    set_coinIds(coinIds) {
        this.coinIds = coinIds;
        this.chartData.datasets = [];
        this.createDatasets();
        this.update();
    }
}

class CanvasManager {
    constructor(chart, chartElement) {
        this.chart = chart;
        this.chartElement = chartElement;
        this.containerElement = chartElement.parentNode;

        this.chartMeta = { data: [], };

        this.canvasElement = null;
        this.canvasCtx = null;
        this.resizeObserver = null;
        this.updateIntervalRef = null;

        this.chartValue = 0;

        this.__init__();
    }

    __init__() {
        this.createCanvas();
        this.resizeCanvas();
        this.observeResize();
        this.createMouseEvents();
        this.update();
    }

    createCanvas() {
        this.canvasElement = document.createElement('canvas');
        this.containerElement.appendChild(this.canvasElement);
        this.canvasElement.style.position = 'absolute';
        this.canvasElement.style.zIndex = this.chartElement.style.zIndex + 1;

        this.canvasCtx = this.canvasElement.getContext('2d');
    }

    resizeCanvas() {
        this.canvasElement.width = this.chartElement.offsetWidth;
        this.canvasElement.height = this.chartElement.offsetHeight;
        this.canvasElement.style.top = `${this.chartElement.offsetTop}px`;
        this.canvasElement.style.left = `${this.chartElement.offsetLeft}px`;
    }

    observeResize() {
        this.resizeObserver = new ResizeObserver(this.resizeHandler.bind(this));
        this.resizeObserver.observe(this.chartElement);
    }

    resizeHandler(entries) {
        for (let entry of entries) {
            if (entry.target === this.chartElement && entry.contentRect) {
                this.resizeCanvas();
            }
        }
    }

    updateDraw() {
        if (this.updateIntervalRef !== null) {
            clearInterval(this.updateIntervalRef);
            this.updateIntervalRef = null;
        }
        let isFirstTime = true;
        this.updateIntervalRef = setInterval(() => {
            const draw = () => {
                if (this.chartMeta.data.length > 0) {
                    let animation = this.chartMeta.data[this.chartMeta.data.length - 1]['$animations']['y']['_active'];
                    if (!animation) {
                        return true;
                    }
                    this.clearCtx();
                    this.drawDefaultLine();
                }
                return false;
            }
            if (isFirstTime) {
                isFirstTime = false;
                this.clearCtx();
                this.drawDefaultLine();
            }
            draw();
        }, 10);
    }


    update() {
        this.updateDraw();
    }

    setMeta(meta) {
        this.chartMeta = meta;
        this.chartAnimationCompleted = false;
        this.update();
    }

    createMouseEvents() {
        this.canvasElement.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
        this.canvasElement.addEventListener('mouseleave', this.mouseLeaveHandler.bind(this));
    }

    drawNumber(X, Y, color = null) {
        const fontSize = 16;
        const margin = 5;

        let x = X - margin;
        let y = Y;

        let formattedText = this.chartValue.toLocaleString(
            'en-US',
            { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        let measureText = this.canvasCtx.measureText(formattedText);
        let textWidth = measureText.width;

        if (x - textWidth < 0) {
            x = X + margin + textWidth;
        }

        this.canvasCtx.font = `${fontSize}px Arial`;
        this.canvasCtx.fillStyle = color || 'white';
        this.canvasCtx.fillText(formattedText, x - textWidth, y);
    }


    drawDefaultLine() {
        if (this.chartMeta.data.length > 0) {
            const data = this.chartMeta.data[this.chartMeta.data.length - 1];
            this.drawLines(
                this.canvasCtx,
                { y: data.y },
                this.chartMeta['_dataset'].borderColor,
                [2, 2],
            );
        }
    }

    drawLines(ctx, points = { x: undefined, y: undefined }, color = 'gray', lineDash = [5, 5]) {
        if (!points.x && !points.y)
            throw new Error('points.x OR points.y are required');

        ctx.beginPath();
        ctx.strokeStyle = color;

        if (points.x) {
            ctx.setLineDash(lineDash);
            ctx.moveTo(points.x, 0);
            ctx.lineTo(points.x, this.canvasElement.height);
            ctx.stroke();
        }
        if (points.y) {
            ctx.setLineDash(lineDash);
            ctx.moveTo(0, points.y);
            ctx.lineTo(this.canvasElement.width, points.y);
            ctx.stroke();
        }

        ctx.closePath();
    }

    drawCircle(ctx, points = { x: undefined, y: undefined }, color, radius = 5) {
        if (!points.x || !points.y)
            throw new Error('points.x AND points.y are required');

        ctx.beginPath();

        ctx.fillStyle = color;
        ctx.arc(points.x, points.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.closePath();
    }

    mouseMoveHandler(event) {
        if (this.chartMeta.data.length > 0) {
            let nearestElement = this.getNearestElement(this.chartMeta, event.offsetX);
            this.clearCtx();
            this.drawDefaultLine();
            if (nearestElement) {
                this.chartValue = nearestElement['$context']['raw'][1];
                this.drawNumber(nearestElement.x, event.offsetY, isDarkMode() ? 'gray' : 'rgb(97, 97, 97)');
                this.drawLines(this.canvasCtx, nearestElement, isDarkMode() ? 'gray' : 'rgb(97, 97, 97)', [5, 3]);
                this.drawCircle(this.canvasCtx, nearestElement, this.chartMeta['_dataset']['borderColor'], 3.5);
            } else {
                let offsetX = event.offsetX || 1;
                this.drawLines(this.canvasCtx, { x: offsetX }, 'red', [18, 8]);
            }
        }
    }

    mouseLeaveHandler(event) {
        this.clearCtx();
        this.drawDefaultLine();
    }

    clearCtx() {
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    getNearestElement(meta, mouseX) {
        const items = meta.data;

        let nearestIndex = null;
        for (let i = 0; i < items.length; i++) {
            const point = items[i];
            if (point.x <= mouseX) {
                nearestIndex = i;
                continue;
            }
            break;
        }
        return items[nearestIndex];
    }
}