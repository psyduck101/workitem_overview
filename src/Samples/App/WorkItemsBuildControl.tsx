import { getClient } from "azure-devops-extension-api";
import { BuildRestClient } from "azure-devops-extension-api/Build";
import { GitRestClient } from "azure-devops-extension-api/Git";
import { Header } from "azure-devops-ui/Header";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import React from "react";
import { Component } from "react";
import { BasicDropdown } from "./BasicDropdown";

export interface IDataAppState {
  definitions: Array<IListBoxItem<{}>>;
  repositories: Array<IListBoxItem<{}>>;
  branches: Array<IListBoxItem<{}>>;
  builds: Array<IListBoxItem<{}>>;
}

export interface IAppState {
  data: any;
}

export class WorkItemsBuildControl extends Component<
  {
    projectId: string | undefined;
    onSelectedBuild: any;
  },
  IAppState
> {
  private startBuildId: number = 0;
  private endBuildId: number = 0;
  private definitionId: number = 0;
  private branchName: string | undefined = undefined;
  private repositoryId: string | undefined = undefined;

  private client: BuildRestClient | undefined;
  private gitClient: GitRestClient | undefined;
  private projectId: string | undefined;

  constructor(props: { projectId: string, onSelectedBuild: any }) {
    super(props);

    this.state = {
      data: {
        definitions: [],
        repositories: [],
        branches: [],
        builds: []
      }
    };
  }

  public componentDidUpdate() {
    this.initializeState();
  }

  private async initializeState(): Promise<void> {
    if(this.projectId !== this.props.projectId)
    {
      this.projectId = this.props.projectId;
      this.client = getClient(BuildRestClient);
      this.gitClient = getClient(GitRestClient);

      if(this.props.projectId) {
        const definitions = await this.client.getDefinitions(this.props.projectId);
        const repositories = await this.gitClient.getRepositories(this.props.projectId);

        this.setState(prevState => ({
          data: { ...prevState.data, 
            definitions: this.mapToDropdownItems(definitions), 
            repositories: repositories ? this.mapToDropdownItems(repositories) : [] }
        }));
      }
    }
  }

  private async retrieveBranches() {
    if(this.repositoryId){
      const branches = await this.gitClient?.getBranches(this.repositoryId);

      this.setState(prevState => ({
        data: { ...prevState.data, 
          branches: branches ? this.mapToDropdownItemsWithoutId(branches) : [] }
      }));
    }
  }

  private async retrieveBuilds() {
    if(this.branchName && this.props.projectId){
      const builds = await this.client?.getBuilds(this.props.projectId, [this.definitionId], undefined, undefined, undefined, undefined, undefined, undefined,
          undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, this.branchName);

      this.setState(prevState => ({
        data: { ...prevState.data, 
          builds: builds ? this.mapToDropdownItemsForBuild(builds) : [] }
      }));
    }
  }

  private async retrieveWorkItems() {
    if(this.startBuildId && this.endBuildId && this.props.projectId){
      this.props.onSelectedBuild(await this.client?.getWorkItemsBetweenBuilds(this.props.projectId, this.startBuildId, this.endBuildId));
    }
  }

  private mapToDropdownItems(items: Array<any>) : IListBoxItem[] {
    return items.map<IListBoxItem>(item => {
      return {
        id: item.id.toString(),
        text: item.name
      }
    });
  }

  //todo properly solve this
  private mapToDropdownItemsWithoutId(items: Array<any>) : IListBoxItem[] {
    return items.map<IListBoxItem>(item => {
      return {
        id: item.name,
        text: item.name
      }
    });
  }

  private mapToDropdownItemsForBuild(items: Array<any>) : IListBoxItem[] {
    return items.map<IListBoxItem>(item => {
      return {
        id: item.id.toString(),
        text: item.buildNumber
      }
    });
  }

  private onSelectDefinition = (
    definitionId: string
  ) => {
    if (definitionId) {
      this.definitionId = parseInt(definitionId);
    }
  };

  private onSelectRepository = async (
    repositoryId: string
  ) => {
    if (repositoryId) {
      this.repositoryId = repositoryId;
      await this.retrieveBranches();
    }
  };

  private onSelectBranch = async (
    branchName: string
  ) => {
    if (branchName) {
      this.branchName = 'refs/heads/' + branchName;
      await this.retrieveBuilds();
    }
  };

  private onSelectStartBuild = async (
    buildId: string
  ) => {
    if (buildId) {
      this.startBuildId = parseInt(buildId);
      await this.retrieveWorkItems();
    }
  };

  private onSelectEndBuild = async (
    buildId: string
  ) => {
    if (buildId) {
      this.endBuildId = parseInt(buildId);
      await this.retrieveWorkItems();
    }
  };

  public render(): JSX.Element {
    const { definitions, repositories, branches, builds } = this.state.data;
    return (
      <div>
        <div>
          <BasicDropdown
            placeHolder="Select definitions"
            onSelectedItem={this.onSelectDefinition}
            items={definitions}
          />
          <BasicDropdown
            placeHolder="Select repositories"
            onSelectedItem={this.onSelectRepository}
            items={repositories}
          />
          <BasicDropdown
            placeHolder="Select branches"
            onSelectedItem={this.onSelectBranch}
            items={branches}
          />
          <BasicDropdown
            placeHolder="Select start build"
            onSelectedItem={this.onSelectStartBuild}
            items={builds}
          />
          <BasicDropdown
            placeHolder="Select end build"
            onSelectedItem={this.onSelectEndBuild}
            items={builds}
          />
        </div>
      </div>
    );
  }
}
