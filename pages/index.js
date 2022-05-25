import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react';
import * as Web3 from 'web3';
import validator from 'validator';

export default function Home() {

  const [accountAddress, setAccountAddress] = useState("");
  const [fstTrxSucMsg, setFstTrxSucMsg] = useState("");
  const [scndTrxSucMsg, setScndTrxSucMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [amount, setAmount] = useState("");
  const [networkId, setNetworkId] = useState("");
  const [error, setError] = useState("");
  const [selectInput, setSelectInput] = useState("ETH");
  const [selectOutput, setSelectOutput] = useState("AVAX");
  const [walletBalance, setWalletBalance] = useState({});

  useEffect(() => {
    if (!accountAddress) connectWallet();
    if (accountAddress) getBalance(accountAddress);
  }, [accountAddress]);

  useEffect(()=> {
    /* check network */
    selectInput === "ETH" ? setSelectOutput("AVAX") : setSelectOutput("ETH");

    /* validate amount and balance before funds transfer */
    const isValidAmount = validator.isFloat(amount) && amount != 0;
    if (!isValidAmount && amount) {
      setError("Amount is invalid! Only numeric or decimal values are allowed");
    } else {
        if ((amount*(10**18) > walletBalance.ethTokenBalance) && amount && selectInput === "ETH") {
          setError("Insufficient funds! Please recharge your wallet.");
        } else if ((amount*(10**18) > walletBalance.avxTokenBalance) && amount && selectInput === "AVAX") {
          setError("Insufficient funds! Please buy some tokens first.");
        } else {
          setError("");
        }
    }

    /* check connected network */
    if(networkId == process.env.NEXT_PUBLIC_ETH_NETWORK_ID) {
      setSelectInput("ETH");
    } else if (networkId == process.env.NEXT_PUBLIC_AVAX_NETWORK_ID) {
      setSelectInput("AVAX");
    }
  }, [selectInput, networkId, amount, walletBalance]);

  const getBalance = async (account_address) => {
    try {
      const body = {
        account_address: account_address
      }
      const res = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        const res_json = await res.json();
        setWalletBalance(res_json);
      } else {
        throw new Error(await res.text())
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error)
      setError('An unexpected error occurred:'+error.message);
    }
  };

  const monitorWallet = async () => {
    // Add listeners start
    setError("");
    window.ethereum.on("accountsChanged", (accounts) => {
        accounts[0] === undefined ? window.location.reload() : setAccountAddress(accounts[0]);
    });

    window.ethereum.on("chainChanged", (network) => {
        setNetworkId(parseInt(network));
    });

    window.ethereum.on("connect", () => {
      window.location.reload();
    });

    window.ethereum.on("disconnect", () => {
      window.location.reload();
    });
  };

  const connectWallet = async () => {
    // e.preventDefault();
    // let web3 = new Web3(window.ethereum);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccountAddress(accounts[0]);
      
      const networkId = await window.ethereum.request({
        method: "net_version",
      });
      setNetworkId(parseInt(networkId));

      monitorWallet();
    } catch (exc) {
      setError('An unexpected error occurred:'+exc.message);
      console.log(exc.message);
    }
  };

  const revertTransaction = async () => {
    try {
      var body = {
        input_token: selectOutput,
        output_token: selectInput,
        amount: amount,
        account_address: accountAddress,
        type: "buy",
      };
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 200) {
        const res_json = await res.json();
        selectInput === 'ETH' ? setScndTrxSucMsg("Error occured while submitting your request. Transaction reverted successfully. For more details, please check " + process.env.NEXT_PUBLIC_ETHERSCAN_LINK +"/tx/" + res_json.hash) 
        : setScndTrxSucMsg("Error occured while submitting your request. Transaction reverted successfully. For more details, please check " + process.env.NEXT_PUBLIC_AVAX_LINK +"/tx/" + res_json.hash);
        getBalance(accountAddress);
      } else {
        throw new Error(await res.text())
      }
    } catch (error) {
      console.error(error);
      setError('An unexpected error occurred:'+error.message);
    }
  };

  const submitTransaction = async (transaction) => {
    try {
      const web3 = new Web3(window.ethereum);
      const resp = await web3.eth.sendTransaction(transaction);

      if (resp.status) {
        // var body = {
        //   input_token: selectInput,
        //   output_token: selectOutput,
        //   amount: amount,
        //   account_address: accountAddress,
        //   type: "buy",
        // };
        // const res = await fetch('/api/transfer', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(body),
        // })
        // if (res.status === 200) {
        //   const res_json = await res.json();
          selectInput === 'ETH' ? setFstTrxSucMsg("Transaction submitted successfully. For more details, please check " + process.env.NEXT_PUBLIC_ETHERSCAN_LINK +"/tx/" + resp.transactionHash) 
          : setFstTrxSucMsg("Transaction submitted successfully. For more details, please check " + process.env.NEXT_PUBLIC_AVAX_LINK +"/tx/" + resp.transactionHash);
        //   selectOutput === 'ETH' ? setScndTrxSucMsg("Transaction submitted successfully. For more details, please check " + process.env.NEXT_PUBLIC_ETHERSCAN_LINK +"/tx/" + res_json.hash) 
        //   : setScndTrxSucMsg("Transaction submitted successfully. For more details, please check " + process.env.NEXT_PUBLIC_AVAX_LINK +"/tx/" + res_json.hash);
          getBalance(accountAddress);
        // } else {
        //   revertTransaction();
        //   throw new Error(await res.text())
        // }
      } else {
        throw new Error(await resp.json())
      }
    } catch (exc) {
      setErrorMsg('An unexpected error occurred: '+ exc.message);
      console.error('An unexpected error occurred:', exc)
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault()

    if (errorMsg) setErrorMsg('')
    if (fstTrxSucMsg) setFstTrxSucMsg('')
    if (scndTrxSucMsg) setScndTrxSucMsg('')
    setIsPending(true);
    var body = {
      input_token: selectInput,
      output_token: selectOutput,
      amount: amount,
      account_address: accountAddress,
      type: "sell",
    }

    // const network = selectInput === 'ETH' ? process.env.ETH_NETWORK : process.env.AVX_NETWORK;
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 200) {
        const res_json = await res.json();
        await submitTransaction(res_json);
      } else {
        throw new Error(await res.text())
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error)
      setErrorMsg('An unexpected error occurred: '+ error.message)
    }
    setIsPending(false);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>RMDSTTSwap</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to RMDSTTSwap!
        </h1>

        <p className={styles.description}>
          RMDSTT is a multichain token. You can convert Ethereum RMDSTT with the Avalanche or vice versa. 
          {/* <code className={styles.code}>pages/index.js</code> */}
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            {networkId == process.env.NEXT_PUBLIC_ETH_NETWORK_ID ? 
            <h2>Convert Ethereum RMDSTT to Avalanche RMDSTT</h2>
            : <h2>Convert Avalanche RMDSTT to Ethereum RMDSTT </h2>
            }
            <div>
              {
                accountAddress === "" ? <button className="connect" onClick={connectWallet}>Connect to Metamask!</button>
                : (
                  <div>
                    {/* <div className="balance">Ethereum Account Balance: {(walletBalance.ethAccountBalance/10**18).toFixed(4)} ETH</div>
                    <div className="balance">RMDSET Token Balance: {(walletBalance.ethTokenBalance/10**18).toFixed(4)} RMDSET</div>
                    <div className="balance">Avalanche Account Balance: {(walletBalance.avxAccountBalance/10**18).toFixed(4)} AVX</div>
                    <div className="balance">RMDSAT Token Balance: {(walletBalance.avxTokenBalance/10**18).toFixed(4)} RMDSAT</div> */}
                    <table>
                        <tr>
                            <td className="heading">Ethereum Account Balance</td>
                            <td>{(walletBalance.ethAccountBalance/10**18).toFixed(4)}</td>
                            <td className="heading">ETH</td>
                        </tr>
                        <tr>
                            <td className="heading">RMDSET Token Balance</td>
                            <td>{(walletBalance.ethTokenBalance/10**18).toFixed(4)}</td>
                            <td className="heading">RMDSET</td>
                        </tr>
                        <tr>
                            <td className="heading">Avalanche Account Balance</td>
                            <td>{(walletBalance.avxAccountBalance/10**18).toFixed(4)}</td>
                            <td className="heading">AVAX</td>
                        </tr>
                        <tr>
                            <td className="heading">RMDSAT Token Balance</td>
                            <td>{(walletBalance.avxTokenBalance/10**18).toFixed(4)}</td>
                            <td className="heading">RMDSAT</td>
                        </tr>
                    </table>
                    <br />
                    {/* <h3>Select a chain &darr;</h3> */}
                    {/* <select name="input_token" defaultValue={selectInput} onChange={(e) => setSelectInput(e.target.value)} disabled> */}
                    <select name="input_token" value={selectInput} disabled>
                        <option value="ETH">Ethereum</option>
                        <option value="AVAX">Avalanche</option>
                    </select>
                    <input inputMode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" type="text" minLength="1" maxLength="17" name="input_amount" onChange={(e) => setAmount(e.target.value)} placeholder="0.0" required />
                    <select name="output_token" value={selectOutput} disabled>
                        <option value="ETH">Ethereum</option>
                        <option value="AVAX">Avalanche</option>
                    </select>
                    <input inputMode="decimal" type="text" minLength="1" maxLength="17" name="transfer_amount" value={amount} placeholder="0.0" disabled />
                    <div className="submit">
                        {(networkId == process.env.NEXT_PUBLIC_ETH_NETWORK_ID || networkId == process.env.NEXT_PUBLIC_AVAX_NETWORK_ID) && amount && !isPending && !error ? <button type="submit" onClick={onSubmit}>Submit</button> : <button type="submit" disabled>Submit</button>}
                    </div>
                    {!(networkId == process.env.NEXT_PUBLIC_ETH_NETWORK_ID || networkId == process.env.NEXT_PUBLIC_AVAX_NETWORK_ID) && <p className="error">Token swapping is available only on Ropsten test  network or Avalanche Fuji C-chain network! Change the network.</p>}
                    {error && <p className="error">{error}</p>}
                    {isPending && <p className="error">Transaction is in process. Do not refresh this page!</p>}
                    {fstTrxSucMsg && <p className="success">{fstTrxSucMsg}</p>}
                    {scndTrxSucMsg && <p className="success">{scndTrxSucMsg}</p>}
                    {errorMsg && <p className="error">{errorMsg}</p>}
                  </div>
                )
              }
              <style jsx>{`
                div,
                label,
                select {
                  display: flex;
                  flex-flow: column;
                  font-weight: 600;
                  font-size: large;
                  border:none;
                }
                label > span {
                  font-weight: 600;
                }
                select > option {
                    font-weight: 800;
                    font-size: large;
                  }
                input {
                  padding: 8px;
                  margin: 0.3rem 0 1rem;
                  border: 1px solid #ccc;
                  border-radius: 4px;
                }
                .submit {
                  display: flex;
                  justify-content: flex-end;
                  align-items: center;
                  justify-content: space-between;
                }
                .submit > a {
                  text-decoration: none;
                }
                .submit > button {
                  padding: 0.5rem 1rem;
                  cursor: pointer;
                  background: #fff;
                  border: 1px solid #ccc;
                  border-radius: 4px;
                }
                .submit > button:hover {
                  border-color: #888;
                }
                .error {
                  color: brown;
                  margin: 1rem 0 0;
                }
                .success {
                    color: green;
                    margin: 1rem 0 0;
                }
                .balance {
                    font-size: large;
                    font-weight: 600;
                }
                .heading {
                    font-size: medium;
                    font-weight: 600;
                }
                .connect {
                  align-items: center;
                  justify-content: space-between;
                  border: none;
                  background-color: black;
                  color: white;
                  font-size: large;
                  font-weight: 800;
                  border-radius: 1rem;
                  padding: 10px;
                }
              `}</style>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://www.google.co.in"
          target="_blank"
          rel="noreferrer noopener"
        >
          Powered by SampleUI
        </a>
      </footer>
    </div>
  )
}
