// /api/pedidos.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Coloque no painel do Vercel
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  const client = await pool.connect();

  try {
    if (req.method === 'GET') {
      const result = await client.query('SELECT * FROM pedidos ORDER BY id DESC');
      res.status(200).json(result.rows);

    } else if (req.method === 'POST') {
      const { vendedor, nomeCliente, itens, valorTotal, valorRecebido, dataPedido, dataEntrega, status } = req.body;
      await client.query(
        `INSERT INTO pedidos (vendedor, nome_cliente, itens, valor_total, valor_recebido, data_pedido, data_entrega, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [nomeCliente, JSON.stringify(itens), valorTotal, valorRecebido || 0, dataPedido, dataEntrega, status || 'Aguardando Retorno']
      );
      res.status(201).json({ message: 'Pedido criado com sucesso!' });

    } else if (req.method === 'PUT') {
      const { id, valorRecebido, status } = req.body;
      await client.query(
        `UPDATE pedidos SET valor_recebido = $1, status = $2 WHERE id = $3`,
        [valorRecebido, status, id]
      );
      res.status(200).json({ message: 'Pedido atualizado com sucesso!' });

    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      await client.query(`DELETE FROM pedidos WHERE id = $1`, [id]);
      res.status(200).json({ message: 'Pedido removido com sucesso!' });

    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor', details: err.message });
  } finally {
    client.release();
  }
}
