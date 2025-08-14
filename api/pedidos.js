import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI; // coloque no Vercel Environment Variables
let client;

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      client = client || new MongoClient(uri);
      await client.connect();
      const db = client.db("meusPedidos");
      const pedidosCollection = db.collection("pedidos");
      const pedido = req.body;

      await pedidosCollection.insertOne(pedido);
      res.status(200).json({ message: "Pedido salvo com sucesso!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao salvar pedido no MongoDB" });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
