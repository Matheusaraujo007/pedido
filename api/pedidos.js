import { MongoClient } from "mongodb";

let client;

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Conectar ao MongoDB
      client = client || new MongoClient("mongodb+srv://matheusaraujo85461:zaUHqFlqVHkMHr4W@cluster0.mongodb.net/pedidos?retryWrites=true&w=majority");
      await client.connect();

      const db = client.db("pedidos"); // nome do DB
      const pedidosCollection = db.collection("pedidos"); // nome da collection

      const pedido = req.body;

      // Inserir no MongoDB
      await pedidosCollection.insertOne(pedido);

      res.status(200).json({ message: "✅ Pedido salvo com sucesso!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
