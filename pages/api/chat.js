import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Listar todas as mensagens ordenadas por data
      const messages = await prisma.message.findMany({
        orderBy: {
          createdAt: 'asc',
        },
      });

      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  } else if (req.method === 'POST') {
    const { author, content } = req.body;

    if (!author || !content) {
      return res.status(400).json({ error: 'author and content are required' });
    }

    try {
      // Criar nova mensagem
      const message = await prisma.message.create({
        data: {
          author,
          content,
        },
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
