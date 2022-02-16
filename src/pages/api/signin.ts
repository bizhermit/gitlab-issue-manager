import ApiContext from "@bizhermit/next-absorber/dist/api-context";
import { NextApiRequest, NextApiResponse } from "next";
import nextronAccessor from "@bizhermit/nextron/dist/accessor";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = new ApiContext(req, res);
    try {
        const { url, username, token } = ctx.getParams();
        ctx.setSession("git", ctx.getParams());
        const gitAccount = { username, token };
        const nextron = nextronAccessor();
        nextron?.saveConfig({ gitApiUrl: url, gitAccount });
        ctx.done();
    } catch(err) {
        console.log(err);
        ctx.error(err);
    }
};

export default handler;