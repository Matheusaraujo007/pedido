// pages/api/pedidos.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI; // variável de ambiente no Vercel
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const pedido = req.body;
    try {
      await client.connect();
      const db = client.db("sistemaPedidos"); // nome do seu DB
      const collection = db.collection("pedidos");
      const result = await collection.insertOne(pedido);
      res.status(200).json({ message: "Pedido cadastrado!", data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
