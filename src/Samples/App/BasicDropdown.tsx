import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Dropdown, DropdownExpandableButton } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { Observer } from "azure-devops-ui/Observer";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import React from "react";
import { Component } from "react";

export interface IDropdownState {
  items: Array<IListBoxItem<{}>>;
}

export class BasicDropdown extends Component<
  { onSelectedItem: any; placeHolder: string, items: Array<IListBoxItem<{}>> },
  IDropdownState
> {
  private selection = new DropdownSelection();
  private selectedItem = new ObservableValue<string>("");

  constructor(props: { onSelectedItem: any; placeHolder: string, items: Array<IListBoxItem<{}>>}) {
    super(props);

    this.state = {
      items: props.items
    };
  }

  public componentDidUpdate() {
    if(this.state.items != this.props.items){
      this.setState({items: this.props.items});
    }
  }

  public render(): JSX.Element {
    const { items } = this.state;
    return (
      <Observer selectedItem={this.selectedItem}>
        {() => (
          <Dropdown
            ariaLabel={
              this.selectedItem.value
                ? "Button Dropdown " + this.selectedItem.value + " selected"
                : "Button Dropdown " + this.props.placeHolder
            }
            className="example-dropdown"
            placeholder={this.props.placeHolder}
            items={items}
            selection={this.selection}
            renderExpandable={(props) => (
              <DropdownExpandableButton {...props} />
            )}
            onSelect={this.onSelect}
          />
        )}
      </Observer>
    );
  }

  private onSelect = (
    event: React.SyntheticEvent<HTMLElement>,
    item: IListBoxItem<{}>
  ) => {
    this.props.onSelectedItem(item.id);
  };
}
