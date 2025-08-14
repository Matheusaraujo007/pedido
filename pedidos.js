import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
const dbName = "pedidos"; // nome do banco

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("pedidos");

    if (req.method === "POST") {
      const pedido = req.body;
      const result = await collection.insertOne(pedido);
      res.status(200).json({ message: "Pedido cadastrado", id: result.insertedId });
    } else if (req.method === "GET") {
      const pedidos = await collection.find({}).sort({ dataPedido: -1 }).toArray();
      res.status(200).json(pedidos);
    } else {
      res.status(405).json({ error: "Método não permitido" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
