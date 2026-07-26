/* =========================================================
   HUOKAING THARA TRADING SYSTEM - REDIRECT MARKET CONTROLLER
========================================================= */

(() => {
    "use strict";

    // Tracking 30 Cryptocurrencies (Top 30 Market Capitalization Assets)
    const cryptoIds = "bitcoin,ethereum,binancecoin,ripple,solana,cardano,dogecoin,avalanche-2,chainlink,polkadot,polygon,shiba-inu,uniswap,litecoin,cosmos,stellar,monero,bitcoin-cash,near,aptos,filecoin,arbitrum,render,optimism,vechain,hedera,sui,cosmos,thorchain,injective";
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds}&order=market_cap_desc&per_page=30&page=1&sparkline=false`;

    const tableBody = document.getElementById("cryptoTableBody");
    const totalVolumeEl = document.getElementById("totalVolume");

    /**
     * Fetch live market data for 30 assets from public API
     */
    async function fetchCryptoMarkets() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Network response failed");
            const data = await response.json();
            
            renderMarketTable(data);
        } catch (err) {
            console.error("[MARKET ERROR] Failed to fetch prices:", err);
        }
    }

    /**
     * Render 30 assets into the Binance-style table
     */
    function renderMarketTable(coins) {
        if (!tableBody) return;
        tableBody.innerHTML = "";

        let cumulativeVolume = 0;

        coins.forEach(coin => {
            cumulativeVolume += coin.total_volume || 0;
            const isPositive = coin.price_change_percentage_24h >= 0;
            const changeClass = isPositive ? "price-up" : "price-down";
            const changeSign = isPositive ? "+" : "";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <div class="asset-info">
                        <img src="${coin.image}" alt="${coin.name}" width="24" height="24">
                        <span>${coin.name}</span>
                        <span class="asset-symbol">${coin.symbol.toUpperCase()}</span>
                    </div>
                </td>
                <td>$${coin.current_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}</td>
                <td class="${changeClass}">${changeSign}${coin.price_change_percentage_24h?.toFixed(2)}%</td>
                <td>$${coin.total_volume.toLocaleString()}</td>
                <td>
                    <div class="btn-trade-group">
                        <button class="btn-buy" data-coin="${coin.symbol.toUpperCase()}" data-action="buy">Buy</button>
                        <button class="btn-sell" data-coin="${coin.symbol.toUpperCase()}" data-action="sell">Sell</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        if (totalVolumeEl) {
            totalVolumeEl.textContent = `$${cumulativeVolume.toLocaleString()}`;
        }

        attachTradeListeners();
    }

    /**
     * Handle Buy/Sell button redirects to banking modules
     */
    function attachTradeListeners() {
        const buttons = document.querySelectorAll(".btn-buy, .btn-sell");
        buttons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const coinSymbol = e.target.getAttribute("data-coin");
                const actionType = e.target.getAttribute("data-action");

                if (actionType === "buy") {
                    // Redirect to deposit page with asset symbol parameter
                    window.location.href = `https://tharahuokaing.github.io/deposit/?asset=${coinSymbol}`;
                } else if (actionType === "sell") {
                    // Redirect to withdrawal page with asset symbol parameter
                    window.location.href = `https://tharahuokaing.github.io/withdrawal/?asset=${coinSymbol}`;
                }
            });
        });
    }

    // Initialize and poll live prices every 15 seconds
    document.addEventListener("DOMContentLoaded", () => {
        fetchCryptoMarkets();
        setInterval(fetchCryptoMarkets, 15000);
    });

})();
