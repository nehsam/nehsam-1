import { NextApiRequest, NextApiResponse } from 'next';
import sanityClient from '@/sanity/lib/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { customerName, customerEmail, customerAddress } = req.body;

    try {
      // Create order document
      const orderData = {
        _type: 'order',
        customerName,
        customerEmail,
        customerAddress,
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      // Save to Sanity
      const result = await sanityClient.create(orderData);

      return res.status(200).json({
        message: 'Order created successfully',
        sanityOrderId: result._id,
        orderDetails: {
          orderId: result._id,
          status: 'pending'
        }
      });

    } catch (error) {
      console.error('Order processing error:', error);
      return res.status(500).json({
        error: (error as Error).message || 'Failed to process order'
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}