const ethers = require('ethers');
const aerodromeABI = require('./abi/aerodrome.json');

async function fetchAerodromeData(pool) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(pool.rpcUrl);
    const contract = new ethers.Contract(pool.contractAddress, aerodromeABI, provider);

    const poolData = await contract.all(1, 0);  // Fetch first pool data
    
    if (poolData && poolData.length > 0) {
      const data = poolData[0];
      const reserve0 = ethers.utils.formatUnits(data.reserve0, data.decimals);
      const reserve1 = ethers.utils.formatUnits(data.reserve1, data.decimals);
      const priceOracle = parseFloat(reserve1) / parseFloat(reserve0);

      return {
        priceOracle,
        name: pool.name,
        id: pool.id
      };
    } else {
      throw new Error(`Pool data not found for ${pool.name}`);
    }
  } catch (error) {
    throw new Error(`Error fetching Aerodrome data for ${pool.name}: ${error.message}`);
  }
}

module.exports = { fetchAerodromeData };