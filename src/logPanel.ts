import { Panel } from "./panel";

import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";
import { getErrorMessage, getAllActions, eventHub, getNumbeOfLogsByMethod, readLogs } from "./backend";
import { LogInfo } from "globular-web-client/lib/ressource/ressource_pb";

export class LogsPanel extends Panel {
  private editable: boolean;

  constructor(parent: any) {
    super("logs_panel")
    this.setParent(parent);
    this.displayLogs();

  }

  displayLogs() {
    /*getNumbeOfLogsByMethod((results:Array<any>)=>{
      console.log("---> ", results)
    }, (err:any)=>{
      console.log("---> ", err)
    })*/
  }

  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.displayLogs()

  }

  onlogout() {
    // overide...
    this.editable = false;
    this.displayLogs()
  }
}

export class ErrorsPanel extends Panel {
  private editable: boolean;

  constructor(parent: any) {
    super("errors_panels")
    this.setParent(parent);

  }

  displayErrors() {

  }

  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.displayErrors()
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.displayErrors()
  }

}

/**
 * This class is use to manage file on the server.
 */
export class LogManager extends Panel {

  // if true it means the log is editable.
  private editable: boolean;
  private logsDiv: any;
  private errorsDiv: any;
  private logsPanel: LogsPanel;
  private errorsPanel: ErrorsPanel;
  private listeners: Map<string, string>;

  // File panel constructor.
  constructor(id: string) {
    super(id);

    // Keep track of listeners.
    this.listeners = new Map<string, string>();

    let ul = this.div.appendElement({ tag: "div", class: "row", style: "margin: 0px" }).down()
      .appendElement({ tag: "div", class: "col s12 m10 offset-m1", style: "padding: 10px;" }).down()
      .appendElement({ tag: "ul", class: "tabs", id: "logs_tabs" }).down()

    let log = ul.appendElement({ tag: "li", class: "tab col s6" }).down()
      .appendElement({ tag: "a", href: "javascript:void(0)", innerHtml: "Log(s)", class: "grey-text text-darken-3 active" }).down()

    let error = ul.appendElement({ tag: "li", class: "tab col s6" }).down()
      .appendElement({ tag: "a", href: "javascript:void(0)", innerHtml: "Error(s)", class: "grey-text text-darken-3" }).down()

    this.errorsDiv = this.div.appendElement({ tag: "div", class: "row", style: "display: none;" }).down()
    let errorsPanel = this.errorsDiv.appendElement({ tag: "div", class: "col s12 m10 offset-m1" }).down()

    this.logsDiv = this.div.appendElement({ tag: "div", class: "row" }).down()
    let logsPanel = this.logsDiv.appendElement({ tag: "div", class: "col s12 m10 offset-m1" }).down()
      .appendElement({ tag: "div", class: "card" }).down()
      .appendElement({ tag: "div", class: "card-content" }).down()

    getAllActions((actions) => {
      this.logsPanel = new LogsPanel(logsPanel);
      this.errorsPanel = new ErrorsPanel(errorsPanel);

      for (var i = 0; i < actions.length; i++) {
        let action = actions[i];
        eventHub.subscribe(action, (uuid) => {
          this.listeners.set(action, uuid);
        }, (evt: any) => {
          console.log("---------> event receive! ", evt)
          // Here I will refresh logs...
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
      this.errorsDiv.element.style.display = ""
    }

    log.element.onclick = () => {
      this.logsDiv.element.style.display = ""
      this.errorsDiv.element.style.display = "none"
    }

    // overide...
    readLogs((logs: Array<LogInfo>) => {
      console.log(logs)
    },
      (err: any) => {

        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );

  }

  onlogin(data: any) {
    this.editable = true;

  }

  onlogout() {
    this.editable = false;
    // overide...

  }


}