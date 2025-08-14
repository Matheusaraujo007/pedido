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
    switch (req.method) {
      case 'POST':
        await criarPedido(req, res, client);
        break;
      case 'GET':
        await listarPedidos(res, client);
        break;
      case 'PUT':
        await atualizarPedido(req, res, client);
        break;
      case 'DELETE':
        await removerPedido(req, res, client);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Método ${req.method} não permitido` });
    }
  } catch (err) {
    console.error('Erro na API:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
}

// 📝 Criar pedido
async function criarPedido(req, res, client) {
  const pedido = req.body;

  if (!pedido.nomeCliente || !pedido.telefoneCliente || !pedido.itens || !pedido.dataPedido) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  try {
    const query = `
      INSERT INTO pedidos (
        vendedor, nome_cliente, telefone_cliente,
        itens, data_pedido, data_entrega,
        valor_total, valor_recebido, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;

    const values = [
      pedido.vendedor || '',
      pedido.nomeCliente,
      pedido.telefoneCliente,
      JSON.stringify(pedido.itens),
      pedido.dataPedido,
      pedido.dataEntrega || null,
      pedido.valorTotal || 0,
      pedido.valorRecebido || 0,
      pedido.status || 'Aguardando Retorno'
    ];

    const result = await client.query(query, values);
    res.status(200).json({ message: 'Pedido cadastrado com sucesso!', pedido: result.rows[0] });

  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ error: 'Erro ao cadastrar pedido.' });
  }
}

// 📋 Listar pedidos
async function listarPedidos(res, client) {
  try {
    const result = await client.query('SELECT * FROM pedidos ORDER BY data_pedido DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao listar pedidos:', err);
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
}

// ✏️ Atualizar pedido
async function atualizarPedido(req, res, client) {
  const { id, status, valorRecebido } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID do pedido é obrigatório.' });
  }

  try {
    const result = await client.query(
      `UPDATE pedidos 
       SET status = COALESCE($1, status), 
           valor_recebido = COALESCE($2, valor_recebido) 
       WHERE id = $3
       RETURNING *`,
      [status || null, valorRecebido ?? null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    res.status(200).json({ message: 'Pedido atualizado com sucesso!', pedido: result.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar pedido:', err);
    res.status(500).json({ error: 'Erro ao atualizar pedido.' });
  }
}

// 🗑️ Remover pedido
async function removerPedido(req, res, client) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID do pedido é obrigatório.' });
  }

  try {
    const result = await client.query('DELETE FROM pedidos WHERE id=$1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    res.status(200).json({ message: 'Pedido removido com sucesso!', pedido: result.rows[0] });
  } catch (err) {
    console.error('Erro ao remover pedido:', err);
    res.status(500).json({ error: 'Erro ao remover pedido.' });
  }
}
