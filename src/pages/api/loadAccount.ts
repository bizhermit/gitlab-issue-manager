import ApiContext from "@bizhermit/next-absorber/dist/api-context";
import nextronAccessor from "@bizhermit/nextron/dist/accessor";
import type { NextApiRequest, NextApiResponse } from "next";
import { GitAccountProps } from "../../contexts/git-account";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = new ApiContext(req, res);
    try {
        ctx.clearSession("git");
        const nextron = nextronAccessor();
        const config = nextron?.getConfig();
        if (config == null) {
            ctx.done();
            return;
        }
        const gitAccount = config.gitAccount as GitAccountProps;
        ctx.done({ url: config.gitApiUrl, username: gitAccount?.username, token: gitAccount?.token });
    } catch(err) {
        ctx.error(err);
    }
};
export default handler;