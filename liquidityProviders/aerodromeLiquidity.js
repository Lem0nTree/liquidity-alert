const { ethers } = require('ethers');
const aerodromeABI = require('../abi/aerodrome.json');
const contractAddress = "0x68c19e13618C41158fE4bAba1B8fb3A9c74bDb0A";

async function queryAerodrome(rpcUrl, decimaltoken0, decimaltoken1, offset) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, aerodromeABI, provider);
  try {
    const result = await contract.all(1, offset);
    const pool = result[0];

    return {
      symbol: pool.symbol,
      reserve0: ethers.formatUnits(pool.reserve0, parseInt(decimaltoken0)),
      reserve1: ethers.formatUnits(pool.reserve1, parseInt(decimaltoken1)),
      token0: pool.token0,
      token1: pool.token1
    };
  } catch (error) {
    console.error('Error querying Aerodrome contract:', error);
    throw error;
  }
}

module.exports = { queryAerodrome };