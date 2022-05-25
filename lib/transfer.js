import * as Web3 from "web3";
import { getContractDetails } from "./contract"

export async function sellFunds(params) {
    try {
        const network = params.input_token === 'ETH' ? process.env.NEXT_PUBLIC_ETH_NETWORK : process.env.NEXT_PUBLIC_AVX_NETWORK;
        var contract, contract_address, abi, smartContract, gasUsage, gasPrice, transaction;
        const web3 = new Web3(new Web3.providers.HttpProvider(network));
        if(params.input_token === 'ETH') {
            contract = await getContractDetails("ethBank")
            abi = await contract.contract_abi;
            contract_address = await contract.contract_address;
            smartContract = new web3.eth.Contract(abi, contract_address);
            gasPrice = await web3.eth.getGasPrice();
            gasUsage = await smartContract.methods.sell(web3.utils.toWei(params.amount.toString(), "ether")).estimateGas({from: params.account_address, value:300000*gasPrice});
            transaction = {
                from: params.account_address,
                to: contract_address,
                value: Math.ceil(gasPrice*gasUsage*4),
                data: smartContract.methods.sell(web3.utils.toWei(params.amount.toString(), "ether")).encodeABI()
            };
        } else {
            contract = await getContractDetails("avxBank")
            abi = await contract.contract_abi;
            contract_address = await contract.contract_address;
            smartContract = new web3.eth.Contract(abi, contract_address);
            gasPrice = await web3.eth.getGasPrice();
            gasUsage = await smartContract.methods.sell(web3.utils.toWei(params.amount.toString(), "ether")).estimateGas({from: params.account_address, value:300000*gasPrice});
            transaction = {
                from: params.account_address,
                to: contract_address,
                value: Math.ceil(gasPrice*gasUsage*4),
                data: smartContract.methods.sell(web3.utils.toWei(params.amount.toString(), "ether")).encodeABI()
            };
        }
        return transaction;
    } catch (exc) {
        console.log(exc);
    }
    return
}

/*
export async function buyFunds(params) {
    try {
        const network = params.output_token === 'ETH' ? process.env.NEXT_PUBLIC_ETH_NETWORK : process.env.NEXT_PUBLIC_AVX_NETWORK;
        var contract, contract_address, abi, smartContract, gasUsage, gasPrice, transaction, response;
        const web3 = new Web3(new Web3.providers.HttpProvider(network));
        if(params.output_token === 'ETH') {
            contract = await getContractDetails("ethBank")
            abi = await contract.contract_abi;
            contract_address = await contract.contract_address;
            smartContract = new web3.eth.Contract(abi, contract_address);
            gasPrice = await web3.eth.getGasPrice();
            gasUsage = await smartContract.methods.buy(params.account_address,web3.utils.toWei(params.amount.toString(), "ether")).estimateGas({from: process.env.BRIDGE_WALLET_ACCOUNT_ADDRESS});
            transaction = {
                gas: gasUsage*5,
                from: process.env.BRIDGE_WALLET_ACCOUNT_ADDRESS,
                to: contract_address,
                data: smartContract.methods.buy(params.account_address,web3.utils.toWei(params.amount.toString(), "ether")).encodeABI()
            };
        } else {
            contract = await getContractDetails("avxBank")
            abi = await contract.contract_abi;
            contract_address = await contract.contract_address;
            smartContract = new web3.eth.Contract(abi, contract_address);
            gasPrice = await web3.eth.getGasPrice();
            gasUsage = await smartContract.methods.buy(params.account_address,web3.utils.toWei(params.amount.toString(), "ether")).estimateGas({from: process.env.BRIDGE_WALLET_ACCOUNT_ADDRESS});
            transaction = {
                gas: gasUsage*5,
                from: process.env.BRIDGE_WALLET_ACCOUNT_ADDRESS,
                to: contract_address,
                data: smartContract.methods.buy(params.account_address,web3.utils.toWei(params.amount.toString(), "ether")).encodeABI()
            };
        }
        const signedTx = await web3.eth.accounts.signTransaction(transaction, process.env.BRIDGE_WALLET_PRIVATE_KEY);
        console.log("signedTx is:", signedTx);
        // const hash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        response = {
            hash: signedTx.transactionHash,
        };
        return response;
    } catch (exc) {
        console.log(exc);
    }
}
*/