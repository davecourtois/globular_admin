import { Panel } from "./panel";
import { GetAllFilesInfo, eventHub, renameFile, deleteDir, deleteFile } from "./backend";
import { randomUUID } from "./utility";

export class FileManager extends Panel {
  private pathNavigator: PathNavigator;
  private fileNavigator: FileNavigator;
  private permissionExplorer: PermissionExplorer; // delete file, rename fiel etc...
  private webRoot: any; // contain all file information.
  private directories: Map<string, any>;

  constructor() {
    super(randomUUID());
    this.div.element.className = "row";
    this.directories = new Map<string, any>();

    // Create the path navigator.
    this.pathNavigator = new PathNavigator(this.div);

    // Create the file navigator.
    this.fileNavigator = new FileNavigator(this.div);

    // first off all will get the file info that contain all directory and file information.
    GetAllFilesInfo(
      (filesInfo: any) => {
        this.webRoot = filesInfo;
        // Here I will keep all directory reference into the directories map.
        let setDirectories = (dir: any) => {
          for (var i = 0; i < dir.files.length; i++) {
            let file = dir.files[i];
            if (file.files != undefined) {
              this.directories.set(file.path, file);
              setDirectories(file);
            }
          }
        };

        this.setDirectory(this.webRoot);

        // put all directories in the directories map.
        this.directories.set(this.webRoot.path, this.webRoot);
        setDirectories(this.webRoot);

        // Emit when the user click on file icon.
        eventHub.subscribe(
          "set_dir_event",
          (uuid: string) => {},
          (evt: any) => {
            // Set the dir to display.
            this.setDirectory(evt.dir);
          },
          true
        );

        // Emit when user click on the path
        eventHub.subscribe(
          "set_path_event",
          (uuid: string) => {},
          (evt: any) => {
            // Set the dir to display.
            // Here I must retreive the directory from the given path.
            this.setDirectory(this.directories.get(evt.path));
          },
          true
        );
        
        // emit delete dire event.
        eventHub.subscribe(
          "delete_file_event",
          (uuid: string) => {},
          (evt: any) => {
            GetAllFilesInfo(
              (filesInfo: any) => {
                this.directories = new Map<string, any>();
                this.webRoot = filesInfo;
                // put all directories in the directories map.
                this.directories.set(this.webRoot.path, this.webRoot);
                setDirectories(this.webRoot);

                this.setDirectory(this.directories.get(evt.path));
              },
              (err: any) => {
                let msg = JSON.parse(err.message);
                M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
              }
            );
          },
          true
        );

        // emit when a user change a file name.
        eventHub.subscribe(
          "rename_file_event",
          (uuid: string) => {},
          (evt: any) => {
            GetAllFilesInfo(
              (filesInfo: any) => {
                this.directories = new Map<string, any>();
                this.webRoot = filesInfo;
                // put all directories in the directories map.
                this.directories.set(this.webRoot.path, this.webRoot);
                setDirectories(this.webRoot);

                this.setDirectory(this.directories.get(evt.path));
              },
              (err: any) => {
                let msg = JSON.parse(err.message);
                M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
              }
            );
          },
          true
        );
      },
      (err: any) => {
        let msg = JSON.parse(err.message);
        M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
      }
    );
  }

  setDirectory(dir: any) {
    this.pathNavigator.setPath(dir.path);
    this.fileNavigator.setDir(dir);
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    console.log("Panel --> onlogin: ", this.id);
  }

  onlogout() {
    // overide...
  }
}

/**
 * Navigator from the path.
 */
class PathNavigator {
  private div: any;

  constructor(parent: any) {
    this.div = parent
      .appendElement({
        tag: "nav",
        class: "card col s12 m8 offset-m2 indigo darken-4"
      })
      .down()
      .appendElement({ tag: "div", class: "nav-wrapper" })
      .down()
      .appendElement({ tag: "div" })
      .down();
  }

  // Set the active path.
  setPath(path: string) {
    this.div.removeAllChilds();

    let values = path.split("/");
    for (var i = 0; i < values.length; i++) {
      if (values[i].length > 0) {
        let lnk = this.div
          .appendElement({
            tag: "a",
            innerHtml: values[i],
            class: "breadcrumb"
          })
          .down();

        lnk.element.onmouseenter = function() {
          this.style.cursor = "pointer";
        };
        lnk.element.onmouseleave = function() {
          this.style.cursor = "default";
        };
        let index = i + 1;

        lnk.element.onclick = () => {
          let path_ = "/";
          for (var j = 1; j < index; j++) {
            path_ += values[j];
            if (j < index - 1) {
              path_ += "/";
            }
          }
          eventHub.publish("set_path_event", { path: path_ }, true);
        };
      }
    }
  }
}

class FilePanel {
  private div: any;

  constructor(parent: any) {
    this.div = parent
      .appendElement({
        tag: "div",
        class: "row",
        style: "margin: 0px; padding: 5px;"
      })
      .down();
  }

  /**
   * Set the diplayed file/folder in the panel.
   * @param file
   */
  setFile(file: any, editable: boolean) {
    this.div.removeAllChilds();

    // In that case I will set the
    if (editable) {
      let ico: any;
      if (file.files != undefined) {
        ico = this.div
          .appendElement({
            tag: "i",
            class: "Small material-icons col s1",
            innerHtml: "folder"
          })
          .down();
      } else {
        ico = this.div
          .appendElement({
            tag: "i",
            class: "Small material-icons col s1",
            innerHtml: "insert_drive_file"
          })
          .down();
      }

      // The file name link...
      this.div
        .appendElement({
          tag: "div",
          class: "col s5"
        })
        .down()
        .appendElement({
          tag: "a",
          id: "file_lnk",
          heref: "javascript:void(0)",
          innerHtml: file.name,
          class: "col s10"
        })
        .appendElement({
          tag: "i",
          id: "file_edit_lnk",
          class: "Small material-icons col s2",
          innerHtml: "edit"
        })
        .appendElement({
          tag: "input",
          id: "file_edit_input",
          class: "col s10",
          style: "display: none",
          value: file.name
        })
        .appendElement({
          tag: "i",
          id: "file_save_lnk",
          class: "Small material-icons col s2",
          style: "display: none",
          innerHtml: "save"
        });

      let lnk = this.div.getChildById("file_lnk");
      let edit_lnk = this.div.getChildById("file_edit_lnk");
      let edit_input = this.div.getChildById("file_edit_input");
      let save_lnk = this.div.getChildById("file_save_lnk");

      /**
       * Display name input.
       */
      edit_lnk.element.onclick = () => {
        lnk.element.style.display = "none";
        edit_lnk.element.style.display = "none";
        edit_input.element.style.display = "";
        save_lnk.element.style.display = "";
        edit_input.element.focus();
        edit_input.element.setSelectionRange(
          0,
          edit_input.element.value.length
        );
      };

      /**
       * Rename the file or directory.
       */
      save_lnk.element.onclick = () => {
        lnk.element.style.display = "";
        edit_lnk.element.style.display = "";
        edit_input.element.style.display = "none";
        save_lnk.element.style.display = "none";

        // Save the file...
        let path = file.path.substring(0, file.path.lastIndexOf("/"));
        renameFile(
          path,
          edit_input.element.value,
          file.name,
          () => {
            M.toast({
              html:
                "file " +
                lnk.element.innerHTML +
                " was rename to " +
                edit_input.element.value,
              displayLength: 2000
            });
            lnk.element.innerHTML = edit_input.element.value;
            // emit event.
            eventHub.publish(
              "rename_file_event",
              { file: file, path: path },
              true
            );
          },
          (err: any) => {
            let msg = JSON.parse(err.message);
            M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
          }
        );
      };

      let lastModified = new Date(file.last_modified * 1000);
      this.div.appendElement({
        tag: "div",
        class: "col s3",
        innerHtml:
          lastModified.toLocaleDateString() +
          " " +
          lastModified.toLocaleTimeString()
      });

      let fileSizeDiv = this.div
        .appendElement({
          tag: "div",
          class: "col s2"
        })
        .down();

      if (file.files == undefined) {
        if (file.size > 1024) {
          if (file.size > 1024 * 1024) {
            if (file.size > 1024 * 1024 * 1024) {
              let fileSize = file.size / (1024 * 1024 * 1024);
              fileSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Gb";
            } else {
              let fileSize = file.size / (1024 * 1024);
              fileSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Mb";
            }
          } else {
            let fileSize = file.size / 1024;
            fileSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Kb";
          }
        } else {
          fileSizeDiv.element.innerHTML = file.size + " bytes";
        }
      } else {
        // publish local event.
        ico.element.onclick = () => {
          eventHub.publish("set_dir_event", { dir: file }, true);
        };
      }

      // I will append a delete button in that particular case.
      let deleteFileBtn = this.div
        .appendElement({
          tag: "i",
          class: "Small material-icons col s1",
          innerHtml: "delete"
        })
        .down();

      save_lnk.element.onmouseenter = deleteFileBtn.element.onmouseenter = edit_lnk.element.onmouseenter = ico.element.onmouseenter = lnk.element.onmouseenter = function() {
        this.style.cursor = "pointer";
      };

      save_lnk.element.onmouseleave = deleteFileBtn.element.onmouseleave = edit_lnk.element.onmouseleave = ico.element.onmouseleave = lnk.element.onmouseleave = function() {
        this.style.cursor = "default";
      };

      deleteFileBtn.element.onclick = () => {
        let path = file.path.substring(0, file.path.lastIndexOf("/"));
        if (file.files != undefined) {
          // here I will delete a directory
          deleteDir(
            file.path,
            () => {
              M.toast({
                html: "Dir " + file.name + " was deleted!",
                displayLength: 2000
              });
              lnk.element.innerHTML = edit_input.element.value;
              // emit event.
              eventHub.publish(
                "delete_file_event",
                { file: file, path: path },
                true
              );
            },
            (err: any) => {
              let msg = JSON.parse(err.message);
              M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
            }
          );
        } else {
          // here I will delete a file.
          deleteFile(
            file.path,
            () => {
              M.toast({
                html: "file " + file.name + " was deleted!",
                displayLength: 2000
              });
              lnk.element.innerHTML = edit_input.element.value;
              // emit event.
              eventHub.publish(
                "delete_file_event",
                { file: file, path: path },
                true
              );
            },
            (err: any) => {
              let msg = JSON.parse(err.message);
              M.toast({ html: msg.ErrorMsg, displayLength: 2000 });
            }
          );
        }
      };
    } else {
      // Not editable.
      let ico: any;
      if (file.files != undefined) {
        ico = this.div
          .appendElement({
            tag: "i",
            class: "Small material-icons col s1",
            innerHtml: "folder"
          })
          .down();
      } else {
        ico = this.div
          .appendElement({
            tag: "i",
            class: "Small material-icons col s1",
            innerHtml: "insert_drive_file"
          })
          .down();
      }

      // The file name link...
      let lnk = this.div
        .appendElement({
          tag: "a",
          heref: "javascript:void(0)",
          innerHtml: file.name,
          class: "col s6"
        })
        .down();

      let lastModified = new Date(file.last_modified * 1000);
      this.div.appendElement({
        tag: "div",
        class: "col s3",
        innerHtml:
          lastModified.toLocaleDateString() +
          " " +
          lastModified.toLocaleTimeString()
      });

      let fileSizeDiv = this.div
        .appendElement({
          tag: "div",
          class: "col s2"
        })
        .down();

      if (file.files == undefined) {
        if (file.size > 1024) {
          if (file.size > 1024 * 1024) {
            if (file.size > 1024 * 1024 * 1024) {
              let fileSize = file.size / (1024 * 1024 * 1024);
              fileSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Gb";
            } else {
              let fileSize = file.size / (1024 * 1024);
              fileSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Mb";
            }
          } else {
            let fileSize = file.size / 1024;
            fileSizeDiv.element.innerHTML = fileSize.toFixed(0) + " Kb";
          }
        } else {
          fileSizeDiv.element.innerHTML = file.size + " bytes";
        }
      } else {
        // publish local event.
        ico.element.onclick = () => {
          eventHub.publish("set_dir_event", { dir: file }, true);
        };
      }

      ico.element.onmouseenter = lnk.element.onmouseenter = function() {
        this.style.cursor = "pointer";
      };

      ico.element.onmouseleave = lnk.element.onmouseleave = function() {
        this.style.cursor = "default";
      };
    }
  }
}

/**
 * Navigate from the file.
 */
class FileNavigator extends Panel {
  private editable: boolean;
  private currentDirectory: any;

  constructor(parent: any) {
    super(randomUUID());
    this.div.element.className = "card col s12 m8 offset-m2";
    parent.appendElement(this.div);
  }

  setHeader() {
    if (!this.editable) {
      // Set the header...
      this.div
        .appendElement({ tag: "div", class: "row" })
        .down()
        .appendElement({
          tag: "div",
          class: "col s7",
          id: "file_name_div",
          innerHtml: "Name",
          style: "border-right: 1px solid lightgray;"
        })
        .appendElement({
          tag: "div",
          class: "col s3",
          innerHtml: "Date modifed",
          style: "border-right: 1px solid lightgray;"
        })
        .appendElement({
          tag: "div",
          class: "col s2",
          innerHtml: "Size"
        });
    } else {
      this.div
        .appendElement({ tag: "div", class: "row" })
        .down()
        .appendElement({
          tag: "div",
          class: "col s6",
          id: "file_name_div",
          innerHtml: "Name",
          style: "border-right: 1px solid lightgray;"
        })
        .appendElement({
          tag: "div",
          class: "col s3",
          innerHtml: "Date modifed",
          style: "border-right: 1px solid lightgray;"
        })
        .appendElement({
          tag: "div",
          class: "col s2",
          innerHtml: "Size"
        })
        .appendElement({
          tag: "div",
          class: "col s1"
        });
    }
  }

  setDir(dir: any) {
    this.currentDirectory = dir;
    // Clear the div.
    this.div.removeAllChilds();
    this.setHeader();
    for (var i = 0; i < dir.files.length; i++) {
      let filePanel = new FilePanel(this.div);
      filePanel.setFile(dir.files[i], this.editable);
    }
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    console.log("Panel --> onlogin: ", this.id);
    this.editable = true;
    this.setDir(this.currentDirectory);
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.setDir(this.currentDirectory);
  }
}

class PermissionExplorer extends Panel {
  constructor(parent: any) {
    super(randomUUID());
    parent.appendElement(this.div);
  }
}
