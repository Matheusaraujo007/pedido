import { MongoClient } from "mongodb";

let client;
let clientPromise;

const uri = process.env.MONGO_URI;

if (!uri) throw new Error("MONGO_URI não definido");

if (process.env.NODE_ENV === "development") {
    // Evita múltiplas conexões em dev
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const pedido = req.body;
            const db = (await clientPromise).db("pedidos");
            const collection = db.collection("pedidos");

            const result = await collection.insertOne(pedido);
            res.status(200).json({ message: "Pedido inserido com sucesso!", id: result.insertedId });
        } catch (err) {
            console.error("Erro ao inserir pedido:", err);
            res.status(500).json({ error: "Erro ao inserir pedido no MongoDB" });
        }
    } else {
        res.status(405).json({ error: "Método não permitido" });
    }
}
