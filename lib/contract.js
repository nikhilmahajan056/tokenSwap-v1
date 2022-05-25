import { MongoClient } from "mongodb";

export async function getContractDetails(contract_type) {
    // Here you should create the wallet and save the salt and hashed privatekey and mnemonic (some dbs may have
    // authentication methods that will do it for you so you don't have to worry about it):
  
    var response;
    try {
        const filter = {
            contract_type : contract_type
        };
        const client = await MongoClient.connect(process.env.DB_URL);
        const db = await client.db(process.env.DB_NAME);
        const resp = await db.collection('contracts').findOne(filter);
        response = await resp;       
        client.close();
        if (response) return response;
    } catch (exc) {
      console.log(exc)
    }
  
    // return
  }