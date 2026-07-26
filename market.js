/* =========================================================
   HUOKAING THARA TRADING SYSTEM - LIVE MARKET CONTROLLER
========================================================= */

(() => {
    "use strict";

    // Track 10 Assets: Bitcoin, Ethereum, eCash + 7 more (Ripple, Cardano, Solana, Dogecoin, Avalanche, Chainlink, Polkadot)
    const cryptoIds = "bitcoin,ethereum,ecash,ripple,cardano,solana,dogecoin,avalanche-2,chainlink,polkadot";
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds}&order=market_cap_desc&per_page=10&page=1&sparkline=false`;

    const tableBody = document.getElementById("cryptoTableBody");
    const totalVolumeEl = document.getElementById("totalVolume");
    const tradeModal = document.getElementById("tradeModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const closeModalBtn = document.getElementById("closeModalBtn");

    /**
     * Fetch live market data from public API
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
     * Render assets into the Binance-style table
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

        // Attach event listeners to newly rendered buttons
        attachTradeListeners();
    }

    /**
     * Handle Binance-style Buy/Sell button triggers
     */
    function attachTradeListeners() {
        const buttons = document.querySelectorAll(".btn-buy, .btn-sell");
        buttons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const coinName = e.target.getAttribute("data-coin");
                const actionType = e.target.getAttribute("data-action");

                if (modalTitle && modalDesc && tradeModal) {
                    modalTitle.textContent = `${actionType} Order: ${coinName}`;
                    modalDesc.textContent = `Successfully placed simulated limit order for ${coinName} on the live order book node.`;
                    tradeModal.style.display = "flex";
                }
            });
        });
    }

    // Close modal event
    if (closeModalBtn && tradeModal) {
        closeModalBtn.addEventListener("click", () => {
            tradeModal.style.display = "none";
        });
    }

    // Initialize and poll live prices every 15 seconds
    document.addEventListener("DOMContentLoaded", () => {
        fetchCryptoMarkets();
        setInterval(fetchCryptoMarkets, 15000);
    });

})();
