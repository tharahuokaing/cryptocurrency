/* =========================================================
   HUOKAING THARA TRADING SYSTEM - MARKET CONTROLLER
========================================================= */

(() => {
    "use strict";

    // Tracking 30 Cryptocurrencies (Top 30 Market Capitalization Assets)
    const cryptoIds = "bitcoin,ethereum,binancecoin,ripple,solana,cardano,dogecoin,avalanche-2,chainlink,polkadot,polygon,shiba-inu,uniswap,litecoin,cosmos,stellar,monero,bitcoin-cash,near,aptos,filecoin,arbitrum,render,optimism,vechain,hedera,sui,cosmos,thorchain,injective";
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds}&order=market_cap_desc&per_page=30&page=1&sparkline=false`;

    const tableBody = document.getElementById("cryptoTableBody");
    const totalVolumeEl = document.getElementById("totalVolume");
    const tradeModal = document.getElementById("tradeModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const closeModalBtn = document.getElementById("closeModalBtn");

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
                        <button class="btn-buy" data-coin="${coin.name}" data-action="Buy">Buy</button>
                        <button class="btn-sell" data-coin="${coin.name}" data-action="Sell">Sell</button>
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
     * Handle Binance-style Buy (Modal) and Sell (Redirect) triggers
     */
    function attachTradeListeners() {
        // Buy button listener (keeps modal action)
        const buyButtons = document.querySelectorAll(".btn-buy");
        buyButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const coinName = e.target.getAttribute("data-coin");

                if (modalTitle && modalDesc && tradeModal) {
                    modalTitle.textContent = `Buy Order: ${coinName}`;
                    modalDesc.textContent = `Successfully placed simulated limit buy order for ${coinName} on the live order book node.`;
                    tradeModal.style.display = "flex";
                }
            });
        });

        // Sell button listener (redirects directly to your withdrawal portal with query params)
        const sellButtons = document.querySelectorAll(".btn-sell");
        sellButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const coinName = e.target.getAttribute("data-coin");
                console.log(`[TRADE ROUTER] Initiating sell order redirect for ${coinName}...`);
                
                // Immediate redirect to withdrawal URL carrying the asset payload
                window.location.href = `https://tharahuokaing.github.io/withdrawal/?asset=${encodeURIComponent(coinName)}&action=sell`;
            });
        });
    }

    if (closeModalBtn && tradeModal) {
        closeModalBtn.addEventListener("click", () => {
            tradeModal.style.display = "none";
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        fetchCryptoMarkets();
        setInterval(fetchCryptoMarkets, 15000);
    });

})();
