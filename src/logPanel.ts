import { Panel } from "./panel";

import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";
import { readLogs, readErrors, getErrorMessage, getAllActions, getLogMethods, resetLogMethod, setLogMethod } from "./backend";


export class LogsPanel extends Panel {
  private actions: Array<string>;
  private editable: boolean;

  constructor(parent: any, actions: Array<string>) {
    super("logs_panel")
    this.actions = actions;
    this.setParent(parent);
    this.displayLogs();

  }

  displayLogs() {
    getLogMethods((methods) => {
      // reset the interface.
      this.div.removeAllChilds();

      // The start and end time.
      this.div
        .appendElement({ tag: "div", id: "actions_div" })
        .down()
        .appendElement({ tag: "div", class: "row" })
        .down()
        .appendElement({
          tag: "ul",
          id: "actions_ul",
          class: "collection col s12"
        });

      let actions_div = this.div.getChildById("actions_div");
      let actions_ul = this.div.getChildById("actions_ul");

      // append the actions list.
      if (!this.editable) {
        // Now the actions...
        if (methods != undefined) {
          for (var j = 0; j < methods.length; j++) {
            actions_ul.appendElement({
              tag: "li",
              class: "collection-item",
              innerHtml: methods[j]
            });
          }
        }
      } else {
        // Here I will append the actions list.
        let action_input = actions_div
          .prependElement({ tag: "div", class: "row" })
          .down()
          .appendElement({ tag: "div", class: "input-field col s12" })
          .down()
          .appendElement({
            tag: "input",
            class: "autocomplete",
            placeholder: "New Action"
          })
          .down();

        let data: any;
        data = {};
        if (methods != undefined) {
          for (var i = 0; i < this.actions.length; i++) {
            if (methods.indexOf(this.actions[i]) == -1) {
              data[this.actions[i]] = null;
            }
          }
        } else {
          for (var i = 0; i < this.actions.length; i++) {
            data[this.actions[i]] = null;
          }
        }
        // The action call on auto complete...
        let onAutocomplete = () => {
          let action = action_input.element.value;
          setLogMethod(action, () => { 
            M.toast({
              html: "Action " + action + "has been added!",
              displayLength: 2000
            });

            this.displayLogs()
          },
            (err: any) => {
              M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
            }
          );
        }

        M.Autocomplete.init(action_input.element, {
          data: data,
          onAutocomplete: onAutocomplete
        });

        // Now the actions...
        if (methods != undefined) {
          for (var j = 0; j < methods.length; j++) {
            let action = methods[j];
            let deleteBtn = actions_ul
              .appendElement({ tag: "li", class: "collection-item" })
              .down()
              .appendElement({
                tag: "div",
                class: "row",
                style: "margin-bottom: 0px;"
              })
              .down()
              .appendElement({ tag: "div", class: "col s11", innerHtml: action })
              .appendElement({
                tag: "i",
                class: "tiny material-icons col s1",
                innerHtml: "remove"
              })
              .down();

            deleteBtn.element.onmouseenter = function () {
              this.style.cursor = "pointer";
            };

            deleteBtn.element.onmouseleave = function () {
              this.style.cursor = "default";
            };

            // Here I will remove the action from the application.
            deleteBtn.element.onclick = () => {
              resetLogMethod(
                action,
                () => {
                  M.toast({
                    html: "Action " + action + "has been remove!",
                    displayLength: 2000
                  });

                  // refresh the panel.
                  this.displayLogs();
                },
                (err: any) => {

                  M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
                }
              );
            };
          }
        }

      }
    },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      }
    );

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
  constructor(parent: any) {
    super("errors_panels")
    this.setParent(parent);

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
    let errorsPanel = this.errorsDiv.appendElement({ tag: "div", class: "col s12 m10 offset-m1" }).down()

    this.logsDiv = this.div.appendElement({ tag: "div", class: "row" }).down()
    let logsPanel = this.logsDiv.appendElement({ tag: "div", class: "col s12 m10 offset-m1" }).down()
      .appendElement({ tag: "div", class: "card" }).down()
      .appendElement({ tag: "div", class: "card-content" }).down()

    getAllActions((actions) => {
      this.logsPanel = new LogsPanel(logsPanel, actions);
      this.errorsPanel = new ErrorsPanel(errorsPanel);

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


  }

  onlogin(data: any) {
    // overide...

  }

  onlogout() {
    // overide...

  }


}