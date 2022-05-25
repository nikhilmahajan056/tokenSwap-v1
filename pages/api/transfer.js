import { sellFunds, buyFunds } from "../../lib/transfer";

export default async function transfer(req, res) {
  try {
    const transaction = await sellFunds(req.body);
    if (!transaction) throw new Error("transfer failed")
    res.status(200).json(transaction)
    /*
    if(req.body.type === 'sell') {
        const transaction = await sellFunds(req.body);
        if (!transaction) throw new Error("transfer failed")
        res.status(200).json(transaction)
    } else {
        const response = await buyFunds(req.body);
        if (!response) throw new Error("transfer failed")
        res.status(200).json(response)
    }
    */
  } catch (error) {
    console.error(error)
    res.status(500).end('Something went wrong while submitting your transaction. Please try again later!')
  }
}
