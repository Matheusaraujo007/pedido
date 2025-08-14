import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI; mongodb+srv://matheusaraujo85461:zaUHqFlqVHkMHr4W@cluster0.mongodb.net/pedidos?retryWrites=true&w=majority
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const pedido = req.body;
      const client = await connectToDatabase();
      const db = client.db("pedidos"); // nome do DB
      const collection = db.collection("pedidos"); // nome da coleção

      // Inserir pedido
      const result = await collection.insertOne({
        ...pedido,
        createdAt: new Date()
      });

      res.status(200).json({ message: "Pedido cadastrado com sucesso!", id: result.insertedId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao salvar no MongoDB: " + err.message });
    }
  } else if (req.method === "GET") {
    try {
      const client = await connectToDatabase();
      const db = client.db("pedidos");
      const collection = db.collection("pedidos");

      const pedidos = await collection.find().sort({ createdAt: -1 }).toArray();
      res.status(200).json(pedidos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao buscar pedidos: " + err.message });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
