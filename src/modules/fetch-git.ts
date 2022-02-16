import { GitAccountProps } from "../contexts/git-account";

const fetchGit = async <T = Struct>(gitCtx: GitAccountProps, url: string, options?: RequestInit) => {
    const opts = {...options, method: "GET", headers: {...options?.headers, "Private-Token": gitCtx.token }};
    const res = await fetch(`${gitCtx.url}/api/v4/${url}`.replace(/\/\//g, ""), opts);;
    return (await res.json()) as T;
};

export default fetchGit;