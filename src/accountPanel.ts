/**
 * This class is use to manage file on the server.
 */
import { Panel } from "./panel";
import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";
import { eventHub } from './backend';
import {
  getAllRoles,
  GetAllAccountsInfo,
  DeleteAccount,
  AppendRoleToAccount,
  RemoveRoleFromAccount,
  registerAccount
} from "./backend";

/**
 * This class is use to manage file on the server.
 */
export class AccountManager extends Panel {
  private editable: boolean;

  // File panel constructor.
  constructor(id: string) {
    super(id);
    this.displayAccounts();

    // Emit when user click on the path
    eventHub.subscribe(
      "update_role_event",
      (uuid: string) => {},
      (evt: any) => {
        // Set the dir to display.
        // Here I must retreive the directory from the given path.
        this.displayAccounts();
      },
      true
    );
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.displayAccounts();
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.displayAccounts();
  }

  /**
   * Display the account.
   * @param content
   * @param account
   */
  displayAccount(content: any, account: any) {
    // reset the interface.
    content.removeAllChilds();

    // The start and end time.
    content
      //.appendElement({ tag: "div", class: "row" }).down()
      //.appendElement({ tag: "div", class: "col s2", innerHtml: "path" })
      //.appendElement({ tag: "div", class: "col s10", innerHtml: path }).up()
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({ tag: "div", class: "col s2", innerHtml: "roles" })
      .appendElement({ tag: "div", id: "roles_div", class: "col s10" })
      .down()
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({
        tag: "div",
        id: "roles_ul",
        class: "collection col s12"
      });

    let roles_div = content.getChildById("roles_div");
    let roles_ul = content.getChildById("roles_ul");

    // append the roles list.
    if (!this.editable) {
      // Now the roles...
      if (account.roles != undefined) {
        for (var j = 0; j < account.roles.length; j++) {
          roles_ul.appendElement({
            tag: "li",
            class: "collection-item",
            innerHtml: account.roles[j].$id
          });
        }
      }
    } else {
      // Here I will append the roles list.
      let role_input = roles_div
        .prependElement({ tag: "div", class: "row" })
        .down()
        .appendElement({ tag: "div", class: "input-field col s12" })
        .down()
        .appendElement({
          tag: "input",
          class: "autocomplete",
          placeholder: "Append Role"
        })
        .down();

      getAllRoles(
        (roles: any) => {
          let data: any;
          data = {};
          if (account.roles != undefined) {
            for (var i = 0; i < roles.length; i++) {
              let exist = false;
              for (var j = 0; j < account.roles.length; j++) {
                console.log("---> ", account.roles[j]);
                if (account.roles[j].$id == roles[i]._id) {
                  exist = true;
                  break;
                }
              }
              if (!exist) {
                data[roles[i]._id] = null;
              }
            }
          } else {
            for (var i = 0; i < roles.length; i++) {
              data[roles[i]._id] = null;
            }
          }
          // The action call on auto complete...
          let onAutocomplete = () => {
            let role = role_input.element.value;
            let accountId = account._id;

            // save the action in the role.
            AppendRoleToAccount(
              accountId,
              role,
              () => {
                M.toast({
                  html: "Role " + role + " has been added!",
                  displayLength: 2000
                });

                // re-init the display.
                content.removeAllChilds();
                if (account.roles == null) {
                  account.roles = [];
                }

                account.roles.push({
                  $id: role,
                  $db: "local_ressource",
                  $ref: "local_ressource"
                });
                this.displayAccount(content, account);
              },
              (err: any) => {
                let msg = JSON.parse(err.message);
                M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
              }
            );
          };
          M.Autocomplete.init(role_input.element, {
            data: data,
            onAutocomplete: onAutocomplete
          });
        },
        (err: any) => {
          let msg = JSON.parse(err.message);
          M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
        }
      );

      // Now the roles...
      if (account.roles != undefined) {
        for (var j = 0; j < account.roles.length; j++) {
          let role = account.roles[j];
          let deleteBtn = roles_ul
            .appendElement({ tag: "li", class: "collection-item" })
            .down()
            .appendElement({
              tag: "div",
              class: "row",
              style: "margin-bottom: 0px;"
            })
            .down()
            .appendElement({
              tag: "div",
              class: "col s11",
              innerHtml: role.$id
            })
            .appendElement({
              tag: "i",
              class: "tiny material-icons col s1",
              innerHtml: "remove"
            })
            .down();

          deleteBtn.element.onmouseenter = function() {
            this.style.cursor = "pointer";
          };

          deleteBtn.element.onmouseleave = function() {
            this.style.cursor = "default";
          };

          // Here I will remove the role from the account.
          deleteBtn.element.onclick = () => {
            RemoveRoleFromAccount(
              account._id,
              role.$id,
              () => {
                M.toast({
                  html: "Role " + role.$id + " has been remove!",
                  displayLength: 2000
                });

                // remove the role from the roles list
                let roles = new Array<any>();
                for (var i = 0; i < account.roles.length; i++) {
                  if (account.roles[i].$id != role.$id) {
                    roles.push(account.roles[i]);
                  }
                }

                // set back the roles.
                account.roles = roles;

                // refresh the panel.
                this.displayAccount(content, account);
              },
              (err: any) => {
                let msg = JSON.parse(err.message);
                M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
              }
            );
          };
        }
      }
    }
  }

  displayAccounts() {
    // clear the panel before recreate information inside it.
    this.div.removeAllChilds();

    let newRoleBtn = this.div
      .appendElement({ tag: "div", class: "row", style: "margin-bottom: 0px;" })
      .down()
      .appendElement({
        tag: "nav",
        class: "card col s12 m10 offset-m1 indigo darken-4"
      })
      .down()
      .appendElement({ tag: "nav-wrapper" })
      .down()
      .appendElement({ tag: "a", class: "modal-trigger", href: "#modal1" })
      .down()
      .appendElement({
        tag: "i",
        id: "append_role_btn",
        class: "material-icons col s1",
        title: "Create new account",
        innerHtml: "person_add"
      })
      .down();

    newRoleBtn.element.onmouseenter = function() {
      this.style.cursor = "pointer";
    };

    newRoleBtn.element.onmouseout = function() {
      this.style.cursor = "default";
    };

    // Append a new role.
    newRoleBtn.element.onclick = () => {
      // Here I will create a modal dialog where the user will create a new account.
      let modal = this.div
        .appendElement({ tag: "div", class: "modal", id: "modal1" })
        .down();

      modal
        .appendElement({ tag: "div", class: "modal-content" })
        .down()
        .appendElement({ tag: "h5", innerHtml: "Create Account" })
        .appendElement({ tag: "div", id: "content" })
        .up()
        .appendElement({ tag: "div", class: "modal-footer" })
        .down()
        .appendElement({
          tag: "a",
          class: "modal-close waves-effect waves-green btn-flat",
          id: "create_account_btn",
          innerHtml: "Save"
        });

      let content = modal.getChildById("content");

      // Here I will set the account values.
      content
        .appendElement({ tag: "div", class: "row" })
        .down()
        .appendElement({ tag: "div", class: "input-field col s12" })
        .down()
        .appendElement({
          tag: "input",
          placeholder: "",
          id: "user_name",
          type: "text",
          class: "validate"
        })
        .appendElement({
          tag: "label",
          for: "user_name",
          innerHtml: "Username"
        })
        .up()
        .appendElement({ tag: "div", class: "input-field col s12" })
        .down()
        .appendElement({
          tag: "input",
          placeholder: "",
          id: "user_email",
          type: "email",
          class: "validate"
        })
        .appendElement({ tag: "label", for: "user_email", innerHtml: "Email" })
        .up()
        .appendElement({ tag: "div", class: "input-field col s12" })
        .down()
        .appendElement({
          tag: "input",
          placeholder: "",
          id: "user_password",
          type: "password"
        })
        .appendElement({
          tag: "label",
          for: "user_password",
          innerHtml: "Password"
        })
        .up()
        .appendElement({ tag: "div", class: "input-field col s12" })
        .down()
        .appendElement({
          tag: "input",
          placeholder: "",
          id: "user_password_validate",
          type: "password"
        })
        .appendElement({
          tag: "label",
          for: "user_password_validate",
          innerHtml: "Password validate"
        })
        .up();

      let createAccountBtn = modal.getChildById("create_account_btn");
      createAccountBtn.element.onclick = () => {
        let username = modal.getChildById("user_name").element.value;
        let email = modal.getChildById("user_email").element.value;
        let pwd = modal.getChildById("user_password").element.value;
        let pwd_ = modal.getChildById("user_password_validate").element.value;

        // Here I will register the account.
        registerAccount(
          username,
          email,
          pwd,
          pwd_,
          (result: any) => {
            console.log(result);
          },
          (err: any) => {
            let msg = JSON.parse(err.message);
            M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
          }
        );
      };

      M.Modal.init(modal.element, {});
    };

    GetAllAccountsInfo(
      (accounts: Array<any>) => {
        let div = this.div.appendElement({ tag: "div", class: "row" }).down();
        // Here I will get the list of all accounts.
        let ul = div
          .appendElement({ tag: "div", class: "col s12 m10 offset-m1" })
          .down()
          .appendElement({ tag: "ul", class: "collapsible" })
          .down();

        for (var i = 0; i < accounts.length; i++) {
          let li = ul.appendElement({ tag: "li" }).down();
          let header = li
            .appendElement({ tag: "div", class: "collapsible-header" })
            .down();
          let content = li
            .appendElement({ tag: "div", class: "collapsible-body" })
            .down();
          let account = accounts[i];
          if (this.editable) {
            // Here I will display button to edit accounts...
            // The delete icon.
            // the account header.
            header.appendElement({
              tag: "span",
              class: "col s11",
              innerHtml: account._id
            });
            let deleteBtn = header
              .appendElement({
                tag: "i",
                class: "material-icons col s1",
                innerHtml: "delete"
              })
              .down();

            // Now the remove account action.
            deleteBtn.element.onclick = () => {
              DeleteAccount(
                account._id,
                () => {
                  M.toast({
                    html: "account " + account._id + " have been removed!",
                    displayLength: 2000
                  });
                  // refresh the interface.
                  this.displayAccounts();
                },
                (err: any) => {
                  let msg = JSON.parse(err.message);
                  M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
                }
              );
            };
          } else {
            header.appendElement({
              tag: "span",
              class: "col s12",
              innerHtml: account._id
            });
          }
          // Display the account.
          console.log(account);
          this.displayAccount(content, account);
        }

        // init all collapsible panels...
        M.Collapsible.init(ul.element);
      },
      (err: any) => {
        let msg = JSON.parse(err.message);
        M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
      }
    );
  }
}
