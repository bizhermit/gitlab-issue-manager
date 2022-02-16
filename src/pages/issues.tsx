import DatetimeUtils from "@bizhermit/basic-utils/dist/datetime-utils";
import NumberUtils from "@bizhermit/basic-utils/dist/number-utils";
import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import AccordionContainer from "@bizhermit/react-sdk/dist/containers/accordion-container";
import Caption from "@bizhermit/react-sdk/dist/containers/caption";
import FlexBox from "@bizhermit/react-sdk/dist/containers/flexbox";
import Row from "@bizhermit/react-sdk/dist/containers/row";
import Button from "@bizhermit/react-sdk/dist/controls/button";
import CheckBox from "@bizhermit/react-sdk/dist/controls/checkbox";
import DateBox from "@bizhermit/react-sdk/dist/controls/datebox";
import ListView, { ListViewColumnProps } from "@bizhermit/react-sdk/dist/controls/listview";
import ListViewButtonColumn from "@bizhermit/react-sdk/dist/controls/listview-columns/button-column";
import SelectBox, { SelectBoxController } from "@bizhermit/react-sdk/dist/controls/selectbox";
import TextBox from "@bizhermit/react-sdk/dist/controls/textbox";
import useMessage from "@bizhermit/react-sdk/dist/hooks/message";
import Label from "@bizhermit/react-sdk/dist/texts/label";
import { NextPage } from "next";
import { useEffect, useMemo, useState, VFC } from "react";
import SignedinContainer from "../components/signedin-container";
import useGitAccount from "../contexts/git-account";
import fetchGit from "../modules/fetch-git";

const IssuesPage: NextPage = () => {
    return (
        <SignedinContainer title="Issues">
            <IssuesComponent />
        </SignedinContainer>
    );
};

export default IssuesPage;

const IssuesComponent: VFC = () => {
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
    const [includeClosedIssue, setIncludeClosedIssue] = useState(false);

    const columns = useMemo(() => {
        return [ListViewButtonColumn({
            name: "detail",
            iconImage: "menu",
            clickedCell: (params) => {
                console.log(params.data);
            },
        }), {
            name: "namespace",
            headerCellLabel: "Project",
            width: 320,
        }, {
            name: "title",
            headerCellLabel: "Title",
            width: 500,
            fill: true,
        }, {
            name: "priority",
            headerCellLabel: "Priority",
            width: 100,
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
            name: "due_date",
            headerCellLabel: "Due Date",
            width: 120,
            cellTextAlign: "center",
        }] as Array<ListViewColumnProps>;
    }, []);

    const load = async (unlock?: VoidFunc) => {
        try {
            const originProjects = await fetchGit<Array<Struct>>(git, "projects?state=opened&per_page=100");
            const asyncItems: Array<Promise<void>> = [];
            const issues: Array<Struct> = [];
            for (const originProject of originProjects) {
                // console.log(originProject);
                asyncItems.push((async (project: Struct) => {
                    const originIssues = await fetchGit<Array<Struct>>(git, `projects/${project.id}/issues?${includeClosedIssue ? "" : "state=opened"}`);
                    originIssues.forEach(originIssue => {
                        issues.push(convertIssueData(project, originIssue));
                    });
                })(originProject));
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
    };

    useEffect(() => {
        const map: {[key: string]: Struct} = {};
        const items: Array<Struct> = [];
        issues.forEach(issue => {
            if (issue.project_id in map) return;
            map[issue.project_id] = issue;
            items.push({ value: issue.project_id, label: issue.namespace });
        });
        setProjects(items);
    }, [issues]);

    const [filter, setFilter] = useState<(data: Struct) => boolean>(null);

    useEffect(() => {
        load();
    }, [includeClosedIssue]);

    return (
        <FlexBox fitToOuter="fill" style={{ padding: 5 }}>
            <Row fill>
                <AccordionContainer caption="Filter" fitToOuter="fx" defaultOpened={false}>
                    <Row fill>
                        <Caption label="Project" style={{ marginRight: 5 }}>
                            <SelectBox source={projects} style={{ width: 400 }} appendEmptyItem={true} name="projectId" bind={filterParams} />
                        </Caption>
                        <Caption label="Title" style={{ marginRight: 5 }}>
                            <TextBox name="title" bind={filterParams} style={{ width: 400 }}  />
                        </Caption>
                    </Row>
                    <Row fill>
                        <Caption label="Assignees" style={{ marginRight: 5 }}>
                            <TextBox name="assignees" bind={filterParams} style={{ width: 200 }}  />
                            <CheckBox name="assignees_self" bind={filterParams}>Self</CheckBox>
                        </Caption>
                        <Caption label="Due Date" style={{ marginRight: 5 }}>
                            <DateBox name="dueDateFrom" bind={filterParams} />
                            <Label style={{ padding: "0px 5px" }}>～</Label>
                            <DateBox name="dueDateTo" bind={filterParams} />
                        </Caption>
                        <Row fill right>
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
                    <CheckBox changed={v => {
                        setIncludeClosedIssue(v);
                    }}>include closed issue</CheckBox>
                    <Row fill right>
                        <Label>{NumberUtils.format(filteredCount)}</Label>
                        <Label style={{ padding: "0px 5px"}}>/</Label>
                        <Label>{NumberUtils.format(issues.length)}</Label>
                        <Label style={{ paddingLeft: "0px 5px" }}>件</Label>
                        <Button image="reload" click={load}></Button>
                    </Row>
                </Row>
            </Row>
            <ListView fitToOuter="ffy" value={issues} columns={columns} options={{
                selectMode: "row",
                filter,
                filtered: (items) => {
                    setFilteredCount(items.length);
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
        if (label === "緊急") return priority = "緊急";
        if (label === "高") return priority = "高";
        if (label === "中") return priority = "中";
        if (label === "低") return priority = "低";
        if (label === "保留") return status = "保留";
        if (label === "確認中") return status = "確認中";
        if (label === "着手") return status = "着手";
    });
    if (issue.state === "closed") status = "完了";
    return {
        project_id: project.id,
        namespace: `${project.namespace.full_path}/${project.name}`,
        title: issue.title,
        issueId: issue.iid,
        ref: `#${issue.iid}`,
        due_date: DatetimeUtils.format(issue.due_date, "yyyy/MM/dd"),
        assignees: StringUtils.join(",", ...assignees.map(item => item.name)),
        assigneesId: assignees.map(item => item.id),
        updated_at: DatetimeUtils.format(issue.updated_at, "yyyy/MM/dd hh:mm:ss"),
        priority,
        status,
    };
};

const IssueComponent: VFC<{ projectId: number; }> = ({ projectId }) => {
    return (
        <>
        </>
    );
};