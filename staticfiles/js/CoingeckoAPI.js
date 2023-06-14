const BASEURL = '/';

export class CoingeckoAPI{
    static async get_market_coins(){
        const response = await fetch(`${BASEURL}get_market_coins`);
        const data = await response.json();
        return {response, data};
    }

    static async get_market_chart(coinId, days=1){
        const response = await fetch(`${BASEURL}get_market_chart/?coinid=${coinId}&days=${days}`);
        const data = await response.json();
        return {response, data};
    }
}