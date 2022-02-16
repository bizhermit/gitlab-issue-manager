import { GitAccountProps } from "../contexts/git-account";

const fetchGit = async <T = Struct>(gitCtx: GitAccountProps, url: string, options?: RequestInit) => {
    const opts = {...options, method: "GET", headers: {...options?.headers, "Private-Token": gitCtx.token }};
    const res = await fetch(`${gitCtx.url}/${url}`, opts);;
    return (await res.json()) as T;
};

export default fetchGit;