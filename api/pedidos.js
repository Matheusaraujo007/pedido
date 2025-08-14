import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            if (!client.isConnected?.()) await client.connect();
            const db = client.db("pedidos");
            const collection = db.collection("pedidos");
            const result = await collection.insertOne(req.body);
            res.status(200).json({ message: "Pedido inserido!", id: result.insertedId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao inserir pedido no MongoDB" });
        }
    } else {
        res.status(405).json({ error: "Método não permitido" });
    }
}
