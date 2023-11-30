import { IResponseApi } from "@/interfaces/responses";
import service from "@/services/services";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name?: string;
  message?: string;
  error?: string;
  data?: string;
  user?: object;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === "GET") {
    const { province } = req.query;
    const citiesData = async () => {
      const { error, data, message, code }: IResponseApi<any> =
        await service.getCities(province as string);

      if (error && code === 401) {
        res.status(code).json({ error: message });
      } else if (error) {
        res.status(400).json({ error: message });
      } else {
        return data;
      }
    };

    try {
      const response = await citiesData();
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ error: "Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
