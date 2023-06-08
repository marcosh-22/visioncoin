import { CryptoTableManager } from "./cryptotableManager.js";
//import { ChartManager } from "./chartManager.js";

const cryptotableManager = new CryptoTableManager('cryptotable');

const themeButton = document.getElementById("theme-button");

themeButton.addEventListener("click", function () {
    let darkMode = document.body.classList.toggle('dark-theme');
    themeButton.children[0].children[0].src = darkMode ? "/static/img/sun.png" : "/static/img/moon.png";
    cryptotableManager.chartManager.updateDatasetsTheme();
    cryptotableManager.chartManager.update();
});