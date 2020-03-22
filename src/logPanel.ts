import { Panel } from "./panel";
// User interface section.

import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";

import { getErrorMessage, getAllActions, eventHub, readLogs, clearAllLog } from "./backend";
import { LogInfo, LogType } from "globular-web-client/lib/ressource/ressource_pb";
import { fireResize } from "./utility.js";
import "@davecourtois/elementui/components/table/table.js";

export class ErrosPanel extends Panel {
  private editable: boolean;
  private ul: any;
  private logs: Map<string, Array<LogInfo>>;

  constructor(parent: any) {
    super("logs_panel")
    this.setParent(parent);
  }

  displayErrors(logs: Array<LogInfo>) {
    this.div.removeAllChilds();
    this.ul = this.div.appendElement({ tag: "ul", class: "collapsible" }).down()
    this.logs = new Map<string, Array<LogInfo>>();
    for (var i = 0; i < logs.length; i++) {
      if (!this.logs.has(logs[i].getMethod())) {
        this.logs.set(logs[i].getMethod(), new Array<LogInfo>())
        this.ul.appendElement({ tag: "li" }).down()
          .appendElement({ tag: "div", class: "collapsible-header", id: logs[i].getMethod() + "_header" }).down()
          .appendElement({ tag: "span", innerHtml: logs[i].getMethod() }).up()
          .appendElement({ tag: "div", class: "collapsible-body" }).down()
          .appendElement({ tag: "div", class: "row" }).down()
          .appendElement({ tag: "ul", class: "collection col s12", id: logs[i].getMethod() + "_body" })
      }
      this.logs.get(logs[i].getMethod()).push(logs[i])
      this.displayError(logs[i]);
    }

    M.Collapsible.init(this.ul.element)
  }

  displayError(info: LogInfo) {

    let body = this.ul.getChildById(info.getMethod() + "_body")
    if (body != undefined) {
      if (this.editable == true) {
        body.appendElement({ tag: "li", class: "collection-item", innerHtml: new Date(info.getDate() * 1000).toDateString() + " " + new Date(info.getDate() * 1000).toLocaleTimeString() })
      } else {
        body.appendElement({ tag: "li", class: "collection-item", innerHtml: new Date(info.getDate() * 1000).toDateString() + " " + new Date(info.getDate() * 1000).toLocaleTimeString() })
      }
    }
  }

  onlogin(data: any) {
    // overide...
    this.editable = true;

  }

  onlogout() {
    // overide...
    this.editable = false;
  }
}


/**
 * This class is use to manage file on the server.
 */
export class LogManager extends Panel {

  // if true it means the log is editable.
  private logsDiv: any;
  private errorsDiv: any;
  private errorsPanel: ErrosPanel;
  private listeners: Map<string, string>;
  private logs: Array<LogInfo>;
  private errors: Array<LogInfo>;

  // File panel constructor.
  constructor(id: string) {
    super(id);

    // Keep track of listeners.
    this.listeners = new Map<string, string>();
    this.logs = new Array<LogInfo>();
    this.errors = new Array<LogInfo>();

    let ul = this.div.appendElement({ tag: "div", class: "row", style: "margin: 0px" }).down()
      .appendElement({ tag: "div", class: "col s12 /*m10 offset-m1*/", style: "padding: 10px;" }).down()
      .appendElement({ tag: "ul", class: "tabs", id: "logs_tabs" }).down()

    let log = ul.appendElement({ tag: "li", class: "tab col s6" }).down()
      .appendElement({ tag: "a", href: "javascript:void(0)", innerHtml: "Log(s)", class: "grey-text text-darken-3 active" }).down()

    let error = ul.appendElement({ tag: "li", class: "tab col s6" }).down()
      .appendElement({ tag: "a", href: "javascript:void(0)", innerHtml: "Error(s)", class: "grey-text text-darken-3" }).down()

    this.errorsDiv = this.div.appendElement({ tag: "div", class: "row", style: "display: none;" }).down()
    let errorsPanel = this.errorsDiv.appendElement({ tag: "div", class: "col s12 /*m10 offset-m1*/" }).down()

    this.logsDiv = this.div.appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s12 /*m10 offset-m1*/" }).down()

    this.errorsPanel = new ErrosPanel(errorsPanel);

    getAllActions((actions) => {
      for (var i = 0; i < actions.length; i++) {
        let action = actions[i];
        eventHub.subscribe(action, (uuid) => {
          this.listeners.set(action, uuid);
        }, (evt: any) => {
          // When log about user is created.
          evt = JSON.parse(evt)
          let info = new LogInfo()
          info.setApplication(evt.application)
          info.setDate(parseInt(evt.date))
          info.setMethod(evt.method)
          info.setUserid(evt.userId)
          info.setMessage(evt.message)

          if (evt.message != undefined) {
            info.setType(LogType.ERROR)
            this.errors.push(info)
            this.errorsPanel.displayErrors(this.errors);
          } else {
            info.setType(LogType.INFO)
            this.logs.push(info)

            let row = new Array<any>();
            row.push(info.getMethod())
            row.push(info.getApplication())
            row.push(info.getUsername())
            row.push(new Date(info.getDate() * 1000))
            let table = <any>document.getElementById("log_table");
            if (table != undefined) {
              table.data.unshift(row)
              table.sort();
              table.refresh();
            }
            fireResize();
          }

        }, false)
      }

    },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );

    // Here I will set the tabs logics.
    error.element.onclick = () => {
      this.logsDiv.element.style.display = "none"
      this.errorsDiv.element.style.display = "block"
    }

    log.element.onclick = () => {
      this.errorsDiv.element.style.display = "none"
      this.logsDiv.element.style.display = "block"
    }

    // overide...
    readLogs((logs: Array<LogInfo>) => {
      for (var i = 0; i < logs.length; i++) {
        let info = logs[i];
        if (info.getMessage().length > 0) {
          this.errors.push(info);
        } else {
          this.logs.push(info);
        }
      }
      this.errorsPanel.displayErrors(this.errors);
      this.initLogTable();

    },
      (err: any) => {

        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );

  }

  //let errorsPanel = this.logsDiv.appendElement({ tag: "div", class: "col s12 /*m10 offset-m1*/" }).down()
  initLogTable() {
    var table = <any>(document.createElement("table-element"))
    var header = <any>(document.createElement("table-header-element"))
    table.id = "log_table";
    header.fixed = true;

    // Create the dom table element
    table.appendChild(header)
    table.rowheight = 35
    table.style.width = "1260px"
    table.style.maxHeight = "700px";
    table.data = []


    for (var i = 0; i < this.logs.length; i++) {
      let row = new Array<any>();
      row.push(this.logs[i].getMethod())
      row.push(this.logs[i].getApplication())
      row.push(this.logs[i].getUsername())
      row.push(new Date(this.logs[i].getDate() * 1000))
      table.data.unshift(row)
    }

    // Create the column headers.
    // The method
    var methodHeaderCell = <any>(document.createElement("table-header-cell-element"))
    methodHeaderCell.innerHTML = "<table-sorter-element></table-sorter-element><div>Method</div> <table-filter-element></table-filter-element>"
    methodHeaderCell.style.minWidth = "320px";
    header.appendChild(methodHeaderCell)

    // The application
    var applicationHeaderCell = <any>(document.createElement("table-header-cell-element"))
    applicationHeaderCell.innerHTML = "<table-sorter-element></table-sorter-element><div>Application</div> <table-filter-element></table-filter-element>"
    header.appendChild(applicationHeaderCell)

    // The application
    var userHeaderCell = <any>(document.createElement("table-header-cell-element"))
    userHeaderCell.innerHTML = "<table-sorter-element></table-sorter-element><div>User</div> <table-filter-element></table-filter-element>"
    header.appendChild(userHeaderCell)

    // The creation date
    var dateHeaderCell = <any>(document.createElement("table-header-cell-element"))
    dateHeaderCell.innerHTML = "<table-sorter-element></table-sorter-element><div>Date</div> <table-filter-element></table-filter-element>"
    dateHeaderCell.onrender = function (div: any, value: any) {
      if (value != undefined) {
        div.innerHTML = value.toDateString() + " " + value.toLocaleTimeString();
      }
    }
    header.appendChild(dateHeaderCell)

    this.logsDiv.element.appendChild(table)

    table.menu.getChildById("delete-filtere-menu-item").element.action = () => {
      let values = table.getFilteredData();
      for (var i = 0; i < values.length; i++) {
        console.log(values[i])
      }

    }

    table.menu.getChildById("delete-all-data-menu-item").element.action = () => {
      clearAllLog(LogType.INFO, () => {
        M.toast({ html: "All logs are deleted!", displayLength: 2000 });
        table.data = new Array<any>();
        table.refresh();
        fireResize();
      },
        (err: any) => {
          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );
    }
  }

  onlogin(data: any) {
    this.errorsPanel.onlogin(null); // be sure the editable variable is set.
    this.errorsPanel.displayErrors(this.logs)
    document.getElementById("delete-filtere-menu-item").style.display = "block"
    document.getElementById("delete-all-data-menu-item").style.display = "block"

  }

  onlogout() {
    this.errorsPanel.onlogin(null); // be su
    // overide...
    this.errorsPanel.displayErrors(this.logs)
    document.getElementById("delete-filtere-menu-item").style.display = "none"
    document.getElementById("delete-all-data-menu-item").style.display = "none"

  }


}