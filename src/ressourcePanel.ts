import { Panel } from "./panel";
import { PermissionExplorer, PermissionPanel } from "./permissionPanel";
import { getAllActions, getErrorMessage, readAllActionPermission, setActionPermission, removeActionPermission } from "./backend";
import { randomUUID } from "./utility";

/**
 * Panel to be use to manage ressource access other than files.
 * A ressource is somthing with a path. A path is a string with hierachy 
 * where the symbol '/' is use as level marquer.
 */
export class RessourceManager extends Panel {
  private ActionPermissionManager: ActionPermissionManager;
  private permissionExplorer: PermissionExplorer; // delete file, rename fiel etc...
  constructor() {
    super("ressource_manager");

    // create the ressource action permission manager.
    this.ActionPermissionManager = new ActionPermissionManager();
    this.ActionPermissionManager.setParent(this.div)
  }
}

/**
 * That panel is use to set ressource action permission. 
 * The action permission can be READ | WRITE | DELETE or any combination of those permission.
 */
class ActionPermissionManager extends Panel {
  private editable: boolean;

  // The ressource manager
  constructor() {
    super("ressource_action_permission_manager");
    this.editable = false;
    this.displayPermissions();
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.displayPermissions();
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.displayPermissions();
  }

  displayPermissions() {
    this.div.removeAllChilds();

    // Display the header.
    let content = this.div.appendElement({ tag: "div", class: "card col s12", style: "padding: 10px;" }).down();

    content.appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "col s8", style: "border-right: 1px solid lightgray;", innerHtml: "Action(s)" })
      .appendElement({ tag: "div", class: "col s4", innerHtml: "Permission(s)" })

    if (this.editable) {
      // In that case I will append the action selector.
      getAllActions(
        (actions: Array<string>) => {
          // In that case I wil get the list of all operations.
          // Here I will append the actions list.
          let action_input = content
            .prependElement({ tag: "div", class: "row" })
            .down()
            .appendElement({ tag: "div", class: "input-field col s8" })
            .down()
            .appendElement({
              tag: "input",
              class: "autocomplete",
              placeholder: "New Action"
            })
            .down();

          let data: any;
          data = {};
          for (var i = 0; i < actions.length; i++) {
            data[actions[i]] = null;
          }

          // The action call on auto complete...
          let onAutocomplete = () => {
            let action = action_input.element.value;
            setActionPermission(action, 0,
              () => {
                M.toast({
                  html: "Action pemission " + action + " has been added!",
                  displayLength: 2000
                });
                this.displayPermissions()
              }, (err: any) => {
                M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
              });
          }

          // call after the ressource actions are retreived.
          let callback = () => {
            M.Autocomplete.init(action_input.element, {
              data: data,
              onAutocomplete: onAutocomplete
            });
          }

          readAllActionPermission(
            (actionPermission: Array<any>) => {
              // remove existing permission... 
              for (var i = 0; i < actionPermission.length; i++) {
                delete data[actionPermission[i].action]
              }
              callback() // done remove already existing values.
            },
            (err: any) => {
              callback() // simply go to callback.
            })
        },
        (err: any) => {
          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        });
    }

    // Display all permissions.
    readAllActionPermission(
      (actionPermission: Array<any>) => {
        // remove existing permission... 
        for (var i = 0; i < actionPermission.length; i++) {
          let action = actionPermission[i].action;
          let permission = actionPermission[i].permission;
          let div = content.appendElement({ tag: "div", class: "row", style: "padding: 0px; margin: 0px;" }).down();
          div.appendElement({ tag: "div", id: "permission_div_0", class: "input-field col s12 m8", style: "padding: 0px; margin: 0px;", innerHtml: action })
          let permissionDiv = div.appendElement({ tag: "div", id: "permission_div_1", class: "input-field col s12 m4", style: "padding: 0px; margin: 0px; display: flex; margin-bottom: 5px;" }).down()

          // Mouse over to make reading little easier.
          div.getChildById("permission_div_0").element.onmouseenter = div.getChildById("permission_div_1").element.onmouseenter = () => {
            div.getChildById("permission_div_0").element.style.backgroundColor = "#fafafa"
            div.getChildById("permission_div_1").element.style.backgroundColor = "#fafafa"
          }

          div.getChildById("permission_div_0").element.onmouseleave = div.getChildById("permission_div_1").element.onmouseleave = () => {
            div.getChildById("permission_div_0").element.style.backgroundColor = ""
            div.getChildById("permission_div_1").element.style.backgroundColor = ""
          }

          // Set the permission panel.
          new PermissionPanel(randomUUID(), permissionDiv, permission,
            // on change permission
            (permission_number: number) => {
              setActionPermission(action, permission_number, ()=>{
                this.displayPermissions() 
                M.toast({ html: action + " permission was change!", displayLength: 2000 });
              },
              (err: any) => {
                M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
              })
            },
            // On delete callback
            () => {
              removeActionPermission(action, ()=>{
                this.displayPermissions() 
                M.toast({ html: action + " permission was deleted!", displayLength: 2000 });
              },
              (err: any) => {
                M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
              })
            }, this.editable)
        }
      },
      (err: any) => {
        /** nothing to do here... */
      })


  }
}