import { ICostRajaOngkirPayload } from "@/interfaces/rajaongkir";
import service from "@/services/services";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name?: string;
  message?: string;
  error?: any;
  data?: string;
  user?: object;
  wallet?: object;
  costs?: any[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === "POST") {
    const getAllCost = async () => {
      const payload: ICostRajaOngkirPayload[] = req.body;

      const results = await Promise.allSettled(
        (payload || []).map(async (courier) => {
          try {
            const { error, data } = await service.getCostRajaOngkir(
              String(courier.origin),
              String(courier.destination),
              String(courier.weight),
              String(courier.courier),
            );

            if (error) {
              throw new Error("Failed to get cost");
            }
            return {
              cost: data.costs[0].cost[0].value,
              service: courier.courier,
              image: courier.image,
            };
          } catch (error) {
            return null;
          }
        }),
      );

      const costs = results
        .filter(
          (res) =>
            res.status === "fulfilled" &&
            (res as { status: "fulfilled"; value: any }).value !== null,
        )
        .map((res) => (res as { status: "fulfilled"; value: any }).value);

      if (costs.length === 0) {
        res
          .status(404)
          .json({ error: "There is no service between these cities" });
      }
      res.status(200).json({ costs });
    };

    try {
      await getAllCost();
      // res.status(201).json({});
    } catch (error) {
      res.status(500).json({ error: "Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
