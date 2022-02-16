import ApiContext from "@bizhermit/next-absorber/dist/api-context";
import nextronAccessor from "@bizhermit/nextron/dist/accessor";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = new ApiContext(req, res);
    try {
        const nextron = nextronAccessor();
        nextron?.saveConfig({ gitAccount: {} });
        ctx.done();
    } catch(err) {
        ctx.error(err);
    }
};
export default handler;