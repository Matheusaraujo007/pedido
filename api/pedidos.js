// api/pedidos.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  const client = await pool.connect();
  try {
    if (req.method === 'POST') {
      // Cadastrar pedido
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
      return res.status(200).json({ message: 'Pedido cadastrado!', pedido: result.rows[0] });

    } else if (req.method === 'GET') {
      // Listar pedidos
      const result = await client.query('SELECT * FROM pedidos ORDER BY data_pedido DESC');
      return res.status(200).json(result.rows);

    } else if (req.method === 'PUT') {
      // Atualizar pedido (status ou valor recebido)
      const { id, status, valorRecebido } = req.body;
      if (!id) return res.status(400).json({ error: 'ID do pedido é obrigatório' });

      const result = await client.query(
        `UPDATE pedidos 
         SET status = COALESCE($1, status), 
             valor_recebido = COALESCE($2, valor_recebido) 
         WHERE id = $3
         RETURNING *`,
        [status, valorRecebido, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

      return res.status(200).json({ message: 'Pedido atualizado!', pedido: result.rows[0] });

    } else if (req.method === 'DELETE') {
      // Remover pedido
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID do pedido é obrigatório' });

      const result = await client.query('DELETE FROM pedidos WHERE id=$1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

      return res.status(200).json({ message: 'Pedido removido!', pedido: result.rows[0] });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Método ${req.method} não permitido` });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro na API: ' + err.message });
  } finally {
    client.release();
  }
}
