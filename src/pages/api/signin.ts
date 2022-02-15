import ApiContext from "@bizhermit/next-absorber/dist/api-context";
import { NextApiRequest, NextApiResponse } from "next";
import nextronAccessor from "@bizhermit/nextron/dist/accessor";
import fetchGit from "../../modules/fetch-git";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = new ApiContext(req, res);
    try {
        const { url, user, token } = ctx.getParams();
        const nextron = nextronAccessor();
        const res = await fetchGit<Struct>({ url, user, token }, `user`);
        if (res?.username !== user) {
            ctx.addError({ message: "アカウントが存在しません" }).done({ result: false });
            return;
        }
        const gitAccount = { user, token };
        nextron.saveConfig({ gitApiUrl: url, gitAccount });
        ctx.setSession("git", { url, user, token });
        ctx.done({ result: true, git: { url, user, token } });
    } catch(err) {
        ctx.error(err);
    }
};

export default handler;