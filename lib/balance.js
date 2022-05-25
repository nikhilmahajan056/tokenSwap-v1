import * as Web3 from "web3";
import { getContractDetails } from "./contract"

export async function getEthTokenBalance(account_address) {
    var balance;
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_ETH_NETWORK));
    const ethAccountBalance = await web3.eth.getBalance(account_address);
    
    const contract = await getContractDetails("ethToken")
    const abi = await contract.contract_abi;
    const contract_address = await contract.contract_address;
    const smartContract = new web3.eth.Contract(abi, contract_address);
    const ethTokenBalance = await smartContract.methods.balanceOf(account_address).call();
    balance = {
        ethAccountBalance: ethAccountBalance,
        ethTokenBalance : ethTokenBalance,
    };
    return balance
  } catch (error) {
    console.error(error)
  }
  return
}

export async function getAvxTokenBalance(account_address) {
    var balance;
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_AVX_NETWORK));
    const avxAccountBalance = await web3.eth.getBalance(account_address);
    
    const contract = await getContractDetails("avxToken")
    const abi = await contract.contract_abi;
    const contract_address = await contract.contract_address;
    const smartContract = new web3.eth.Contract(abi, contract_address);
    const avxTokenBalance = await smartContract.methods.balanceOf(account_address).call();
    balance = {
        avxAccountBalance: avxAccountBalance,
        avxTokenBalance : avxTokenBalance,
    };
    return balance
  } catch (error) {
    console.error(error)
  }
  return
}