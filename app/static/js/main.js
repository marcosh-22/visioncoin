import { CryptoTableManager } from "./cryptotableManager.js";
import { ChartManager } from "./chartManager.js";

const chartManager = new ChartManager('chart');
const cryptotableManager = new CryptoTableManager('cryptotable', chartManager);
chartManager.__init__();
cryptotableManager.__init__();

const themeButton = document.getElementById("theme-button");
themeButton.addEventListener("click", function () {
    let darkMode = document.body.classList.toggle('dark-theme');
    themeButton.children[0].children[0].src = darkMode ? "/static/img/sun.png" : "/static/img/moon.png";
    chartManager.updateDatasetsTheme();
    chartManager.updateChart();
});

setInterval(function () {
    cryptotableManager.update();
}, 60000);