// api/pedidos.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const pedido = req.body;

    try {
      const client = await pool.connect();

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

      res.status(200).json({ message: 'Pedido cadastrado!', pedido: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao cadastrar pedido: ' + err.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
