const axios = require('axios');

async function queryCurve(pool) {
  try {
    const response = await axios.get(`https://api.curve.fi/api/getPools/${pool.network}/${pool.factoryType}`);
    const poolData = response.data.data.poolData.find(p => p.id === pool.id);
    if (poolData) {
      const token0 = poolData.coins[0];
      const token1 = poolData.coins[1];

      const token0Decimals = parseInt(token0.decimals, 10);
      const token1Decimals = parseInt(token1.decimals, 10);

      const token0Reserve = parseFloat(token0.poolBalance) / Math.pow(10, token0Decimals);
      const token1Reserve = parseFloat(token1.poolBalance) / Math.pow(10, token1Decimals);

      const virtualPrice = parseFloat(poolData.virtualPrice) / Math.pow(10, 18);

      return {
        priceOracle: virtualPrice,
        name: pool.name,
        id: pool.id,
        reserve0: token0Reserve,
        reserve1: token1Reserve,
        token0: token0.symbol,
        token1: token1.symbol
      };
    } else {
      throw new Error(`Pool ${pool.id} not found in the API response.`);
    }
  } catch (error) {
    throw new Error(`Error fetching Curve data for ${pool.name}: ${error.message}`);
  }
}

module.exports = { queryCurve };