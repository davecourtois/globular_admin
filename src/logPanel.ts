import { Panel } from "./panel";

import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";
import { readLogs, readErrors, getErrorMessage } from "./backend";

/**
 * This class is use to manage file on the server.
 */
export class LogManager extends Panel {

  // if true it means the log is editable.
  private editable: boolean;
  private logsDiv: any;
  private logsPanel: any;
  private errorsDiv: any;
  private errorsPanel: any;

  // File panel constructor.
  constructor(id: string) {
    super(id);

    let ul = this.div.appendElement({ tag: "div", class: "row", style: "margin: 0px" }).down()
      .appendElement({ tag: "div", class: "col s12 m10 offset-m1", style: "padding: 10px;" }).down()
      .appendElement({ tag: "ul", class: "tabs", id: "logs_tabs" }).down()

    let log = ul.appendElement({ tag: "li", class: "tab col s6" }).down()
      .appendElement({ tag: "a", href: "javascript:void(0)", innerHtml: "Log(s)", class: "grey-text text-darken-3 active" }).down()

    let error = ul.appendElement({ tag: "li", class: "tab col s6" }).down()
      .appendElement({ tag: "a", href: "javascript:void(0)", innerHtml: "Error(s)", class: "grey-text text-darken-3" }).down()

    this.errorsDiv = this.div.appendElement({ tag: "div", class: "row", style: "display: none;" }).down()
    this.errorsPanel = this.errorsDiv.appendElement({ tag: "div", class: "col s12 m10 offset-m1" }).down()

    this.logsDiv = this.div.appendElement({ tag: "div", class: "row" }).down()
    this.logsPanel = this.logsDiv.appendElement({ tag: "div", class: "col s12 m10 offset-m1" }).down()
      .appendElement({ tag: "div", class: "card" }).down()
      .appendElement({ tag: "div", class: "card-content" }).down()

    // Here I will set the tabs logics.
    error.element.onclick = () => {
      this.logsDiv.element.style.display = "none"
      this.errorsDiv.element.style.display = ""
    }

    log.element.onclick = () => {
      this.logsDiv.element.style.display = ""
      this.errorsDiv.element.style.display = "none"
    }

    this.setErrors();
    this.setLogs();
  }

  setLog(log: any) {
    let date = new Date(log.date * 1000)
    this.logsPanel.appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s3 m3", innerHtml: date.toLocaleDateString() + " " + date.toLocaleTimeString() })
      .appendElement({ tag: "div", class: "col s3 m2", innerHtml: log.application })
      .appendElement({ tag: "div", class: "col s3 m2", innerHtml: log.userId })
      .appendElement({ tag: "div", class: "col s12 m3", innerHtml: log.method })
  }

  /**
   * That function is use to display all logs.
   */
  setLogs() {
    // Here I will clear up all the element of the log panel.
    this.logsPanel.removeAllChilds()
    this.logsPanel.appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s3 m3", innerHtml: "Time" })
      .appendElement({ tag: "div", class: "col s3 m2", innerHtml: "Application" })
      .appendElement({ tag: "div", class: "col s3 m2", innerHtml: "User" })
      .appendElement({ tag: "div", class: "col s12 m3", innerHtml: "Method" })


    readLogs((logs: Array<any>) => {
      for (var i = 0; i < logs.length; i++) {
        this.setLog(logs[i])
      }
    }, 
    (err:any)=>{
      M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
    })
  }

  setError(error: any) {
    let date = new Date(error.date * 1000)
    this.errorsPanel
      .appendElement({ tag: "div", class: "card" }).down()
      .appendElement({ tag: "div", class: "card-content" }).down()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "Date" })
      .appendElement({ tag: "div", class: "col s10", innerHtml: date.toLocaleDateString() + " " + date.toLocaleTimeString() }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "Application" })
      .appendElement({ tag: "div", class: "col s10", innerHtml: error.application }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "User" })
      .appendElement({ tag: "div", class: "col s10", innerHtml: error.userId }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "Method" })
      .appendElement({ tag: "div", class: "col s10", innerHtml: error.method }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "Error" })
      .appendElement({ tag: "div", class: "col s10", style:"overflow: auto;", innerHtml: error.error }).up()

  }

  setErrors() {
    // Here I will clear up all the element of the log panel.
    this.logsPanel.removeAllChilds()
    readErrors((errors: Array<any>) => {
      for (var i = 0; i < errors.length; i++) {
        this.setError(errors[i])
      }
    }, 
    (err:any)=>{
      M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
    })
  }

  onlogin(data: any) {
    // overide...

  }

  onlogout() {
    // overide...

  }


}