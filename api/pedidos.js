import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  await client.connect();

  if (req.method === "POST") {
    try {
      const { vendedor, nomeCliente, telefoneCliente, itens, dataPedido, dataEntrega, valorTotal, valorRecebido, status } = req.body;

      const query = `
        INSERT INTO pedidos (vendedor, nome_cliente, telefone_cliente, itens, data_pedido, data_entrega, valor_total, valor_recebido, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *;
      `;
      const values = [vendedor, nomeCliente, telefoneCliente, JSON.stringify(itens), dataPedido, dataEntrega, valorTotal, valorRecebido, status];

      const result = await client.query(query, values);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Erro ao cadastrar pedido: " + error.message });
    }
  }

  if (req.method === "GET") {
    try {
      const result = await client.query("SELECT * FROM pedidos ORDER BY data_pedido DESC;");
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar pedidos: " + error.message });
    }
  }

  await client.end();
}
