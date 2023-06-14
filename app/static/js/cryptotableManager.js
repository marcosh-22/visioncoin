import { TableManager } from './TableManager.js';
import { CoingeckoAPI } from './CoingeckoAPI.js';

const MAX_TABLE_LIMIT = 25;
export class CryptoTableManager {
    constructor(tableId, chartManager) {
        this.tableManager = new TableManager(tableId);
        this.chartManager = chartManager;

        this.HEADERS = [
            '#',
            'Name',
            'Price',
            '24H',
        ];

        this.marketcoins = { data: [], }
        this.thead = null;
        this.tbody = null;
    }

    __init__() {
        this.update();
        this.addTableHead();
    }

    async updatemarketcoins() {
        const { response, data } = await CoingeckoAPI.get_market_coins();
        if (response.ok) {
            this.marketcoins['data'] = data['data'];
        } else {
            console.log('cannot get market coins, status: ' + response.status);
        }
    }

    async update() {
        await this.updatemarketcoins();
        this.chartManager.update();
        
        this.addTableBody();
    }

    formatBody() {
        const marketcoins = this.marketcoins['data'];

        let body = [];
        for (let i = 0; i < marketcoins.length; i++) {
            if (i > MAX_TABLE_LIMIT - 1) {
                break;
            }

            let price = marketcoins[i]['current_price'];
            let formattedPrice = price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            let percentChange = marketcoins[i]['price_change_percentage_24h'];
            let formattedPercentChange = percentChange.toFixed(2) + '%';

            let formattedBodyData = {
                '#': i + 1,
                'Name': `
                <div class="cryptotable-cell-name">
                    <span style="display: none">${marketcoins[i]['id']}</span>
                    <img src="${marketcoins[i]['image']}">
                    <p>${marketcoins[i]['name']}</p>
                    <span>${marketcoins[i]['symbol']}</span>
                </div>
                `,
                'Price': formattedPrice,
                '24H': `
                <p style="color: var(--${percentChange >= 0 ? 'green-currency' : 'red-currency'});">${formattedPercentChange}</p>
                `,
            };
            body.push(formattedBodyData);
        }

        return body;
    }

    addTableHead() {
        this.tableManager.setHeaders(this.HEADERS);
        this.thead = this.tableManager.renderHeader(this.thead);
    }

    addTableBody() {
        let body = this.formatBody();

        this.tableManager.setBody(body);
        if (this.tbody) this.tbody.innerHTML = '';
        this.tbody = this.tableManager.renderBody(this.tbody);
        this.addClickEvent();
    }

    addClickEvent() {
        const rows = this.tbody.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            rows[i].addEventListener('click', () => {
                const nameCell = rows[i].querySelector('.cryptotable-cell-name');
                if (nameCell) {
                    const coinId = nameCell.getElementsByTagName('span')[0].textContent;
                    this.chartManager.set_coinIds([coinId]);
                }
            });
        }
    }
}