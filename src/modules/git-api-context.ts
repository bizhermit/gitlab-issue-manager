import ApiContext from "@bizhermit/next-absorber/dist/api-context";
import { GitAccountProps } from "../contexts/git-account";

class GitApiContext extends ApiContext {

    private git: GitAccountProps;

    constructor(req: any, res: any) {
        super(req, res);
        this.git = this.getSession("git");
        if (this.git == null) throw new Error("not signedin");
    }

    public getGit() {
        return this.git;
    }
};

export default GitApiContext;