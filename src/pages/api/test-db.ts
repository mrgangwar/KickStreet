import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    res.status(200).json({ success: true, message: "KickStreet Database Connected Successfully! ✅" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database Connection Failed! ❌", error });
  }
}