import ApiContext from "@bizhermit/next-absorber/dist/api-context";
import nextronAccessor from "@bizhermit/nextron/dist/accessor";
import type { NextApiRequest, NextApiResponse } from "next";
import { GitAccountProps } from "../../contexts/git-account";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = new ApiContext(req, res);
    try {
        const nextron = nextronAccessor();
        const config = nextron.getConfig();
        ctx.clearSession("git");
        const gitAccount = config.gitAccount as GitAccountProps;
        ctx.done({ url: config.gitApiUrl, user: gitAccount?.user, token: gitAccount?.token });
    } catch(err) {
        ctx.error(err);
    }
};
export default handler;