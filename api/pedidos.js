import { MongoClient } from "mongodb";

// Variáveis de ambiente (crie no Vercel Dashboard)
const uri = process.env.MONGO_URI; // ex: mongodb+srv://usuario:senha@cluster0.wwjqqfc.mongodb.net/meubanco?retryWrites=true&w=majority
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await client.connect();
      const db = client.db("pedidosDB"); // Nome do banco
      const collection = db.collection("pedidos");

      const pedido = req.body;

      // Validação mínima
      if (!pedido.vendedor || !pedido.nomeCliente) {
        return res.status(400).json({ error: "Dados do pedido incompletos." });
      }

      const result = await collection.insertOne(pedido);

      res.status(200).json({ message: "Pedido cadastrado com sucesso!", id: result.insertedId });
    } catch (err) {
      console.error("Erro ao cadastrar pedido:", err.message);
      res.status(500).json({ error: "Erro ao cadastrar pedido: " + err.message });
    } finally {
      await client.close();
    }
  } else if (req.method === "GET") {
    try {
      await client.connect();
      const db = client.db("pedidosDB");
      const collection = db.collection("pedidos");

      const pedidos = await collection.find({}).sort({ dataPedido: -1 }).toArray();
      res.status(200).json(pedidos);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err.message);
      res.status(500).json({ error: "Erro ao buscar pedidos: " + err.message });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
