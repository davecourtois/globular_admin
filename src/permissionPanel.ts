import { Panel } from "./panel";
import { eventHub, getFilePermissions, GetAllAccountsInfo, setFilePermission, OwnerType, getAllRoles, GetAllApplicationsInfo, deleteFilePermissions } from "./backend";
import { randomUUID } from "./utility";
import { FilePermission } from "globular-web-client/lib/ressource/ressource_pb";

/**
 * Control permission.
 */
export class PermissionExplorer extends Panel {
  // The file information.
  fileInfo: any;
  editable: boolean;
  content: any;
  permissions: any; // contain the list of permission.
  path: string;

  constructor(parent: any) {
    super(randomUUID());
    //parent.appendElement(this.div);
    super(randomUUID());
    this.div.element.className = "card col s12 m10 offset-m1";
    this.div.element.style.display = "none"
    parent.appendElement(this.div);

    eventHub.subscribe(
      "set_file_event",
      (uuid: string) => { },
      (evt: any) => {
        // Set the dir to display.
        // Here I must retreive the directory from the given path.
        getFilePermissions(this.fileInfo.path,
          (permissions: Array<FilePermission>) => {
            this.path = this.fileInfo.path;
            this.permissions = permissions;
            this.setFile(evt.file);
          },
          (err: any) => {
            console.log(err)
            let msg = JSON.parse(err.message);
            M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
          })
      },
      true
    );
  }

  // Set the file or the directory.
  setFile(fileInfo: any) {
    if (fileInfo == undefined) {
      return
    }

    if (fileInfo.name == "webroot") {
      this.div.element.style.display = "none"
      this.div.element.innerHTML = ""
      return
    }

    this.fileInfo = fileInfo;
    this.div.element.style.display = ""
    this.div.element.innerHTML = ""

    // The name of the file.
    this.content = this.div.appendElement({ tag: "div", class: "row" }).down()
      .appendElement({ tag: "div", class: "card-content" }).down()
      .appendElement({ tag: "span", innerHtml: fileInfo.name, class: "card-title" })
      .appendElement({ tag: "div" }).down()

    // Now I will get the permission for the file/folder... and diplay it.

    // Here I must retreive the directory from the given path.
    getFilePermissions(this.fileInfo.path,
      (permissions: Array<FilePermission>) => {
        this.path = this.fileInfo.path;
        this.permissions = permissions;
        this.displayPermissions()
      },
      (err: any) => {
        console.log(err)
        let msg = JSON.parse(err.message);
        M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
      })
  }

  // Display file permission
  displayPermission(content: any, permission: any, owner: string, ownerType: OwnerType) {

    let div = content.appendElement({ tag: "div" }).down()

    let permissionDiv = div
      .appendElement({ tag: "div", id: "permission_div_0", class: "col s12 m6", style: "display: flex; margin-bottom: 5px;" }).down()
      .appendElement({ tag: "span", innerHtml: owner })
      .appendElement({ tag: "span", innerHtml: permission.path, style: "flex-grow: 1; margin-left: 15px;" }).up()
      .appendElement({ tag: "div", id: "permission_div_1", class: "col s12 m6", style: "display: flex; margin-bottom: 5px;" }).down() // Now the permission itself.

    let permissionReadDiv = permissionDiv.appendElement({ tag: "div", style: "flex-grow: 1; display: flex; align-items: center" }).down()
    permissionReadDiv.appendElement({ tag: "span", innerHtml: "read", style: "margin-right: 15px; margin-left: 5px;" })
    if (!this.editable) {
      // Here I will set icons...
      permissionReadDiv.appendElement({ tag: "i", id: "read_deny_ico", class: "tiny material-icons", innerHtml: "clear" })
        .appendElement({ tag: "i", id: "read_allow_ico", class: "tiny material-icons", innerHtml: "check" })
    } else {
      // Here I will set checkbox.
      permissionReadDiv.appendElement({ tag: "label" }).down()
        .appendElement({ tag: "input", id: "read_checkbox", class: "filled-in", type: "checkbox" })
        .appendElement({ tag: "span" })
    }

    let permissionWriteDiv = permissionDiv.appendElement({ tag: "div", style: "flex-grow: 1; display: flex; align-items: center" }).down()
    permissionWriteDiv.appendElement({ tag: "span", innerHtml: "write", style: "margin-right: 15px; margin-left: 5px;" })

    if (!this.editable) {
      // Here I will set icons...
      permissionWriteDiv.appendElement({ tag: "i", id: "write_deny_ico", class: "tiny material-icons", innerHtml: "clear" })
        .appendElement({ tag: "i", id: "write_allow_ico", class: "tiny material-icons", innerHtml: "check" })
    } else {
      // Here I will set checkbox.
      permissionWriteDiv.appendElement({ tag: "label" }).down()
        .appendElement({ tag: "input", id: "write_checkbox", class: "filled-in", type: "checkbox" })
        .appendElement({ tag: "span" })
    }

    let permissionExecDiv = permissionDiv.appendElement({ tag: "div", style: "flex-grow: 1; display: flex; align-items: center" }).down()

    permissionExecDiv.appendElement({ tag: "span", innerHtml: "execute", style: "margin-right: 15px; margin-left: 5px;" })
    if (!this.editable) {
      // Here I will set icons...
      permissionExecDiv.appendElement({ tag: "i", id: "execute_deny_ico", class: "tiny material-icons", innerHtml: "clear" })
        .appendElement({ tag: "i", id: "execute_allow_ico", class: "tiny material-icons", innerHtml: "check" })
    } else {
      // Here I will set checkbox.
      permissionExecDiv.appendElement({ tag: "label" }).down()
        .appendElement({ tag: "input", id: "exec_checkbox", class: "filled-in", type: "checkbox" })
        .appendElement({ tag: "span" })
    }

    // Mouse over to make reading little easier.
    div.getChildById("permission_div_0").element.onmouseenter = div.getChildById("permission_div_1").element.onmouseenter = () => {
      div.getChildById("permission_div_0").element.style.backgroundColor = "#fafafa"
      div.getChildById("permission_div_1").element.style.backgroundColor = "#fafafa"
    }

    div.getChildById("permission_div_0").element.onmouseleave = div.getChildById("permission_div_1").element.onmouseleave = () => {
      div.getChildById("permission_div_0").element.style.backgroundColor = ""
      div.getChildById("permission_div_1").element.style.backgroundColor = ""
    }

    // Now depending of the permission number I will set the permission.
    if (permission.number == 0) {
      // No permission.
      if (!this.editable) {
        div.getChildById("read_allow_ico").element.style.display = "none"
        div.getChildById("write_allow_ico").element.style.display = "none"
        div.getChildById("execute_allow_ico").element.style.display = "none"
        div.getChildById("read_deny_ico").element.style.display = ""
        div.getChildById("write_deny_ico").element.style.display = ""
        div.getChildById("execute_deny_ico").element.style.display = ""
      } else {
        div.getChildById("read_checkbox").element.checked = false
        div.getChildById("write_checkbox").element.checked = false
        div.getChildById("exec_checkbox").element.checked = false
      }
    } else if (permission.number == 1) {
      // execute
      if (!this.editable) {
        div.getChildById("read_allow_ico").element.style.display = "none"
        div.getChildById("write_allow_ico").element.style.display = "none"
        div.getChildById("execute_allow_ico").element.style.display = ""
        div.getChildById("read_deny_ico").element.style.display = ""
        div.getChildById("write_deny_ico").element.style.display = ""
        div.getChildById("execute_deny_ico").element.style.display = "none"
      } else {
        div.getChildById("read_checkbox").element.checked = false
        div.getChildById("write_checkbox").element.checked = false
        div.getChildById("exec_checkbox").element.checked = true
      }
    } else if (permission.number == 2) {
      // write
      if (!this.editable) {
        div.getChildById("read_allow_ico").element.style.display = "none"
        div.getChildById("write_allow_ico").element.style.display = ""
        div.getChildById("execute_allow_ico").element.style.display = "none"
        div.getChildById("read_deny_ico").element.style.display = ""
        div.getChildById("write_deny_ico").element.style.display = "none"
        div.getChildById("execute_deny_ico").element.style.display = ""
      } else {
        div.getChildById("read_checkbox").element.checked = false
        div.getChildById("write_checkbox").element.checked = true
        div.getChildById("exec_checkbox").element.checked = false
      }
    } else if (permission.number == 3) {
      // Execute + Write.
      if (!this.editable) {
        div.getChildById("read_allow_ico").element.style.display = "none"
        div.getChildById("write_allow_ico").element.style.display = ""
        div.getChildById("execute_allow_ico").element.style.display = ""
        div.getChildById("read_deny_ico").element.style.display = ""
        div.getChildById("write_deny_ico").element.style.display = "none"
        div.getChildById("execute_deny_ico").element.style.display = "none"
      } else {
        div.getChildById("read_checkbox").element.checked = false
        div.getChildById("write_checkbox").element.checked = true
        div.getChildById("exec_checkbox").element.checked = true
      }
    } else if (permission.number == 4) {
      // Read
      if (!this.editable) {
        div.getChildById("read_allow_ico").element.style.display = ""
        div.getChildById("write_allow_ico").element.style.display = "none"
        div.getChildById("execute_allow_ico").element.style.display = "none"
        div.getChildById("read_deny_ico").element.style.display = "none"
        div.getChildById("write_deny_ico").element.style.display = ""
        div.getChildById("execute_deny_ico").element.style.display = ""
      } else {
        div.getChildById("read_checkbox").element.checked = true
        div.getChildById("write_checkbox").element.checked = false
        div.getChildById("exec_checkbox").element.checked = false
      }
    } else if (permission.number == 5) {
      // Read + Execute
      if (!this.editable) {
        div.getChildById("read_allow_ico").element.style.display = ""
        div.getChildById("write_allow_ico").element.style.display = "none"
        div.getChildById("execute_allow_ico").element.style.display = ""
        div.getChildById("read_deny_ico").element.style.display = "none"
        div.getChildById("write_deny_ico").element.style.display = ""
        div.getChildById("execute_deny_ico").element.style.display = "none"
      } else {
        div.getChildById("read_checkbox").element.checked = true
        div.getChildById("write_checkbox").element.checked = false
        div.getChildById("exec_checkbox").element.checked = true
      }
    } else if (permission.number == 6) {
      // Read + Write
      if (!this.editable) {
        div.getChildById("read_allow_ico").element.style.display = ""
        div.getChildById("write_allow_ico").element.style.display = ""
        div.getChildById("execute_allow_ico").element.style.display = "none"
        div.getChildById("read_deny_ico").element.style.display = "none"
        div.getChildById("write_deny_ico").element.style.display = "none"
        div.getChildById("execute_deny_ico").element.style.display = ""
      } else {
        div.getChildById("read_checkbox").element.checked = true
        div.getChildById("write_checkbox").element.checked = true
        div.getChildById("exec_checkbox").element.checked = false
      }
    } else if (permission.number == 7) {
      // Read + Write + Execute
      if (!this.editable) {
        div.getChildById("read_allow_ico").element.style.display = ""
        div.getChildById("write_allow_ico").element.style.display = ""
        div.getChildById("execute_allow_ico").element.style.display = ""
        div.getChildById("read_deny_ico").element.style.display = "none"
        div.getChildById("write_deny_ico").element.style.display = "none"
        div.getChildById("execute_deny_ico").element.style.display = "none"
      } else {
        div.getChildById("read_checkbox").element.checked = true
        div.getChildById("write_checkbox").element.checked = true
        div.getChildById("exec_checkbox").element.checked = true
      }
    }

    if (this.editable) {
      div.getChildById("read_checkbox").element.onchange = div.getChildById("write_checkbox").element.onchange = div.getChildById("exec_checkbox").element.onchange = () => {
        let isRead = div.getChildById("read_checkbox").element.checked
        let isWrite = div.getChildById("write_checkbox").element.checked
        let isExec = div.getChildById("exec_checkbox").element.checked
        let permission_number: number
        if (!isRead && !isWrite && !isExec) {
          permission_number = 0
        } else if (!isRead && !isWrite && isExec) {
          permission_number = 1
        } else if (!isRead && isWrite && !isExec) {
          permission_number = 2
        } else if (!isRead && isWrite && isExec) {
          permission_number = 3
        } else if (isRead && !isWrite && !isExec) {
          permission_number = 4
        } else if (isRead && !isWrite && isExec) {
          permission_number = 5
        } else if (isRead && isWrite && !isExec) {
          permission_number = 6
        } else if (isRead && isWrite && isExec) {
          permission_number = 7
        }

        // Here I will set the permission.
        setFilePermission(permission.path, owner, ownerType, permission_number,
          () => {
            getFilePermissions(this.fileInfo.path,
              (permissions: Array<FilePermission>) => {
                this.path = this.fileInfo.path;
                this.permissions = permissions;
                this.displayPermissions()
              },
              (err: any) => {
                let msg = JSON.parse(err.message);
                M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
              })
            M.toast({ html: "File permission was saved!", displayLength: 2000 });
          },
          (err: any) => {
            console.log(err)
            let msg = JSON.parse(err.message);
            M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
          })
      }

      // Here I will also append the remove button.
      let removePermissionBtn = permissionDiv.appendElement({tag:"i", class:"Small material-icons col s1", innerHtml:"delete"}).down()
      removePermissionBtn.element.onmouseenter = function(){
        this.style.cursor = "pointer"
      }

      removePermissionBtn.element.onmouseleave = function(){
        this.style.cursor = "default"
      }

      // remove the file permission.
      removePermissionBtn.element.onclick = () => {
        deleteFilePermissions(permission.path, owner, 
          ()=>{
            getFilePermissions(this.fileInfo.path,
              (permissions: Array<FilePermission>) => {
                this.path = this.fileInfo.path;
                this.permissions = permissions;
                this.displayPermissions()
              },
              (err: any) => {
                let msg = JSON.parse(err.message);
                M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
              })
            M.toast({ html: "File permission was deleted!", displayLength: 2000 });
          },
        (err: any) => {
          console.log(err)
          let msg = JSON.parse(err.message);
          M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
        })
      }
    }
  }

  // Display file permissions
  displayPermissions() {

    this.content.removeAllChilds()

    // Here I will create the tree section where the permission can belong to.
    let usersPermissionSection = this.content.appendElement({ tag: "div", class: "row" }).down()

    let inputUserRow = usersPermissionSection.appendElement({ tag: "h6", innerHtml: "User(s) Permission", class: "col s12", style: "padding-bottom: 15px;" }).down()
      .appendElement({ tag: "div", class: "row", style: "margin-bottom: 0px;" }).down()

    if (this.editable == true) {

      // here I will append the list of all account...
      GetAllAccountsInfo((accounts: Array<any>) => {
        let user_input = inputUserRow
          .appendElement({ tag: "div", class: "input-field col s4" })
          .down()
          .appendElement({
            tag: "input",
            class: "autocomplete",
            placeholder: "Append User Permission"
          })
          .down();

        let data: any
        data = {}

        // Now I will take the data
        if (this.permissions != undefined) {

          // Here If the user already have a permission for that file I will not append it into the list.
          for (var i = 0; i < accounts.length; i++) {
            let exist = false;
            for (var j = 0; j < this.permissions.length; j++) {
              let permission = this.permissions[j]
              if (permission.user.length != null) {
                if (permission.user == accounts[i]._id) {
                  exist = true;
                  break;
                }
              }
            }
            // append the account if it not already exist.
            if (!exist) {
              data[accounts[i]._id] = null;
            }
          }

        } else {
          // Append all the account in that case.
          for (var i = 0; i < accounts.length; i++) {
            data[accounts[i]._id] = null;
          }
        }

        // on auto complete.
        let onAutocomplete = () => {
          // create new permission for user
          let username = user_input.element.value;
          setFilePermission(this.fileInfo.path, username, OwnerType.User, 0,
            () => {
              // New permission was created...
              getFilePermissions(this.fileInfo.path,
                (permissions: Array<FilePermission>) => {
                  this.path = this.fileInfo.path;
                  this.permissions = permissions;
                  this.displayPermissions()
                },
                (err: any) => {
                  console.log(err)
                  let msg = JSON.parse(err.message);
                  M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
                })

              M.toast({ html: "New permission was created!", displayLength: 2000 });
            },
            (err: any) => {
              console.log(err)
              let msg = JSON.parse(err.message);
              M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
            })
        }

        M.Autocomplete.init(user_input.element, {
          data: data,
          onAutocomplete: onAutocomplete
        });
      },
        (err: any) => {
          console.log(err)
          let msg = JSON.parse(err.message);
          M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
        })
    }

    let rolesPermissionSection = this.content.appendElement({ tag: "div", class: "row", style: "padding: 0px" }).down()
    let inputRoleRow = rolesPermissionSection.appendElement({ tag: "h6", innerHtml: "Role(s) Permission", class: "col s12", style: "padding-bottom: 15px;" }).down()
      .appendElement({ tag: "div", class: "row", style: "margin-bottom: 0px;" }).down()

    if (this.editable == true) {

      // here I will append the list of all account...
      getAllRoles((roles: Array<any>) => {
        let role_input = inputRoleRow
          .appendElement({ tag: "div", class: "input-field col s4" })
          .down()
          .appendElement({
            tag: "input",
            class: "autocomplete",
            placeholder: "Append Role Permission"
          })
          .down();

        let data: any
        data = {}

        // Now I will take the data
        if (this.permissions != undefined) {
  
          // Here If the user already have a permission for that file I will not append it into the list.
          for (var i = 0; i < roles.length; i++) {
            let exist = false;
            for (var j = 0; j < this.permissions.length; j++) {
              let permission = this.permissions[j]
              if (permission.role.length != null) {
                if (permission.role == roles[i]._id) {
                  exist = true;
                  break;
                }
              }
            }
            // append the account if it not already exist.
            if (!exist) {
              data[roles[i]._id] = null;
            }
          }

        } else {
          // Append all the account in that case.
          for (var i = 0; i < roles.length; i++) {
            data[roles[i]._id] = null;
          }
        }

        // on auto complete.
        let onAutocomplete = () => {
          // create new permission for user
          let rolename = role_input.element.value;
          setFilePermission(this.fileInfo.path, rolename, OwnerType.Role, 0,
            () => {
              // New permission was created...
              getFilePermissions(this.fileInfo.path,
                (permissions: Array<FilePermission>) => {
                  this.path = this.fileInfo.path;
                  this.permissions = permissions;
                  this.displayPermissions()
                },
                (err: any) => {
                  console.log(err)
                  let msg = JSON.parse(err.message);
                  M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
                })

              M.toast({ html: "New permission was created!", displayLength: 2000 });
            },
            (err: any) => {
              console.log(err)
              let msg = JSON.parse(err.message);
              M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
            })
        }

        M.Autocomplete.init(role_input.element, {
          data: data,
          onAutocomplete: onAutocomplete
        });
      },
        (err: any) => {
          console.log(err)
          let msg = JSON.parse(err.message);
          M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
        })
    }

    let applciationsPermissionSection = this.content.appendElement({ tag: "div", class: "row", style: "padding: 0px" }).down()
    let inputApplicationRow = applciationsPermissionSection.appendElement({ tag: "h6", innerHtml: "Application(s) Permission", class: "col s12", style: "padding-bottom: 15px;" }).down()
      .appendElement({ tag: "div", class: "row", style: "margin-bottom: 0px;" }).down()

    if (this.editable == true) {

      // here I will append the list of all account...
      GetAllApplicationsInfo((applications: Array<any>) => {
        let application_input = inputApplicationRow
          .appendElement({ tag: "div", class: "input-field col s4" })
          .down()
          .appendElement({
            tag: "input",
            class: "autocomplete",
            placeholder: "Append Application Permission"
          })
          .down();

        let data: any
        data = {}

        // Now I will take the data
        if (this.permissions != undefined) {

          // Here If the user already have a permission for that file I will not append it into the list.
          for (var i = 0; i < applications.length; i++) {
            let exist = false;
            for (var j = 0; j < this.permissions.length; j++) {
              let permission = this.permissions[j]
              if (permission.application.length != null) {
                if (permission.application == applications[i]._id) {
                  exist = true;
                  break;
                }
              }
            }
            // append the account if it not already exist.
            if (!exist) {
              data[applications[i]._id] = null;
            }
          }

        } else {
          // Append all the account in that case.
          for (var i = 0; i < applications.length; i++) {
            data[applications[i]._id] = null;
          }
        }

        // on auto complete.
        let onAutocomplete = () => {
          // create new permission for user
          let applicationName = application_input.element.value;
          setFilePermission(this.fileInfo.path, applicationName, OwnerType.Application, 0,
            () => {
              // New permission was created...
              getFilePermissions(this.fileInfo.path,
                (permissions: Array<FilePermission>) => {
                  this.path = this.fileInfo.path;
                  this.permissions = permissions;
                  this.displayPermissions()
                },
                (err: any) => {
                  console.log(err)
                  let msg = JSON.parse(err.message);
                  M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
                })

              M.toast({ html: "New permission was created!", displayLength: 2000 });
            },
            (err: any) => {
              console.log(err)
              let msg = JSON.parse(err.message);
              M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
            })
        }

        M.Autocomplete.init(application_input.element, {
          data: data,
          onAutocomplete: onAutocomplete
        });
      },
        (err: any) => {
          console.log(err)
          let msg = JSON.parse(err.message);
          M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
        })
    }

    // display the permission in the section...
    let userPermission = new Array<any>();
    let rolePermission = new Array<any>();
    let applicationPermission = new Array<any>();

    for (var i = 0; i < this.permissions.length; i++) {
      if (this.permissions[i].user.length != 0) {
        userPermission.push(this.permissions[i])
      } else if (this.permissions[i].role.length != 0) {
        rolePermission.push(this.permissions[i])
      } else if (this.permissions[i].application.length != 0) {
        applicationPermission.push(this.permissions[i])
      }
    }

    userPermission.sort((a: any, b: any) => (a.user > b.user) ? 1 : ((b.user > a.user) ? -1 : 0));
    for(var i=0; i < userPermission.length; i++){
      this.displayPermission(usersPermissionSection, userPermission[i], userPermission[i].user, OwnerType.User)
    }

    rolePermission.sort((a: any, b: any) => (a.role > b.role) ? 1 : ((b.role > a.role) ? -1 : 0));
    for(var i=0; i < rolePermission.length; i++){
      this.displayPermission(rolesPermissionSection, rolePermission[i], rolePermission[i].role, OwnerType.Role)
    }

    applicationPermission.sort((a: any, b: any) => (a.application > b.application) ? 1 : ((b.application > a.application) ? -1 : 0));
    for(var i=0; i < applicationPermission.length; i++){
      this.displayPermission(applciationsPermissionSection, applicationPermission[i], applicationPermission[i].application, OwnerType.Application)
    }

  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.setFile(this.fileInfo)
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.setFile(this.fileInfo)
  }

}
