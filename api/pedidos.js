import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function getDB() {
  if (!db) {
    await client.connect();
    db = client.db(); // pega o banco da URI
  }
  return db;
}

export default async function handler(req, res) {
  const database = await getDB();

  if (req.method === "POST") {
    try {
      const pedido = req.body;
      await database.collection("pedidos").insertOne(pedido);
      return res.status(200).json({ message: "Pedido cadastrado com sucesso!" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const pedidos = await database.collection("pedidos").find().sort({ dataPedido: -1 }).toArray();
      return res.status(200).json(pedidos);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: "Método não permitido" });
}
