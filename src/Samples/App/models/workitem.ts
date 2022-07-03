import { ISimpleListCell } from "azure-devops-ui/List";
import { ISimpleTableCell } from "azure-devops-ui/Table";

export interface IWorkItem extends ISimpleTableCell {
    id: number;
    title: string;
    state: string;
}