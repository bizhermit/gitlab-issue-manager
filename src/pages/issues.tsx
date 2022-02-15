import NumberUtils from "@bizhermit/basic-utils/dist/number-utils";
import { fetchApi } from "@bizhermit/next-absorber/dist/fetch";
import FlexBox from "@bizhermit/react-sdk/dist/containers/flexbox";
import Row from "@bizhermit/react-sdk/dist/containers/row";
import Button from "@bizhermit/react-sdk/dist/controls/button";
import ListView, { ListViewColumnProps } from "@bizhermit/react-sdk/dist/controls/listview";
import SelectBox, { SelectBoxController } from "@bizhermit/react-sdk/dist/controls/selectbox";
import useController from "@bizhermit/react-sdk/dist/hooks/controller";
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
    const [projects, setProjects] = useState([]);
    const [issues, setIssues] = useState([]);
    const [filterProjectId, setFilterProjectId] = useState<number>(null);

    const columns = useMemo(() => {
        return [{
            name: "namespace",
            headerCellLabel: "Project",
            width: 300,
        }, {
            name: "title",
            headerCellLabel: "Title",
            width: 500,
        }, {
            name: "ref",
            headerCellLabel: "Ref",
            width: 70,
            cellTextAlign: "center",
        }, {
            name: "due_date",
            headerCellLabel: "Due Date",
            width: 150,
            cellTextAlign: "center",
        }] as Array<ListViewColumnProps>;
    }, []);

    const msg = useMessage();
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

    const filter = useMemo(() => {
        if (filterProjectId == null) return undefined;
        return (data: Struct) => data.project_id === filterProjectId;
    }, [filterProjectId]);

    const con = useController<SelectBoxController>();
    const [filteredCount, setFilteredCount] = useState(0);

    return (
        <FlexBox fitToOuter="fill" style={{ padding: 5 }}>
            <Row fill>
                <SelectBox controller={con} source={projects} style={{ width: 400 }} appendEmptyItem={true} changed={data => {
                    setFilterProjectId((data as Struct).value);
                }} />
                <Button click={() => {
                    con.setValue(null);
                }}>Clear</Button>
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