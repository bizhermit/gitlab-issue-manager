import FlexBox from "@bizhermit/react-sdk/dist/containers/flexbox";
import useMask, { MaskContainer } from "@bizhermit/react-sdk/dist/hooks/mask";
import useMessage from "@bizhermit/react-sdk/dist/hooks/message";
import { useEffect, useState, VFC } from "react";
import useGitAccount from "../contexts/git-account";
import { getIssue, getProject } from "../modules/fetch-git";

type Props = {
    width?: number | string;
    height?: number | string;
    projectId: number;
    issueId: number;
};

const GitIssueFrame: VFC<Props> = (props) => {
    const git = useGitAccount();
    const msg = useMessage();
    const mask = useMask();
    const [project, setProject] = useState<Struct>();
    const [issue, setIssue] = useState<Struct>();

    const loadIssue = async (unlock?: VoidFunc) => {
        if (props.projectId == null || props.issueId == null) {
            setProject(null);
            setIssue(null);
            return;
        }
        mask.show({ image: "spin-circle", text: "get project..."});
        try {
            const project = await getProject(git, props.projectId);
            mask.show({ image: "spin-circle", text: "get issue..." });
            const issue = await getIssue(git, props.projectId, props.issueId);
            setProject(project);
            setIssue(issue);
            console.log(project);
            console.log(issue);
        } catch(err) {
            msg.error(err);
        }
        unlock?.();
        mask.close();
    };

    useEffect(() => {
        loadIssue();
    }, [props.projectId, props.issueId]);

    if (project == null || issue == null) return <></>;
    return (
        <MaskContainer fitToOuter="fill" mask={mask}>
            <FlexBox fitToOuter="fill" design style={{ padding: 5 }}>
                <iframe width={props.width ?? "100%"} height={props.height ?? "100%"} src={issue.web_url} />
            </FlexBox>
        </MaskContainer>
    );
};

export default GitIssueFrame;