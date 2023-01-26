// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  id: number;
  name: string;
}[];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json([
    { id: 1, name: "Yemoja" },
    { id: 2, name: "Sango" },
    { id: 3, name: "Sopona" },
  ]);
}
