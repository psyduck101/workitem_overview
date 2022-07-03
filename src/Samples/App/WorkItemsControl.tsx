import { ResourceRef } from "azure-devops-extension-api/WebApi";
import { Card } from "azure-devops-ui/Card";
import { Header } from "azure-devops-ui/Header";
import React from "react";
import { Component } from "react";
import { ExcelExporter } from "./ExcelExporter";
import { WorkItemsBuildControl } from "./WorkItemsBuildControl";
import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, getClient, IProjectInfo, IProjectPageService } from "azure-devops-extension-api";
import { WorkItem, WorkItemTrackingRestClient } from "azure-devops-extension-api/WorkItemTracking";
import { ListSelection } from "azure-devops-ui/List";
import { ColumnSelect, ITableRow, renderSimpleCell, Table } from "azure-devops-ui/Table";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { IWorkItem } from "./models/workitem";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { Button } from "azure-devops-ui/Button";
import { WorkItemExcelCreator } from "./WorkItemExcelCreator";

export interface IWorkItemControlData {
  workItems: IWorkItem[],
  projectId: string
}

export interface IWorkItemControlState {
  data : IWorkItemControlData
}

export class WorkItemsControl extends Component<{
  title: string;
}, IWorkItemControlState> {

  private selectionTable = new ListSelection({ selectOnFocus: false, multiSelect: true });
  private project: IProjectInfo | undefined;
  private workItemClient: WorkItemTrackingRestClient | undefined;
  private selectedWorkItems: Array<IWorkItem> = [];

  constructor(props: { title: string }) {
    super(props);

    this.state = {
      data: {
        workItems: [],
        projectId: ''
      }
    };
  }

  public componentDidMount() {
    this.initializeState();
  }

  private async initializeState(): Promise<void> {
    const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    this.project = await projectService.getProject();
    this.workItemClient = await getClient(WorkItemTrackingRestClient);

    const projectId = this.project?.id;
    if(projectId){
      this.setState(prevState => ({
        data: { ...prevState.data, 
          projectId: projectId }
      }));
    }
  }

  private mapWorkItems(workItems: WorkItem[]) : IWorkItem[] {
    return workItems.map(x => {
      return {
      id: x.id,
      title: x.fields['System.Title'],
      state: x.fields['System.State'],
    }});
  }

  private checkboxColumns = [
    new ColumnSelect(),
    {
        id: "id",
        name: "Id",
        readonly: true,
        renderCell: renderSimpleCell,
        width: new ObservableValue(-30),
    },
    {
        id: "title",
        name: "Title",
        readonly: true,
        renderCell: renderSimpleCell,
        width: new ObservableValue(-30),
    },
    {
        id: "state",
        name: "State",
        readonly: true,
        renderCell: renderSimpleCell,
        width: new ObservableValue(-40),
    },
  ];

  private onSelectBuild = async (
    workItemRefs: ResourceRef[]
  ) => {
    if(workItemRefs){
      //retrieve workitems
      const ids = workItemRefs.map(x => parseInt(x.id));
      const workItems = await this.workItemClient?.getWorkItems(ids);
      this.setState(prevState => ({
        data: { ...prevState.data, 
          workItems: workItems ? this.mapWorkItems(workItems): []
        }
      }));
    }
  }

  private collectSelectedItems = () : Array<IWorkItem> => {
    if(this.selectionTable.value){
      const items : Array<IWorkItem> = [];
      
      this.selectionTable.value.forEach((range) => {
        const sliced = this.state.data.workItems.slice(range.beginIndex, range.endIndex + 1);
        items.push(...sliced);
      });
      return items;
    }
    return [];
  }

  private onExport = () => {
    const items = this.collectSelectedItems();
    const excelExporter = new WorkItemExcelCreator();
    excelExporter.createExcel("exportbuilds", items);
  }

  public render(): JSX.Element {
    const { workItems, projectId } = this.state.data;
    const itemProvider = new ArrayItemProvider<IWorkItem>(workItems);
    return (
      <div style={{ margin: "8px" }}>
         <Header title="Builds workitem overview" />
         <br/>
        <div>
          <WorkItemsBuildControl projectId={projectId} onSelectedBuild={this.onSelectBuild}  />
        </div>
        <br/>
        <br/>
        <Card
          className="flex-grow bolt-table-card"
          contentProps={{ contentPadding: false }}
        >
          <Table
            ariaLabel="Workitems"
            className="table-example"
            //@ts-ignore
            columns={this.checkboxColumns}
            containerClassName="h-scroll-auto"
            itemProvider={itemProvider}
            selection={this.selectionTable}
            role="table"
          />
        </Card> 
        <br/>
        <br/>
        <Button text="Export" primary={true} onClick={this.onExport} />
      </div>
    );
  }
}
