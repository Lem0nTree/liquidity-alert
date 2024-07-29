const axios = require('axios');

async function fetchCurveData(pool) {
  try {
    const response = await axios.get(`https://api.curve.fi/api/getPools/${pool.network}/${pool.factoryType}`);
    const poolData = response.data.data.poolData.find(p => p.id === pool.id);
    
    if (poolData) {
      return {
        priceOracle: poolData.priceOracle,
        name: pool.name,
        id: pool.id
      };
    } else {
      throw new Error(`Pool ${pool.id} not found in the API response.`);
    }
  } catch (error) {
    throw new Error(`Error fetching Curve data for ${pool.name}: ${error.message}`);
  }
}

module.exports = { fetchCurveData };