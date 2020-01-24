import { Panel } from "./panel";
import {
  getAllActions,
  getAllRoles,
  RemoveActionFromRole,
  AppendActionToRole,
  CreateRole,
  DeleteRole
} from "./backend";

export class RolePanel extends Panel {
  private editable: boolean;

  /** The constructor. */
  constructor(id: string) {
    super(id);
    this.displayRoles()
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.displayRoles();
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.displayRoles();
  }

  /**
  * Display the role.
  * @param content 
  * @param role 
  */
  displayRole(content: any, role: any) {
    // reset the interface.
    content.removeAllChilds();

    // The start and end time.
    content
      .appendElement({ tag: "div", id: "actions_div" }).down()
      .appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", id: "actions_ul", class: "collection col s12" })

    let actions_div = content.getChildById("actions_div")
    let actions_ul = content.getChildById("actions_ul")

    // append the actions list.
    if (!this.editable) {
      // Now the actions...
      if (role.actions != undefined) {
        for (var j = 0; j < role.actions.length; j++) {
          actions_ul.appendElement({ tag: "li", class: "collection-item", innerHtml: role.actions[j] })
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
          if (role.actions != undefined) {
            for (var i = 0; i < actions.length; i++) {
              if (role.actions.indexOf(actions[i]) == -1) {
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
            let roleId = role._id;

            // save the action in the role.
            AppendActionToRole(
              roleId,
              action,
              () => {
                M.toast({
                  html: "Action " + action + "has been added!",
                  displayLength: 2000
                });

                // re-init the display.
                content.removeAllChilds()
                if (role.actions == null) {
                  role.actions = []
                }

                role.actions.push(action)
                this.displayRole(content, role)
              },
              (err: any) => {
                let msg = JSON.parse(err.message);
                M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
              }
            );

          }
          M.Autocomplete.init(action_input.element, { data: data, onAutocomplete: onAutocomplete })

        },
        (err: any) => {
          let msg = JSON.parse(err.message);
          M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
        })

      // Now the actions...
      if (role.actions != undefined) {
        for (var j = 0; j < role.actions.length; j++) {
          let action = role.actions[j]
          let deleteBtn = actions_ul.appendElement({ tag: "li", class: "collection-item" }).down()
            .appendElement({ tag: "div", class: "row", style: "margin-bottom: 0px;" }).down()
            .appendElement({ tag: "div", class: "col s11", innerHtml: action })
            .appendElement({ tag: "i", class: "tiny material-icons col s1", innerHtml: "remove" }).down()

          deleteBtn.element.onmouseenter = function () {
            this.style.cursor = "pointer"
          }

          deleteBtn.element.onmouseleave = function () {
            this.style.cursor = "default"
          }

          // Here I will remove the action from the application.
          deleteBtn.element.onclick = () => {
            RemoveActionFromRole(role._id, action,
              () => {
                M.toast({
                  html: "Action " + action + "has been remove!",
                  displayLength: 2000
                });

                // remove the action from the actions list
                role.actions.splice(role.actions.indexOf(action), 1);

                // refresh the panel.
                this.displayRole(content, role)
              },
              (err: any) => {
                let msg = JSON.parse(err.message);
                M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
              })
          }
        }
      }
    }
  }

  displayRoles() {
    // clear the panel before recreate information inside it.
    this.div.removeAllChilds()

    getAllRoles((roles: Array<any>) => {
      // Here I will get the list of all applications.
      let div = this.div
        .appendElement({ tag: "div", class: "row" }).down()

      let ul = div
        .appendElement({ tag: "div", class: "col s12 m10 offset-m1" }).down()
        .appendElement({ tag: "ul", class: "collapsible" }).down()

      if (this.editable) {
        let newRoleBtn = div.appendElement({
          tag: "i",
          id: "append_role_btn",
          class: "material-icons col s1",
          title: "Append new role",
          innerHtml: "group_add"
        }).down()

        newRoleBtn.element.onmouseenter = function () {
          this.style.cursor = "pointer";
        };

        newRoleBtn.element.onmouseout = function () {
          this.style.cursor = "default";
        };

        // Append a new role.
        newRoleBtn.element.onclick = () => {

          let roleId = "new_role";
          if(document.getElementById(roleId) != undefined){
            document.getElementById("role_id_input_" + roleId).focus();
            return
          }

          let li = ul.appendElement({ tag: "li" }).down()
          let header = li.appendElement({ tag: "div", class: "collapsible-header" }).down()
          
          let input =  header.appendElement({
            tag: "input",
            id: "role_id_input_" + roleId,
            class: "col s12",
            placeholder: "Role"
          }).down()

          // Set interface element states.
          input.element.focus();
          input.element.onkeyup = (evt: any) => {
            if (evt.keyCode == 13) {
              let roleId = (<HTMLInputElement>input.element).value;
              // Try to create the role.
              CreateRole(
                roleId,
                () => {
                  // summit event.
                  this.displayRoles()
                  // Now I will save the role.
                  M.toast({
                    html: "Role " + roleId + " created with success!",
                    displayLength: 2000
                  });
                },
                (err: any) => {
                  let msg = JSON.parse(err.message);
                  M.toast({ html: msg.ErrorMsg, displayLength: 3500 });
                  this.displayRoles()
                }
              );
            } else if (evt.keyCode == 27) {
              // Cancel event.
              div.parentNode.parentNode.removeChild(div.parentNode);
            }
          };
        };
      }

      for (var i = 0; i < roles.length; i++) {
        let li = ul.appendElement({ tag: "li" }).down()
        let header = li.appendElement({ tag: "div", class: "collapsible-header" }).down()
        let content = li.appendElement({ tag: "div", class: "collapsible-body" }).down()
        let role = roles[i]

        if (this.editable) {
          // Here I will display button to edit applications...
          // The delete icon.
          // the application header.
          header.appendElement({ tag: "span", class: "col s11", innerHtml: role._id })
          let deleteBtn = header.appendElement({ tag: "i", class: "material-icons col s1", innerHtml: "delete" }).down()
          
          // Remove btn action
          deleteBtn.element.onclick = (evt: any) => {
            evt.stopPropagation();
            DeleteRole(
              role._id,
              () => {

                // simply redisplay the whole roles.
                this.displayRoles()

                M.toast({
                  html: "Role " + role._id + " has been removed!",
                  displayLength: 2000
                });
              },
              (err: any) => {
                let msg = JSON.parse(err.message);
                M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
              }
            );
          };
        } else {
          header.appendElement({ tag: "span", class: "col s12", innerHtml: roles[i]._id })
        }
        // Display the application.
        this.displayRole(content, roles[i])
      }

      // init all collapsible panels...
      M.Collapsible.init(ul.element)
    },
      (err: any) => {
        let msg = JSON.parse(err.message);
        M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
      });
  }
}
