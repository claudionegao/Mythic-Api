import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' })
  }

  try {
    const [aggregate, lastUsages] = await Promise.all([
      prisma.tokenUsage.aggregate({
        _sum: {
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
          thoughtsTokens: true,
        },
        _count: true,
      }),
      prisma.tokenUsage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    res.status(200).json({
      totals: {
        calls: aggregate._count?.id || 0,
        promptTokens: aggregate._sum.promptTokens || 0,
        completionTokens: aggregate._sum.completionTokens || 0,
        totalTokens: aggregate._sum.totalTokens || 0,
        thoughtsTokens: aggregate._sum.thoughtsTokens || 0,
      },
      lastUsages,
    })
  } catch (error) {
    console.error('Error fetching token usage:', error)
    res.status(500).json({ error: 'Failed to fetch token usage' })
  }
}
