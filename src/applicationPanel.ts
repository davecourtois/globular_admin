import { Panel } from "./panel";
import { GetAllApplicationsInfo, getAllActions, AppendActionToApplication, RemoveActionFromApplication, DeleteApplication } from "./backend";
import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";

/**
 * This class is use to manage file on the server.
 */
export class ApplicationManager extends Panel {
  private editable: boolean;

  // File panel constructor.
  constructor(id: string) {
    super(id);
    this.displayApplications()
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.displayApplications()
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.displayApplications()
  }

  /**
   * Display the application.
   * @param content 
   * @param application 
   */
  displayApplication(content: any, application: any) {
    // reset the interface.
    content.removeAllChilds();

    // The start and end time.
    let startTime = new Date(application.creation_date * 1000)
    let releasedTime = new Date(application.last_deployed * 1000)
    let path: string = application.path.split("webroot")[1].replace("\\", "/")
    let url: string = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + path
    content.appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "path" })
      .appendElement({ tag: "div", class: "col s10", innerHtml: path }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "created the" })
      .appendElement({ tag: "div", class: "col s10", innerHtml: startTime.toLocaleDateString() + " " + startTime.toLocaleTimeString() }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "released the" })
      .appendElement({ tag: "div", class: "col s10", innerHtml: releasedTime.toLocaleDateString() + " " + releasedTime.toLocaleTimeString() }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "link" })
      .appendElement({ tag: "a", class: "col s10", href: url, innerHtml: url }).up()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "actions" })
      .appendElement({ tag: "div", id: "actions_div", class: "col s10" }).down()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", id: "actions_ul", class: "collection col s12" })

    let actions_div = content.getChildById("actions_div")
    let actions_ul = content.getChildById("actions_ul")

    // append the actions list.
    if (!this.editable) {
      // Now the actions...
      if (application.actions != undefined) {
        for (var j = 0; j < application.actions.length; j++) {
          actions_ul.appendElement({ tag: "li", class: "collection-item", innerHtml: application.actions[j] })
        }
      }
    } else {
      // Here I will append the actions list.
      let action_input = actions_div.prependElement({ tag: "div", class: "row" }).down()
        .appendElement({ tag: "div", class: "input-field col s12" }).down()
        .appendElement({ tag: "input", class: "autocomplete", placeholder: "New Action" }).down()

      getAllActions(
        (actions: any) => {
          // console.log(actions)
          let data: any;
          data = {};
          if (application.actions != undefined) {
            for (var i = 0; i < actions.length; i++) {
              if (application.actions.indexOf(actions[i]) == -1) {
                data[actions[i]] = null
              }
            }
          } else {
            for (var i = 0; i < actions.length; i++) {
              data[actions[i]] = null
            }
          }
          // The action call on auto complete...
          let onAutocomplete = () => {
            let action = action_input.element.value;
            let applicationId = application._id;

            // save the action in the role.
            AppendActionToApplication(
              applicationId,
              action,
              () => {
                M.toast({
                  html: "Action " + action + "has been added!",
                  displayLength: 2000
                });

                // re-init the display.
                content.removeAllChilds()
                if (application.actions == null) {
                  application.actions = []
                }

                application.actions.push(action)
                this.displayApplication(content, application)
              },
              (err: any) => {
                
                M.toast({ html: err.message, displayLength: 2000 });
              }
            );

          }
          M.Autocomplete.init(action_input.element, { data: data, onAutocomplete: onAutocomplete })

        },
        (err: any) => {
          
          M.toast({ html: err.message, displayLength: 2000 });
        })

      // Now the actions...
      if (application.actions != undefined) {
        for (var j = 0; j < application.actions.length; j++) {
          let action = application.actions[j]
          let deleteBtn = actions_ul.appendElement({ tag: "li", class: "collection-item" }).down()
            .appendElement({ tag: "div", class: "row", style: "margin-bottom: 0px;" }).down()
            .appendElement({ tag: "div", class: "col s11", innerHtml: action })
            .appendElement({ tag: "i", class: "tiny material-icons col s1", innerHtml: "remove" }).down()

          deleteBtn.element.onmouseenter = function(){
            this.style.cursor = "pointer"
          }

          deleteBtn.element.onmouseleave = function(){
            this.style.cursor = "default"
          }

          // Here I will remove the action from the application.
          deleteBtn.element.onclick = () => {
            RemoveActionFromApplication(application._id, action,
              () => {
                M.toast({
                  html: "Action " + action + "has been remove!",
                  displayLength: 2000
                });

                // remove the action from the actions list
                application.actions.splice( application.actions.indexOf(action),1); 

                // refresh the panel.
                this.displayApplication(content, application)
              },
              (err: any) => {
                
                M.toast({ html: err.message, displayLength: 2000 });
              })
          }
        }
      }
    }
  }

  displayApplications() {
    // clear the panel before recreate information inside it.
    this.div.removeAllChilds()
    GetAllApplicationsInfo((applications: Array<any>) => {
      // Here I will get the list of all applications.
      let ul = this.div
        .appendElement({ tag: "div", class: "row" }).down()
        .appendElement({ tag: "div", class: "col s12 m10 offset-m1" }).down()
        .appendElement({ tag: "ul", class: "collapsible" }).down()

      for (var i = 0; i < applications.length; i++) {
        let li = ul.appendElement({ tag: "li" }).down()
        let header = li.appendElement({ tag: "div", class: "collapsible-header" }).down()
        let content = li.appendElement({ tag: "div", class: "collapsible-body" }).down()
        let application =  applications[i]
        if (this.editable) {
          // Here I will display button to edit applications...
          // The delete icon.
          // the application header.
          header.appendElement({ tag: "span", class: "col s11", innerHtml: application._id })
          let deleteBtn = header.appendElement({ tag: "i", class: "material-icons col s1", innerHtml: "delete" }).down()

          // Now the remove application action.
          deleteBtn.element.onclick = ()=>{
            DeleteApplication(application._id, 
              ()=>{
                M.toast({ html: "Application " + application._id + " have been removed!", displayLength: 2000 });
                // refresh the interface.
                this.displayApplications()
              },
              (err: any) => {
                
                M.toast({ html: err.message, displayLength: 2000 });
              })
          }

        } else {
          header.appendElement({ tag: "span", class: "col s12", innerHtml: application._id })
        }
        // Display the application.
        this.displayApplication(content, application)
      }

      // init all collapsible panels...
      M.Collapsible.init(ul.element)
    },
      (err: any) => {
        
        M.toast({ html: err.message, displayLength: 2000 });
      });
  }

}