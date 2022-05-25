import { sellFunds } from "../../lib/transfer";

export default async function transfer(req, res) {
  try {
    const transaction = await sellFunds(req.body);
    if (!transaction) throw new Error("transfer failed")
    res.status(200).json(transaction)
  } catch (error) {
    console.error(error)
    res.status(500).end('Something went wrong while submitting your transaction. Please try again later!')
  }
}
