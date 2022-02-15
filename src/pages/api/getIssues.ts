import DatetimeUtils from "@bizhermit/basic-utils/dist/datetime-utils";
import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import { NextApiRequest, NextApiResponse } from "next";
import fetchGit from "../../modules/fetch-git";
import GitApiContext from "../../modules/git-api-context";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = new GitApiContext(req, res);
    try {
        const git = ctx.getGit();
        const originProjects = await fetchGit<Array<Struct>>(git, "projects?state=opened&per_page=100");
        const asyncItems: Array<Promise<void>> = [];
        const issues: Array<Struct> = [];
        for (const originProject of originProjects) {
            asyncItems.push((async () => {
                const originIssues = await fetchGit<Array<Struct>>(git, `projects/${originProject.id}/issues?state=opened`);
                originIssues.forEach(originIssue => {
                    if (!(originProject.path_with_namespace as string).match(/ozo|kccs/)) console.log(originIssue);
                    issues.push({
                        project_id: originProject.id,
                        namespace: originProject.path_with_namespace,
                        title: originIssue.title,
                        ref: originIssue.references.short,
                        refNum: Number(originIssue.references.short.replace("#", "")),
                        due_date: DatetimeUtils.format(originIssue.due_date, "yyyy/MM/dd"),
                        assignees: StringUtils.join(",", ...(originIssue.assignees as Array<{ name: string; }>).map(item => item.name)),
                        updated_at: DatetimeUtils.format(originIssue.updated_at, "yyyy/MM/dd hh:mm:ss"),
                    });
                });
            })());
        }
        await Promise.all(asyncItems);
        issues.sort((issue1, issue2) => {
            if (issue1.project_id !== issue1.project_id) {
                return issue1.project_id > issue2.project_id ? 1 : -1;
            }
            return issue1.refNum > issue2.refNum ? 1 : -1;
        });
        ctx.done({ issues });
    } catch(err) {
        console.log(err);
        ctx.error(err);
    }
};

export default handler;