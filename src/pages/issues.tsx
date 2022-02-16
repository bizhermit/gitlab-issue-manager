import DatetimeUtils from "@bizhermit/basic-utils/dist/datetime-utils";
import NumberUtils from "@bizhermit/basic-utils/dist/number-utils";
import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import AccordionContainer from "@bizhermit/react-sdk/dist/containers/accordion-container";
import Caption from "@bizhermit/react-sdk/dist/containers/caption";
import FlexBox from "@bizhermit/react-sdk/dist/containers/flexbox";
import GradualContainer from "@bizhermit/react-sdk/dist/containers/gradual-container";
import { GradualContentFC } from "@bizhermit/react-sdk/dist/containers/gradual-container";
import Row from "@bizhermit/react-sdk/dist/containers/row";
import Button from "@bizhermit/react-sdk/dist/controls/button";
import CheckBox from "@bizhermit/react-sdk/dist/controls/checkbox";
import DateBox from "@bizhermit/react-sdk/dist/controls/datebox";
import ListView, { ListViewColumnProps } from "@bizhermit/react-sdk/dist/controls/listview";
import SelectBox from "@bizhermit/react-sdk/dist/controls/selectbox";
import TextArea from "@bizhermit/react-sdk/dist/controls/textarea";
import TextBox from "@bizhermit/react-sdk/dist/controls/textbox";
import useMask, { MaskContainer } from "@bizhermit/react-sdk/dist/hooks/mask";
import useMessage from "@bizhermit/react-sdk/dist/hooks/message";
import Label from "@bizhermit/react-sdk/dist/texts/label";
import { NextPage } from "next";
import { useEffect, useMemo, useState, VFC } from "react";
import GitIssueFrame from "../components/git-issue-frame";
import SignedinContainer from "../components/signedin-container";
import useGitAccount from "../contexts/git-account";
import { getGitProjects, getIssue, getIssues, getProject } from "../modules/fetch-git";

const IssuesPage: NextPage = () => {
    return (
        <SignedinContainer title="Issues">
            <GradualContainer fitToOuter="fill" contents={[{
                key: "issues",
                component: IssuesComponent,
            }, {
                key: "issue",
                component: IssueComponent as any,
                props: { projectId: null },
                flexRate: 2,
            }]} />
        </SignedinContainer>
    );
};

export default IssuesPage;

const IssuesComponent: GradualContentFC = ({ gcc }) => {
    const git = useGitAccount();
    const [issues, setIssues] = useState([]);
    const [projects, setProjects] = useState([]);
    const msg = useMessage();
    const [filterParams, setFilterParams] = useState<Partial<{
        projectId: string;
        title: string;
        ref: string;
        assignees: string;
        assignees_self: boolean;
        dueDateFrom: string;
        dueDateTo: string;
    }>>({});
    const [filteredCount, setFilteredCount] = useState(0);

    const [projectId, setProjectId] = useState<number | undefined>(undefined);
    const [includeClosedIssue, setIncludeClosedIssue] = useState(false);
    const mask = useMask();

    const columns = useMemo(() => {
        return [...(projectId == null ? [{
            name: "namespace",
            headerCellLabel: "Project",
            width: 320,
        }] : []), {
            name: "title",
            headerCellLabel: "Title",
            fixed: true,
            width: 300,
        }, {
            name: "priority",
            headerCellLabel: "Priority",
            width: 90,
            cellTextAlign: "center",
        }, {
            name: "status",
            headerCellLabel: "Status",
            width: 100,
            cellTextAlign: "center",
        }, {
            name: "ref",
            headerCellLabel: "Ref",
            width: 70,
            cellTextAlign: "center",
        }, {
           name: "assignees",
            headerCellLabel: "Assignees",
            width: 120,
            cellTextAlign: "center",
        }, {
            name: "dueDate",
            headerCellLabel: "Due Date",
            width: 120,
            cellTextAlign: "center",
        }] as Array<ListViewColumnProps>;
    }, [projectId]);

    const loadProjects = async () => {
        const originProjects = await getGitProjects(git);
        const map: {[key: string]: Struct} = {};
        const items: Array<Struct> = [];
        originProjects.forEach(project => {
            if (project.id in map) return;
            map[project.id] = project;
            items.push({ value: project.id, label: `${project.namespace.full_path}/${project.name}` });
        });
        setProjects(items);
    };
    const loadIssues = async (unlock?: VoidFunc) => {
        mask.show({ image: "spin-circle", text: "get issues..." });
        try {
            const projectIds = projectId == null ? projects.map(item => item.value as number).filter(item => item != null) : [projectId];
            const asyncItems: Array<Promise<void>> = [];
            const issues: Array<Struct> = [];
            for (const pid of projectIds) {
                asyncItems.push((async (pid: number) => {
                    const originProject = await getProject(git, pid);
                    const originIssues = await getIssues(git, { projectId: pid, includeClosed: includeClosedIssue });
                    originIssues.forEach(originIssue => {
                        issues.push(convertIssueData(originProject, originIssue));
                    });
                })(pid));
            }
            await Promise.all(asyncItems);
            issues.sort((issue1, issue2) => {
                if (issue1.project_id !== issue2.project_id) {
                    return issue1.project_id > issue2.project_id ? 1 : -1;
                }
                return issue1.refNum > issue2.refNum ? 1 : -1;
            });
            unlock?.();
            setIssues(issues);
        } catch(err) {
            msg.error(err);
        }
        unlock?.();
        mask.close();
    };

    const [filter, setFilter] = useState<(data: Struct) => boolean>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (projects.length > 0) loadIssues();
    }, [projects, projectId, includeClosedIssue]);

    return (
        <FlexBox fitToOuter="fill" style={{ padding: 5 }}>
            <Row fill>
                <AccordionContainer caption="Filter" fitToOuter="fx" defaultOpened={false}>
                    <Row fill>
                        <Caption label="Title" style={{ marginRight: 5 }}>
                            <TextBox name="title" bind={filterParams} style={{ width: 300 }}  />
                        </Caption>
                        <Caption label="Assignees" style={{ marginRight: 5 }}>
                            <TextBox name="assignees" bind={filterParams} style={{ width: 180 }}  />
                            <CheckBox name="assignees_self" bind={filterParams}>Self</CheckBox>
                        </Caption>
                        <Caption label="Due Date" style={{ marginRight: 5 }}>
                            <DateBox name="dueDateFrom" bind={filterParams} />
                            <Label style={{ padding: "0px 5px" }}>～</Label>
                            <DateBox name="dueDateTo" bind={filterParams} />
                        </Caption>
                        <Row fill right nowrap>
                            <Button click={() => {
                                setFilter(() => {
                                    return (data: Struct) => {
                                        if (filterParams.projectId != null) {
                                            if (data.project_id !== filterParams.projectId) return false;
                                        }
                                        if (StringUtils.isNotEmpty(filterParams.title)) {
                                            if (!StringUtils.contains(data.title, filterParams.title)) return false;
                                        }
                                        if (StringUtils.isNotEmpty(filterParams.assignees)) {
                                            if (!StringUtils.contains(data.assignees, filterParams.assignees)) return false;
                                        }
                                        const dueDate = DatetimeUtils.convert(data.due_date);
                                        if (dueDate != null) {
                                            if (StringUtils.isNotEmpty(filterParams.dueDateFrom)) {
                                                if (DatetimeUtils.isBeforeDate(DatetimeUtils.convert(filterParams.dueDateFrom), dueDate)) return false;
                                            }
                                            if (StringUtils.isNotEmpty(filterParams.dueDateTo)) {
                                                if (DatetimeUtils.isAfterDate(DatetimeUtils.convert(filterParams.dueDateTo), dueDate)) return false;
                                            }
                                        }
                                        if (filterParams.assignees_self) {
                                            if ((data.assigneesId as Array<number>).find(id => id === git.userId) == null) return false;
                                        }
                                        return true;
                                    };
                                });
                            }}>Exec</Button>
                            <Button click={() => {
                                setFilterParams({});
                            }}>Clear</Button>
                        </Row>
                    </Row>
                </AccordionContainer>
                <Row fill>
                    <Caption label="Project" style={{ marginRight: 5 }}>
                        <SelectBox source={projects} style={{ width: 400 }} appendEmptyItem={true} changed={v => {
                            setProjectId((v as Struct).value);
                        }}/>
                    </Caption>
                    <CheckBox changed={v => {
                        setIncludeClosedIssue(v);
                    }}>include closed issue</CheckBox>
                    <Row fill right nowrap>
                        <Label>{NumberUtils.format(filteredCount)}</Label>
                        <Label style={{ padding: "0px 5px"}}>/</Label>
                        <Label>{NumberUtils.format(issues.length)}</Label>
                        <Label style={{ paddingLeft: "0px 5px" }}>件</Label>
                        <Button image="reload" click={loadIssues}></Button>
                    </Row>
                </Row>
            </Row>
            <ListView fitToOuter="ffy" value={issues} columns={columns} options={{
                selectMode: "row",
                filter,
                filtered: (items) => {
                    setFilteredCount(items.length);
                },
                clickedRow: (params) => {
                    console.log(params.data);
                    gcc.showNext({
                        projectId: params.data.projectId,
                        issueId: params.data.issueId
                    });
                },
            }} />
        </FlexBox>
    );
};

const convertIssueData = (project: Struct, issue: Struct) => {
    // console.log(issue);
    const assignees = issue.assignees as Array<{ name: string; id: number; }> ?? [];
    const labels = issue.labels as Array<string>;
    // if (labels.length > 0) console.log(labels);
    let priority = "-", status = "-";
    labels.forEach(label => {
        if (label.startsWith("s:")) {
            status = label.substring(2);
            return;
        }
        if (label.startsWith("p:")) {
            priority = label.substring(2);
            return;
        }
    });
    if (issue.state === "closed") status = "完了";
    return {
        projectId: project.id,
        namespace: `${project.namespace.full_path}/${project.name}`,
        title: issue.title,
        issueId: issue.iid,
        ref: `#${issue.iid}`,
        dueDate: DatetimeUtils.format(issue.due_date, "yyyy/MM/dd"),
        assignees: StringUtils.join(",", ...assignees.map(item => item.name)),
        assigneesId: assignees.map(item => item.id),
        updatedAt: DatetimeUtils.format(issue.updated_at, "yyyy/MM/dd hh:mm:ss"),
        priority,
        status,
    };
};

const IssueComponent: GradualContentFC<{ projectId: number; issueId: number; }> = ({ projectId, issueId }) => {
    return <GitIssueFrame projectId={projectId} issueId={issueId} />;
};