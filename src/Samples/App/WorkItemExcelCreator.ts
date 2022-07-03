import { TableColumnProperties, TableProperties, Workbook } from "exceljs";
import { IWorkItem } from "./models/workitem";
import {saveAs} from "file-saver";

export class WorkItemExcelCreator {

    public async createExcel(fileName : string, workItems : Array<IWorkItem>) {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Workitems');
        const rows =  this.createBuildRows(workItems);
        worksheet.addTable(this.createTable('Workitems', this.createBuildColumns(), rows));

        const buffer = await workbook.xlsx.writeBuffer();
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const fileExtension = '.xlsx';
        const blob = new Blob([buffer], {type: fileType});

        saveAs(blob, fileName + fileExtension);
    }

    private createBuildColumns() {
        return [
            {name: 'Id', filterButton: true},
            {name: 'Title', filterButton: false},
            {name: 'State', filterButton: true},
          ];
    }

    private createBuildRows(workItems : Array<IWorkItem>) : Array<Array<any>> {
        return workItems.map(x => [x.id, x.title, x.state]);
    }

    private createTable(name: string, columns: Array<TableColumnProperties>, rows: Array<Array<any>>) : TableProperties {
        return {
            name: name,
            ref: 'A1',
            headerRow: true,
            columns: columns,
            rows: rows
        }
    }
}