import { MongoClient } from "mongodb";

let client;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    client = client || new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const db = client.db("pedidos");
    const pedidosCollection = db.collection("pedidos");

    const pedido = req.body;
    if (!pedido.vendedor || !pedido.nomeCliente) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    await pedidosCollection.insertOne(pedido);

    res.status(200).json({ message: "✅ Pedido salvo com sucesso!" });
  } catch (error) {
    console.error("Erro API:", error);
    res.status(500).json({ error: error.message });
  }
}
