import { GitAccountProps } from "../contexts/git-account";

const fetchGit = async <T = Struct>(gitCtx: GitAccountProps, url: string, options?: RequestInit) => {
    const opts = {...options, method: "GET", headers: {...options?.headers, "Private-Token": gitCtx.token }};
    const res = await fetch(`${gitCtx.url}/api/v4/${url}`.replace(/\/\/|\\\/|\/\\/g, ""), opts);;
    return (await res.json()) as T;
};

export default fetchGit;

export const getGitUser = (gitCtx: GitAccountProps) => {
    return fetchGit<Struct>(gitCtx, `user`);
};

export const getGitProjects = (gitCtx: GitAccountProps, options?: {}) => {
    return fetchGit<Array<Struct>>(gitCtx, "projects?state=opened&per_page=100");
};

export const getProject = (gitCtx: GitAccountProps, projectId: number, options?: {}) => {
    return fetchGit<Struct>(gitCtx, `projects/${projectId}`);
};

export const getIssues = (gitCtx: GitAccountProps, options?: { projectId?: number; includeClosed?: boolean; }) => {
    return fetchGit<Array<Struct>>(gitCtx, `projects/${options?.projectId}/issues?${options?.includeClosed ? "" : "state=opened"}`);
};

export const getIssue = (gitCtx: GitAccountProps, projectId: number, issueId: number, options?: {}) => {
    return fetchGit<Struct>(gitCtx, `projects/${projectId}/issues/${issueId}`);
};