import "./App.scss";

import React from "react";
import * as SDK from "azure-devops-extension-sdk";
import { Page } from "azure-devops-ui/Page";
import { showRootComponent } from "../../Common";
import { WorkItemsControl } from "./WorkItemsControl";

export interface IAppState {}

class App extends React.Component<{}, IAppState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      items: [],
      repositories: [],
      branches: [],
    };
  }

  public componentDidMount() {
    this.initializeState();
  }

  private async initializeState(): Promise<void> {
    await SDK.init();
    await SDK.ready();
  }

  public render(): JSX.Element {
    // const { items, repositories, branches } = this.state;
    return (
      //@ts-ignore
      <Page className="item">
        <WorkItemsControl title="Builds" />
      </Page>
    );
  }
}

showRootComponent(<App />);
