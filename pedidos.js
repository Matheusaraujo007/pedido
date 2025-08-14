import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
const dbName = "pedidos"; // nome do banco de dados no Atlas

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("pedidos");

    if (req.method === "POST") {
      const pedido = req.body;
      if (!pedido || !pedido.vendedor) {
        return res.status(400).json({ error: "Dados do pedido inválidos." });
      }

      const result = await collection.insertOne(pedido);
      return res.status(200).json({ message: "Pedido cadastrado com sucesso!", id: result.insertedId });
    }

    if (req.method === "GET") {
      const pedidos = await collection.find({}).sort({ dataPedido: -1 }).toArray();
      return res.status(200).json(pedidos);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}
