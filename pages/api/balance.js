import { getEthTokenBalance, getAvxTokenBalance } from "../../lib/balance";

export default async function balance(req, res) {
  var balance;
  try {
    const ethBalance = await getEthTokenBalance(req.body.account_address);
    const avxBalance = await getAvxTokenBalance(req.body.account_address);
    balance = {
        ethAccountBalance: ethBalance.ethAccountBalance,
        ethTokenBalance: ethBalance.ethTokenBalance,
        avxAccountBalance: avxBalance.avxAccountBalance,
        avxTokenBalance: avxBalance.avxTokenBalance
    };
    res.status(200).json(balance)
  } catch (error) {
    console.error(error)
    res.status(500).end('Something went wrong while submitting your transaction. Please try again later!')
  }
}
