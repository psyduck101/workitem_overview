import { WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { Button } from "azure-devops-ui/Button";
import React from "react";
import { Component } from "react";
import { IWorkItem } from "./models/workitem";
import { WorkItemExcelCreator } from "./WorkItemExcelCreator";

export class ExcelExporter extends Component<{
  isReleasesType: boolean;
  items: Array<IWorkItem>;
}> {
  constructor(props: { isReleasesType: boolean, items: Array<IWorkItem> }) {
    super(props);
  }

  private onExport() {
    const excelExporter = new WorkItemExcelCreator();
    excelExporter.createExcel(
      this.props.isReleasesType ? "exportreleases.xlsx" : "exportbuilds",
      this.props.items
    );
  }

  public render(): JSX.Element {
    return <Button text="Export" primary={true} onClick={this.onExport} />;
  }
}
