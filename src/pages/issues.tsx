import DatetimeUtils from "@bizhermit/basic-utils/dist/datetime-utils";
import NumberUtils from "@bizhermit/basic-utils/dist/number-utils";
import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import { fetchApi } from "@bizhermit/next-absorber/dist/fetch";
import AccordionContainer from "@bizhermit/react-sdk/dist/containers/accordion-container";
import Caption from "@bizhermit/react-sdk/dist/containers/caption";
import FlexBox from "@bizhermit/react-sdk/dist/containers/flexbox";
import Row from "@bizhermit/react-sdk/dist/containers/row";
import Button from "@bizhermit/react-sdk/dist/controls/button";
import DateBox from "@bizhermit/react-sdk/dist/controls/datebox";
import ListView, { ListViewColumnProps } from "@bizhermit/react-sdk/dist/controls/listview";
import SelectBox, { SelectBoxController } from "@bizhermit/react-sdk/dist/controls/selectbox";
import TextBox from "@bizhermit/react-sdk/dist/controls/textbox";
import useMessage from "@bizhermit/react-sdk/dist/hooks/message";
import Label from "@bizhermit/react-sdk/dist/texts/label";
import { NextPage } from "next";
import { useEffect, useMemo, useState, VFC } from "react";
import SignedinContainer from "../components/signedin-container";

const IssuesPage: NextPage = () => {
    return (
        <SignedinContainer title="Issues">
            <IssuesComponent />
        </SignedinContainer>
    );
};

export default IssuesPage;

const IssuesComponent: VFC = () => {
    const [issues, setIssues] = useState([]);
    const [projects, setProjects] = useState([]);
    const msg = useMessage();
    const [filterParams, setFilterParams] = useState<Partial<{
        projectId: string;
        title: string;
        ref: string;
        assignees: string;
        dueDateFrom: string;
        dueDateTo: string;
    }>>({});
    const [filteredCount, setFilteredCount] = useState(0);

    const columns = useMemo(() => {
        return [{
            name: "namespace",
            headerCellLabel: "Project",
            width: 320,
        }, {
            name: "title",
            headerCellLabel: "Title",
            width: 500,
            fill: true,
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
            const res = await fetchApi("getIssues");
            msg.append(res.messages);
            if (res.hasError) {
                unlock?.();
                return;
            }
            setIssues(res.data.issues);
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
    }, []);

    return (
        <FlexBox fitToOuter="fill" style={{ padding: 5 }}>
            <Row fill>
                <AccordionContainer caption="Filter" fitToOuter="fx">
                    <Row fill>
                        <Caption label="Project" style={{ marginRight: 5 }}>
                            <SelectBox source={projects} style={{ width: 400 }} appendEmptyItem={true} name="projectId" bind={filterParams} />
                        </Caption>
                        <Caption label="Title" style={{ marginRight: 5 }}>
                            <TextBox name="title" bind={filterParams} style={{ width: 400 }}  />
                        </Caption>
                        <Caption label="Assignees" style={{ marginRight: 5 }}>
                            <TextBox name="assignees" bind={filterParams} style={{ width: 200 }}  />
                        </Caption>
                    </Row>
                    <Row fill>
                        <Caption label="Due Date">
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
                                        return true;
                                    };
                                });
                            }}>Filter</Button>
                            <Button click={() => {
                                setFilterParams({});
                            }}>Clear</Button>
                        </Row>
                    </Row>
                </AccordionContainer>
                <Row fill right>
                    <Label>{NumberUtils.format(filteredCount)}</Label>
                    <Label style={{ padding: "0px 5px"}}>/</Label>
                    <Label>{NumberUtils.format(issues.length)}</Label>
                    <Label style={{ paddingLeft: "0px 5px" }}>件</Label>
                    <Button image="reload" click={load}></Button>
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