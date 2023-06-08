export class TableManager {
    constructor(tableId) {
        this.tableId = tableId;
        this.headers = [];
        this.body = [];
    }

    setHeaders(headers) {
        this.headers = headers;
    }

    setBody(body) {
        this.body = body;
    }

    renderHeader(thead = null) {
        const table = document.getElementById(this.tableId);
        const headerSection = thead || table.createTHead();
        const row = headerSection.insertRow();

        for (let header of this.headers) {
            const cell = document.createElement('th');
            cell.innerHTML = header;
            row.appendChild(cell);
        }

        return headerSection;
    }

    renderBody(tbody = null) {
        const table = document.getElementById(this.tableId);
        const bodySection = tbody || table.createTBody();

        for (let rowData of this.body) {
            const row = bodySection.insertRow();

            for (let header of this.headers) {
                const cell = row.insertCell();
                const headerKey = header.replace(/\+/g, '');
                cell.innerHTML = rowData[headerKey];
            }
        }

        return bodySection;
    }
}
