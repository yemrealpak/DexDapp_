import { ethers, BigNumber } from "ethers";
import { useAccount, useBalance, useNetwork, erc20ABI } from "wagmi";
import {
  routerAddress,
  routerABI,
  factoryAddress,
  factoryABI,
  pairABI,
} from "../contract";
import moment from "moment";

export const fetchInfo = async (currentAddress, currentSigner) => {
  if (!currentAddress) return;
  const contract = new ethers.Contract(currentAddress, erc20ABI, currentSigner);
  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const totalSupply = await contract.totalSupply();
  const balance = await contract.balanceOf(currentSigner.address);
  return { name, symbol, decimals, totalSupply, balance };
};

export const fetchBalance = async (address, currentSigner, tokenAddress) => {
  if (!currentSigner) return;

  const contract = new ethers.Contract(tokenAddress, erc20ABI, currentSigner);
  const balance = await contract.balanceOf(address);
  return ethers.utils.formatUnits(balance, 18);
};

export const fetchAllowance = async (
  currentAddress,
  spender,
  currentSigner
) => {
  if (!currentAddress) return;
  const contract = new ethers.Contract(currentAddress, erc20ABI, currentSigner);
  const allowance = await contract.allowance(currentSigner.address, spender);
  return allowance;
};

export const fetchPrice = async (
  currentAddress,
  currentSigner,
  tokenFirst,
  tokenSecond
) => {
  if (currentSigner) {
    const factoryContract = new ethers.Contract(
      factoryAddress,
      factoryABI,
      currentSigner
    );
    const pairAddress = await factoryContract.getPair(tokenFirst, tokenSecond);
    const pairContract = new ethers.Contract(
      pairAddress,
      pairABI,
      currentSigner
    );
    const reserves = await pairContract.getReserves();

    const token0 = await pairContract.token0();
    const token1 = await pairContract.token1();

    const token0Contract = new ethers.Contract(token0, erc20ABI, currentSigner);
    const token1Contract = new ethers.Contract(token1, erc20ABI, currentSigner);

    const token0Decimals = await token0Contract.decimals();
    const token1Decimals = await token1Contract.decimals();

    const token0Reserve = reserves[0] / BigNumber.from(10).pow(token0Decimals);
    const token1Reserve = reserves[1] / BigNumber.from(10).pow(token1Decimals);

    const price = token0Reserve / token1Reserve;
    return price;
  }
  return 0;
};

export const fetchAmountsOut = async (
  token1,
  token2,
  amountIn,
  currentSigner
) => {
  if (currentSigner) {
    const routerContract = new ethers.Contract(
      routerAddress,
      routerABI,
      currentSigner
    );
    const amountsOut = await routerContract.getAmountsOut(amountIn, [
      token1,
      token2,
    ]);
    return amountsOut;
  }
  return amountIn;
};

export const getAmountsOut = (reserve0, reserve1, amountIn) => {

  const amountInWithFee = amountIn * 9975;
  const numerator = amountInWithFee * reserve1;
  const denominator = reserve0 * 10000 + amountInWithFee;
  const amountOut = numerator / denominator;
  return amountOut;
};

export const getAmountsIn = (reserve0, reserve1, amountOut) => {
  const numerator = reserve0 * amountOut * 10000;
  const denominator = reserve1 - amountOut * 9975;
  const amountIn = numerator / denominator + 1;
  return amountIn;
};
export const getReservess = async (currentSigner, token1, token2) => {
  if (currentSigner) {
    const factoryContract = new ethers.Contract(
      factoryAddress,
      factoryABI,
      currentSigner
    );

    const pairAddress = await factoryContract.getPair(token1, token2);

    const pairContract = new ethers.Contract(
      pairAddress,
      pairABI,
      currentSigner
    );

    let reserves = [];
    try {
      reserves = await pairContract.getReserves();
    } catch (e) {
      console.log("error", e);
    }

    const reserve = {
      reserve0: ethers.utils.formatUnits(reserves[0], 0),
      reserve1: ethers.utils.formatUnits(reserves[1], 0),
    };

    return [reserve.reserve0, reserve.reserve1];
  }
  return [0, 0];
};

export const buyTokens = async (
  amount,
  buyerToken,
  sellerToken,
  amountIn,
  amountOut,
  slippage,
  address,
  currentSigner
) => {
  if (currentSigner) {
    const routerContract = new ethers.Contract(
      routerAddress,
      routerABI,
      currentSigner
    );
    const amountOutMin = amountOut - (amountOut * slippage) / 100;
    const path = [buyerToken.address, sellerToken.address];
    const to = address;
    const deadline = moment().add(86400, "seconds");
    const tx = await routerContract.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      path,
      to,
      deadline
    );
    const receipt = await tx.wait();

    return receipt;
  }
};

export const sellTokensETH = async (
  amountOut,
  address,
  slippage,
  buyerToken,
  sellerToken,
  amountIn,
  amountOutMin,
  currentSigner
) => {
  const routerContract = new ethers.Contract(
    routerAddress,
    routerABI,
    currentSigner
  );
  const amountInMax = amountInMax - (amountInMax * slippage) / 100;
  const path = [buyerToken.address, sellerToken.address];
  const to = address;
  const deadline = moment().add(86400, "seconds");
  const tx = await routerContract.swapExactTokensForETH(
    amountIn,
    amountOutMin,
    path,
    to,
    deadline
  );
  const receipt = await tx.wait();

};

export const buyTokensWithETH = async (
  amount,
  buyerToken,
  sellerToken,
  amountIn,
  amountOut,
  slippage,
  address,
  currentSigner
) => {
  const routerContract = new ethers.Contract(
    routerAddress,
    routerABI,
    currentSigner
  );
  const amountOutMin = amountOut - (amountOut * slippage) / 100;
  const path = [buyerToken.address, sellerToken.address];
  const to = address;
  const deadline = moment().add(86400, "seconds");
  const value = amountIn;
  const tx = await routerContract.swapExactETHForTokens(
    amountOutMin,
    path,
    to,
    deadline,
    { value: value }
  );
  const receipt = await tx.wait();

};

export const swapExactETHForTokensSupportingFeeOnTransferTokens = async (
  amountOut,
  address,
  buyerToken,
  sellerToken,
  amountIn,
  currentSigner
) => {
  const routerContract = new ethers.Contract(
    routerAddress,
    routerABI,
    currentSigner
  );
  const path = [sellerToken, buyerToken];
  const to = address;
  const deadline = moment().add(86400, "seconds").unix();
  const value = amountIn._hex;
  const tx =
    await routerContract.swapExactETHForTokensSupportingFeeOnTransferTokens(
      amountOut._hex.toString(10),
      path,
      to,
      deadline,
      { value: value.toString(10) }
    );
  const receipt = await tx.wait();

};

export const swapExactTokensForETHSupportingFeeOnTransferTokens = async (
  amountIn,
  address,
  buyerToken,
  sellerToken,
  amountOut,
  currentSigner
) => {
  const routerContract = new ethers.Contract(
    routerAddress,
    routerABI,
    currentSigner
  );
  const path = [sellerToken, buyerToken];
  const to = address;
  const deadline = moment().add(86400, "seconds").unix();
  const tx =
    await routerContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
      amountIn,
      amountOut,
      path,
      to,
      deadline
    );
  const receipt = await tx.wait();

};

export const swapExactTokensForTokensSupportingFeeOnTransferTokens = async (
  amountOut,
  address,
  slippage,
  buyerToken,
  sellerToken,
  amountIn,
  amount,
  currentSigner
) => {
  const routerContract = new ethers.Contract(
    routerAddress,
    routerABI,
    currentSigner
  );
  const amountOutMin = amountOut - (amountOut * slippage) / 100;
  const path = [buyerToken.address, sellerToken.address];
  const to = address;
  const deadline = moment().add(86400, "seconds");
  const tx =
    await routerContract.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      amountIn,
      amountOutMin,
      path,
      to,
      deadline
    );
  const receipt = await tx.wait();

};

export const addLiquidity = async (
  amount0,
  amount1,
  address,
  slippage,
  buyerToken,
  sellerToken,
  amountIn,
  amountOut,
  currentSigner
) => {
  if (currentSigner) {
    const routerContract = new ethers.Contract(
      routerAddress,
      routerABI,
      currentSigner
    );
    const amountADesired = amount0;
    const amountBDesired = amount1;
    const amountAMin = 0;
    const amountBMin = 0;
    const to = address;
    const deadline = moment().add(86400, "seconds");
    const tx = await routerContract.addLiquidity(
      buyerToken.address,
      sellerToken.address,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      to,
      deadline
    );
    const receipt = await tx.wait();
    return receipt;
  }
  return null;
};

export const addLiquidityETH = async (
  amount0,
  amount1,
  address,
  slippage,
  buyerToken,
  sellerToken,
  amountIn,
  amountOut,
  currentSigner
) => {
  if (currentSigner) {
    const routerContract = new ethers.Contract(
      routerAddress,
      routerABI,
      currentSigner
    );
    const amountTokenDesired = amount0;
    const amountTokenMin = 0;
    const amountETHMin = 0;
    const to = address;
    const deadline = moment().add(86400, "seconds");
    const value = amount1;
    const tx = await routerContract.addLiquidityETH(
      buyerToken.address,
      amountTokenDesired,
      amountTokenMin,
      amountETHMin,
      to,
      deadline,
      { value: value }
    );
    const receipt = await tx.wait();

    return receipt;
  }
  return null;
};

export const removeLiquidity = async (
  amount0,
  amount1,
  address,
  slippage,
  buyerToken,
  sellerToken,
  amountIn,
  amountOut,
  currentSigner
) => {
  const routerContract = new ethers.Contract(
    routerAddress,
    routerABI,
    currentSigner
  );
  const liquidity = amount0;
  const amountAMin = 0;
  const amountBMin = 0;
  const to = address;
  const deadline = moment().add(86400, "seconds");
  const tx = await routerContract.removeLiquidity(
    buyerToken.address,
    sellerToken.address,
    liquidity,
    amountAMin,
    amountBMin,
    to,
    deadline
  );
  const receipt = await tx.wait();
};

export const removeLiquidityETH = async (
  amount0,
  amount1,
  address,
  slippage,
  buyerToken,
  sellerToken,
  amountIn,
  amountOut,
  currentSigner
) => {
  const routerContract = new ethers.Contract(
    routerAddress,
    routerABI,
    currentSigner
  );
  const liquidity = amount0;
  const amountTokenMin = 0;
  const amountETHMin = 0;
  const to = address;
  const deadline = moment().add(86400, "seconds");
  const tx = await routerContract.removeLiquidityETH(
    buyerToken.address,
    liquidity,
    amountTokenMin,
    amountETHMin,
    to,
    deadline
  );
  const receipt = await tx.wait();

};

export const removeLiquidityWithPermit = async (
  amount0,
  amount1,
  address,
  slippage,
  buyerToken,
  sellerToken,
  amountIn,
  amountOut,
  currentSigner
) => {
  const routerContract = new ethers.Contract(
    routerAddress,
    routerABI,
    currentSigner
  );
  const liquidity = amount0;
  const amountAMin = 0;
  const amountBMin = 0;
  const to = address;
  const deadline = moment().add(86400, "seconds");
  const approveMax = true;
  const v = 0;
  const r = 0;
  const s = 0;
  const tx = await routerContract.removeLiquidityWithPermit(
    buyerToken.address,
    sellerToken.address,
    liquidity,
    amountAMin,
    amountBMin,
    to,
    deadline,
    approveMax,
    v,
    r,
    s
  );
  const receipt = await tx.wait();
};

export const removeLiquidityETHWithPermit = async (
  amount0,
  amount1,
  address,
  slippage,
  buyerToken,
  sellerToken,
  amountIn,
  amountOut,
  currentSigner
) => {
  const routerContract = new ethers.Contract(
    routerAddress,
    routerABI,
    currentSigner
  );
  const liquidity = amount0;
  const amountTokenMin = 0;
  const amountETHMin = 0;
  const to = address;
  const deadline = moment().add(86400, "seconds");
  const approveMax = true;
  const v = 0;
  const r = 0;
  const s = 0;
  const tx = await routerContract.removeLiquidityETHWithPermit(
    buyerToken.address,
    liquidity,
    amountTokenMin,
    amountETHMin,
    to,
    deadline,
    approveMax,
    v,
    r,
    s
  );
  const receipt = await tx.wait();
};

export const removeLiquidityETHSupportingFeeOnTransferTokens = async (
  amount0,
  amount1,
  address,
  slippage,
  buyerToken,
  sellerToken,
  amountIn,
  amountOut,
  currentSigner
) => {
  const routerContract = new ethers.Contract(
    routerAddress,
    routerABI,
    currentSigner
  );
  const liquidity = amount0;
  const amountTokenMin = 0;
  const amountETHMin = 0;
  const to = address;
  const deadline = moment().add(86400, "seconds");
  const tx =
    await routerContract.removeLiquidityETHSupportingFeeOnTransferTokens(
      buyerToken.address,
      liquidity,
      amountTokenMin,
      amountETHMin,
      to,
      deadline
    );
  const receipt = await tx.wait();

};

export const removeLiquidityETHWithPermitSupportingFeeOnTransferTokens = async (
  amount0,
  amount1,
  address,
  slippage,
  buyerToken,
  sellerToken,
  amountIn,
  amountOut,
  currentSigner
) => {
  const routerContract = new ethers.Contract(
    routerAddress,
    routerABI,
    currentSigner
  );
  const liquidity = amount0;
  const amountTokenMin = 0;
  const amountETHMin = 0;
  const to = address;
  const deadline = moment().add(86400, "seconds");
  const approveMax = true;
  const v = 0;
  const r = 0;
  const s = 0;
  const tx =
    await routerContract.removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
      buyerToken.address,
      liquidity,
      amountTokenMin,
      amountETHMin,
      to,
      deadline,
      approveMax,
      v,
      r,
      s
    );
  const receipt = await tx.wait();

};

export const approve = async (
  tokenAddress,
  spenderAddress,
  amount,
  currentSigner
) => {
  const tokenContract = new ethers.Contract(
    tokenAddress,
    erc20ABI,
    currentSigner
  );
  const tx = await tokenContract.approve(spenderAddress, amount);
  const receipt = await tx.wait();

};

export const getPriceImpact = (amount, reserve) => {
  const priceImpactAmount = amount * 0.9975;

  const priceImpact = (priceImpactAmount * 100) / (Number(reserve) + priceImpactAmount);

  return priceImpact;
};