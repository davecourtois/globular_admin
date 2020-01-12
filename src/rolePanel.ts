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
  private allActions: Array<string>;
  private roles: Array<any>;

  /** The read only roles */
  private readOnlyRolesDiv: any;

  /** The role editor panel */
  private editRolesDiv: any;

  /** The constructor. */
  constructor(id: string) {
    super(id);

    // Retreive the list of all actions and keep it in a local variable.
    getAllActions(
      (actions: Array<string>) => {
        this.allActions = actions;
        getAllRoles(
          (roles: Array<any>) => {
            this.roles = roles;
            this.displayReadOnlyRoles();
          },
          (err: any) => {}
        );
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    console.log("Panel --> onlogin: ", this.id);
    this.displayEditRoles();
  }

  onlogout() {
    // overide...
    this.displayReadOnlyRoles();
  }

  // Display the readOnly role.
  displayReadOnlyRoles() {
    if (this.editRolesDiv != null) {
      this.editRolesDiv.element.innerHTML = "";
    }

    if (this.readOnlyRolesDiv == null) {
      this.readOnlyRolesDiv = this.div
        .appendElement({ tag: "div", class: "row" })
        .down()
        .appendElement({ tag: "div", class: "col s12 m8 offset-m2" })
        .down();
    } else {
      this.readOnlyRolesDiv.element.innerHTML = "";
    }

    // Create a collapsible panel.
    let collapsiblePanel = this.readOnlyRolesDiv
      .appendElement({ tag: "ul", id: "roles_list", class: "collapsible" })
      .down();

    /** Here I will display the roles in accordeon panel. */
    for (var i = 0; i < this.roles.length; i++) {
      let content = collapsiblePanel
        .appendElement({ tag: "li" })
        .down()
        .appendElement({
          tag: "div",
          class: "collapsible-header",
          style: "display: flex; align-items: center;"
        })
        .down()
        .appendElement({ tag: "span", innerHtml: this.roles[i]._id })
        .up()
        .appendElement({ tag: "div", class: "collapsible-body" })
        .down();

      let actionsList = content
        .appendElement({ tag: "ul", class: "collection" })
        .down();
      if (this.roles[i].actions == null) {
        this.roles[i].actions = new Array<string>();
      }
      for (var j = 0; j < this.roles[i].actions.length; j++) {
        actionsList.appendElement({
          tag: "li",
          class: "collection-item",
          innerHtml: this.roles[i].actions[j]
        });
      }
    }
    M.Collapsible.init(document.getElementById("roles_list"));
  }

  // Display read and write role editor.
  displayEditRoles() {
    if (this.readOnlyRolesDiv != null) {
      this.readOnlyRolesDiv.element.innerHTML = "";
    }

    if (this.editRolesDiv == null) {
      this.editRolesDiv = this.div
        .appendElement({ tag: "div", class: "row" })
        .down()
        .appendElement({
          tag: "i",
          id: "append_role_btn",
          class: "material-icons",
          title: "Append new role",
          style: "",
          innerHtml: "add"
        })
        .appendElement({ tag: "div", class: "col s12 m8 offset-m2" })
        .down();
    } else {
      this.editRolesDiv.element.innerHTML = "";
    }

    let collapsiblePanel = this.editRolesDiv
      .appendElement({ tag: "ul", id: "roles_list", class: "collapsible" })
      .down();

    /**
     * Set the action.
     * @param action The action
     */
    let setAction = (roleId: string, action: string, actionsList: any) => {
      for (var i = 0; i < this.roles.length; i++) {
        if (this.roles[i]._id == roleId) {
          if (this.roles[i].actions.indexOf(action) == -1) {
            this.roles[i].actions.push(action);
          }
        }
      }

      let action_editor = actionsList
        .prependElement({ tag: "li", class: "collection-item" })
        .down()
        .appendElement({
          tag: "label",
          style: "display: flex; align-items: center;"
        })
        .down();

      // display the name of the ation...

      let action_span = action_editor
        .appendElement({
          tag: "span",
          innerHtml: action,
          style: "flex-grow: 1;"
        })
        .down();
      let deleteActionBtn = action_editor
        .appendElement({
          tag: "i",
          class: "tiny material-icons",
          style: "z-index: 10; cursor: default;",
          innerHtml: "remove"
        })
        .down();

      deleteActionBtn.element.onmouseenter = function() {
        this.style.cursor = "pointer";
      };

      deleteActionBtn.element.onmouseout = function() {
        this.style.cursor = "default";
      };

      // The onclick element.
      deleteActionBtn.element.onclick = () => {
        action_editor.element.parentNode.parentNode.removeChild(
          action_editor.element.parentNode
        );
        // remove the action from the role.
        RemoveActionFromRole(
          action,
          roleId,
          () => {
            M.toast({
              html: "Action " + action + " has been removed!",
              displayLength: 2000
            });
          },
          (err: any) => {
            let msg = JSON.parse(err.message);
            M.toast({ html: msg, displayLength: 3500 });
          }
        );
      };
    };

    let SetRole = (role: any, roleId: string) => {
      let content = collapsiblePanel
        .appendElement({ tag: "li", id: roleId })
        .down()
        .appendElement({
          tag: "div",
          id: "append_action_div_" + roleId,
          class: "collapsible-header",
          style: "display: flex; align-items: center;"
        })
        .down()
        .appendElement({
          tag: "i",
          id: "remove_role_btn_" + roleId,
          class: "tiny material-icons col s1",
          title: "Delete role",
          style: "display: none;",
          innerHtml: "delete"
        })
        .appendElement({
          tag: "span",
          id: "role_id_span_" + roleId,
          class: "col s10"
        })
        .appendElement({
          tag: "input",
          id: "role_id_input_" + roleId,
          style: "display: none",
          class: "col s12",
          placeholder: "Role"
        })
        .appendElement({
          tag: "i",
          id: "append_action_btn_" + roleId,
          class: "tiny material-icons col s1 right-align",
          title: "Append new action",
          style: "display: none;",
          innerHtml: "add"
        })
        .up()
        .appendElement({ tag: "div", class: "collapsible-body" })
        .down();

      let actionsList = content
        .appendElement({ tag: "ul", class: "collection" })
        .down();
      let appendActionBtn = collapsiblePanel.getChildById(
        "append_action_btn_" + roleId
      );

      let deletRoleBtn = collapsiblePanel.getChildById(
        "remove_role_btn_" + roleId
      );
      deletRoleBtn.element.onmouseenter = function() {
        this.style.cursor = "pointer";
      };

      deletRoleBtn.element.onmouseout = function() {
        this.style.cursor = "default";
      };

      deletRoleBtn.element.onclick = (evt: any) => {
        evt.stopPropagation();
        DeleteRole(
          role._id,
          () => {
            let div = document.getElementById(roleId);
            div.parentNode.removeChild(div);
            // remove the role from the list.
            for (var i = 0; i < this.roles.length; i++) {
              if (this.roles[i]._id == roleId) {
                this.roles = this.roles.splice(i, 1);
                break;
              }
            }
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

      let span = document.getElementById("role_id_span_" + roleId);
      if (role._id.length > 0) {
        span.innerHTML = role._id;
        if (roleId != "sa" && roleId != "guest") {
          deletRoleBtn.element.style.display = "";
        }
      }

      // Append a new action to a role.
      appendActionBtn.element.onclick = (evt: any) => {
        evt.stopPropagation();
        // So here I will create the autocomplete selection.
        if (document.getElementById("autocomplete_" + roleId) == undefined) {
          let data: any;
          data = {};
          for (var i = 0; i < this.allActions.length; i++) {
            if (role.actions.indexOf(this.allActions[i]) == -1) {
              data[this.allActions[i]] = null;
            }
          }

          // Do nothing if no data are availables.
          if (Object.keys(data).length == 0) {
            return;
          }

          let action_editor = actionsList
            .prependElement({
              tag: "li",
              class: "row",
              id: "autocomplete_" + roleId,
              style: "min-height: 250px;"
            })
            .down();
          action_editor
            .appendElement({ tag: "div", class: "input-field col s12" })
            .down()
            .appendElement({
              tag: "input",
              id: "autocomplete_input_" + roleId,
              class: "autocomplete",
              placeholder: "Action"
            })
            .appendElement({
              tag: "label",
              for: "autocomplete_input_" + roleId
            });

          // remove the editor on change.
          let onAutocomplete = () => {
            // remove the editor.
            let action = (<HTMLInputElement>(
              document.getElementById("autocomplete_input_" + roleId)
            )).value;
            action_editor.element.parentNode.removeChild(action_editor.element);

            // save the action in the role.
            AppendActionToRole(
              action,
              roleId,
              () => {
                M.toast({
                  html: "Action " + action + "has been added!",
                  displayLength: 2000
                });
                setAction(roleId, action, actionsList);
              },
              (err: any) => {
                let msg = JSON.parse(err.message);
                M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
              }
            );
          };

          // Here I will append the list of action in the autocomplete.
          M.Autocomplete.init(
            document.getElementById("autocomplete_input_" + roleId),
            { data: data, onAutocomplete: onAutocomplete }
          );
          document.getElementById("autocomplete_input_" + roleId).focus();
          document.getElementById("autocomplete_input_" + roleId).onkeyup = (
            evt: any
          ) => {
            if (evt.keyCode == 27) {
              action_editor.element.parentNode.removeChild(
                action_editor.element
              );
            }
          };
        }
      };

      // Create the list of action.
      for (var j = 0; j < role.actions.length; j++) {
        let action = role.actions[j];
        setAction(roleId, action, actionsList);
      }
    };

    let newRoleBtn = this.div.getChildById("append_role_btn");
    newRoleBtn.element.onmouseenter = function() {
      this.style.cursor = "pointer";
    };

    newRoleBtn.element.onmouseout = function() {
      this.style.cursor = "default";
    };

    // Append a new role.
    newRoleBtn.element.onclick = () => {
      let roleId = "new_role";
      let div = document.getElementById("append_action_div_" + roleId);
      if (div == undefined) {
        SetRole({ _id: "", actions: [] }, roleId);
      }

      div = document.getElementById("append_action_div_" + roleId);
      let span = document.getElementById("role_id_span_" + roleId);
      let input = document.getElementById("role_id_input_" + roleId);
      let appendActionBtn = document.getElementById(
        "append_action_btn_" + roleId
      );

      // Set interface element states.
      appendActionBtn.style.display = "none";
      span.style.display = "none";
      input.style.display = "";
      input.focus();

      input.onkeyup = (evt: any) => {
        console.log(evt);
        if (evt.keyCode == 13) {
          let roleId = (<HTMLInputElement>input).value;
          // Try to create the role.
          CreateRole(
            roleId,
            () => {
              // summit event.
              div.parentNode.parentNode.removeChild(div.parentNode);
              let role = { _id: roleId, actions: new Array<string>() };
              SetRole(role, roleId);
              this.roles.push(role);

              // Now I will save the role.
              M.toast({
                html: "Role " + roleId + " created with success!",
                displayLength: 2000
              });
            },
            (err: any) => {
              let msg = JSON.parse(err.message);
              M.toast({ html: msg.ErrorMsg, displayLength: 3500 });
              // remove the panel.
              div.parentNode.parentNode.removeChild(div.parentNode);
            }
          );
        } else if (evt.keyCode == 27) {
          // Cancel event.
          div.parentNode.parentNode.removeChild(div.parentNode);
        }
      };
    };

    /** Here I will display the roles in accordeon panel. */
    for (var i = 0; i < this.roles.length; i++) {
      let role = this.roles[i];
      SetRole(role, role._id);
    }

    M.Collapsible.init(document.getElementById("roles_list"), {
      onOpenEnd: (li: any) => {
        let btn = document.getElementById("append_action_btn_" + li.id);
        btn.style.display = "";
      },
      onCloseEnd: (li: any) => {
        let btn = document.getElementById("append_action_btn_" + li.id);
        btn.style.display = "none";
      }
    });
  }
}
