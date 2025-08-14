// api/pedidos.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    const client = await pool.connect();

    if (req.method === 'POST') {
      const pedido = req.body;

      const query = `
        INSERT INTO pedidos (
          vendedor, nome_cliente, telefone_cliente,
          itens, data_pedido, data_entrega,
          valor_total, valor_recebido, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *;
      `;

      const values = [
        pedido.vendedor,
        pedido.nomeCliente,
        pedido.telefoneCliente,
        JSON.stringify(pedido.itens),
        pedido.dataPedido,
        pedido.dataEntrega,
        pedido.valorTotal,
        pedido.valorRecebido,
        pedido.status
      ];

      const result = await client.query(query, values);
      client.release();

      return res.status(200).json({ message: 'Pedido cadastrado!', pedido: result.rows[0] });

    } else if (req.method === 'GET') {
      // Busca todos os pedidos e ordena por data de pedido descrescente
      const result = await client.query('SELECT * FROM pedidos ORDER BY data_pedido DESC');
      client.release();

      return res.status(200).json(result.rows);

    } else {
      client.release();
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Método ${req.method} não permitido` });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro na API: ' + err.message });
  }
}
