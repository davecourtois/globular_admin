import * as GlobularWebClient from "globular-web-client";

import {
  GetConfigRequest,
  SaveConfigRequest,
  InstallServiceRequest,
  InstallServiceResponse,
  StopServiceRequest,
  StartServiceRequest,
  SaveConfigResponse,
  SetEmailRequest,
  SetPasswordRequest,
  UninstallServiceRequest,
  UninstallServiceResponse
} from "globular-web-client/admin/admin_pb";
import {
  QueryRangeRequest,
  QueryRequest
} from "globular-web-client/monitoring/monitoring_pb";
import { randomUUID, includeJavascript } from "./utility";
import {
  RegisterAccountRqst,
  AuthenticateRqst,
  Account,
  GetAllActionsRqst,
  GetAllActionsRsp,
  AddRoleActionRqst,
  AddRoleActionRsp,
  RemoveRoleActionRqst,
  CreateRoleRqst,
  Role,
  CreateRoleRsp,
  DeleteRoleRqst,
  RefreshTokenRqst,
  RefreshTokenRsp,
  GetAllFilesInfoRqst,
  GetAllFilesInfoRsp,
  GetAllApplicationsInfoRqst,
  GetAllApplicationsInfoRsp,
  AddApplicationActionRqst,
  AddApplicationActionRsp,
  RemoveApplicationActionRqst,
  DeleteApplicationRqst,
  DeleteAccountRqst,
  AddAccountRoleRqst,
  RemoveAccountRoleRqst,
  GetPermissionsRqst,
  GetPermissionsRsp,
  DeletePermissionsRqst,
  DeletePermissionsRsp,
  SetPermissionRqst,
  RessourcePermission,
  SetPermissionRsp,
  SynchronizeLdapRqst,
  LdapSyncInfos,
  SynchronizeLdapRsp,
  UserSyncInfos,
  GroupSyncInfos,
  GetRessourceOwnersRqst,
  GetRessourceOwnersRsp,
  SetRessourceOwnerRqst,
  DeleteRessourceOwnerRqst,
  GetLogRqst,
  LogInfo,
  ClearAllLogRqst,
  LogType,
  SetActionPermissionRqst,
  Ressource,
  RemoveActionPermissionRqst,
  GetRessourcesRqst,
  RemoveRessourceRqst,
  DeleteLogRqst
} from "globular-web-client/ressource/ressource_pb";
import * as jwt from "jwt-decode";
import {
  InsertOneRqst,
  FindOneRqst,
  FindRqst,
  FindResp,
  FindOneResp,
  AggregateRqst,
  PingConnectionRqst,
  PingConnectionRsp,
  ReplaceOneRqst,
  ReplaceOneRsp
} from "globular-web-client/persistence/persistence_pb";
import {
  FindServicesDescriptorRequest,
  FindServicesDescriptorResponse,
  ServiceDescriptor,
  GetServiceDescriptorRequest,
  GetServiceDescriptorResponse,
  GetServicesDescriptorRequest,
  GetServicesDescriptorResponse,
  SetServiceDescriptorRequest
} from "globular-web-client/services/services_pb";
import {
  RenameRequest,
  RenameResponse,
  DeleteFileRequest,
  DeleteDirRequest,
  CreateArchiveRequest,
  CreateArchiveResponse,
  CreateDirRequest,
  ReadDirRequest,
} from "globular-web-client/file/file_pb";
import { TagType, ReadTagRqst } from "globular-web-client/plc/plc_pb";

// Create a new connection with the backend.
export let globular: GlobularWebClient.Globular;
export let eventHub: GlobularWebClient.EventHub;

// The name of the application
let application = "admin";
let domain = window.location.hostname;
let config: any;

/**
 * Display the error message to the end user.
 * @param err The error message can be a simple string or a json stringnify object
 */
export function getErrorMessage(err: any): string {
  try {
    let errObj = JSON.parse(err);
    if (errObj.ErrorMsg != undefined) {
      console.log(errObj)
      return errObj.ErrorMsg
    }
  } catch{
    console.log(err)
    return err;
  }
}

export async function initServices(callback: () => void, errorCallback: (err: any) => void) {

  // Set the url to config.
  let url = window.location.protocol.replace(":", "") + "://"
  url +=  window.location.hostname + ":"
  url += window.location.port + "/"
  url += "config"

  // Create a new connection with the backend.
  globular = new GlobularWebClient.Globular(url, ()=>{
        // create the event hub and set globular.eventService to enable
        // network events.
        eventHub = new GlobularWebClient.EventHub(globular.eventService);

        callback();
  }, errorCallback);

}

// let config = globular.adminService.GetConfig()
export function readFullConfig(
  callback: (config: GlobularWebClient.IConfig) => void,
  errorCallback: (err: any) => void
) {
  let rqst = new GetConfigRequest();
  if (globular.adminService !== undefined) {
    globular.adminService
      .getFullConfig(rqst, {
        token: localStorage.getItem("user_token"),
        application: application, domain: domain + ":" + window.location.port
      })
      .then(rsp => {
        globular.config = JSON.parse(rsp.getResult());; // set the globular config with the full config.
        callback(globular.config);
      })
      .catch(err => {
        errorCallback(err);
      });
  }
}

export function pingSql(connectionId: string, callback: (pong: string) => {}, errorCallback: (err: any) => void) {
  let rqst = new PingConnectionRqst
  rqst.setId(connectionId)

  globular.sqlService.ping(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then((rsp: PingConnectionRsp) => {
    callback(rsp.getResult());
  })
    .catch((err: any) => {
      errorCallback(err);
    })
}

// Save the configuration.
export function saveConfig(
  config: GlobularWebClient.IConfig,
  callback: (config: GlobularWebClient.IConfig) => void
  , errorCallback: (err: any) => void
) {
  let rqst = new SaveConfigRequest();
  rqst.setConfig(JSON.stringify(config));
  if (globular.adminService !== undefined) {
    globular.adminService
      .saveConfig(rqst, {
        token: localStorage.getItem("user_token"),
        application: application, domain: domain + ":" + window.location.port
      })
      .then(rsp => {
        config = JSON.parse(rsp.getResult());
        callback(config);
      })
      .catch(err => {
        errorCallback(err);
      });
  }
}

/**
 * Synchronize LDAP and Globular/MongoDB user and roles.
 * @param info The synchronisations informations.
 * @param callback success callback.
 */
export function syncLdapInfos(info: any, timeout: number, callback: () => void, errorCallback: (err: any) => void) {
  let rqst = new SynchronizeLdapRqst
  let syncInfos = new LdapSyncInfos
  syncInfos.setConnectionid(info.connectionId)
  syncInfos.setLdapseriveid(info.ldapSeriveId)
  syncInfos.setRefresh(info.refresh)

  let userSyncInfos = new UserSyncInfos
  userSyncInfos.setBase(info.userSyncInfos.base)
  userSyncInfos.setQuery(info.userSyncInfos.query)
  userSyncInfos.setId(info.userSyncInfos.id)
  userSyncInfos.setEmail(info.userSyncInfos.email)
  syncInfos.setUsersyncinfos(userSyncInfos)

  let groupSyncInfos = new GroupSyncInfos
  groupSyncInfos.setBase(info.groupSyncInfos.base)
  groupSyncInfos.setQuery(info.groupSyncInfos.query)
  groupSyncInfos.setId(info.groupSyncInfos.id)
  syncInfos.setGroupsyncinfos(groupSyncInfos)

  rqst.setSyncinfo(syncInfos)

  // Try to synchronyze the ldap service.
  globular.ressourceService.synchronizeLdap(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then((rsp: SynchronizeLdapRsp) => {

  }).catch((err: any) => {
    errorCallback(err);
  })
}
///////////////////////////////////// Permissions /////////////////////////////////////

/**
 * Retreive the list of ressource owner.
 * @param path 
 * @param callback 
 * @param errorCallback 
 */
export function getRessourceOwners(
  path: string,
  callback: (infos: Array<any>) => void,
  errorCallback: (err: any) => void
) {
  let rqst = new GetRessourceOwnersRqst
  path = path.replace("/webroot", "");
  rqst.setPath(path);

  globular.ressourceService.getRessourceOwners(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then((rsp: GetRessourceOwnersRsp) => {
    callback(rsp.getOwnersList())
  }).catch((err: any) => {
    errorCallback(err);
  });

}

/**
 * The ressource owner to be set.
 * @param path The path of the ressource
 * @param owner The owner of the ressource
 * @param callback The success callback
 * @param errorCallback The error callback
 */
export function setRessourceOwners(
  path: string,
  owner: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {

  let rqst = new SetRessourceOwnerRqst
  path = path.replace("/webroot", ""); // remove the /webroot part.
  rqst.setPath(path);
  rqst.setOwner(owner);

  globular.ressourceService.setRessourceOwner(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then(() => {
    callback()
  }).catch((err: any) => {
    errorCallback(err);
  });

}

/**
 * Delete a given ressource owner
 * @param path The path of the ressource.
 * @param owner The owner to be remove
 * @param callback The sucess callback
 * @param errorCallback The error callback
 */
export function deleteRessourceOwners(
  path: string,
  owner: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {

  let rqst = new DeleteRessourceOwnerRqst
  path = path.replace("/webroot", ""); // remove the /webroot part.
  rqst.setPath(path);
  rqst.setOwner(owner);

  globular.ressourceService.deleteRessourceOwner(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then(() => {
    callback()
  }).catch((err: any) => {
    errorCallback(err);
  });

}

/**
 * Retreive the permission for a given file.
 * @param path 
 * @param callback 
 * @param errorCallback 
 */
export function getRessourcePermissions(
  path: string,
  callback: (infos: Array<any>) => void,
  errorCallback: (err: any) => void
) {
  let rqst = new GetPermissionsRqst
  path = path.replace("/webroot", ""); // remove the /webroot part.
  if (path.length == 0) {
    path = "/";
  }
  rqst.setPath(path);

  globular.ressourceService
    .getPermissions(rqst, {
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: GetPermissionsRsp) => {
      let permissions = JSON.parse(rsp.getPermissions())
      callback(permissions);

    })
    .catch((error:any)  => {
      if (errorCallback != undefined) {
        errorCallback(error);
      }
    });
}

/**
 * The permission can be assigned to 
 * a User, a Role or an Application.
 */
export enum OwnerType {
  User = 1,
  Role = 2,
  Application = 3
}

/**
 * Create a file permission.
 * @param path The path on the server from the root.
 * @param owner The owner of the permission
 * @param ownerType The owner type
 * @param number The (unix) permission number.
 * @param callback The success callback
 * @param errorCallback The error callback
 */
export function setRessourcePermission(
  path: string,
  owner: string,
  ownerType: OwnerType,
  number: number,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new SetPermissionRqst
  path = path.replace("/webroot", ""); // remove the /webroot part.

  if (path.length == 0) {
    path = "/";
  }

  let permission = new RessourcePermission
  permission.setPath(path)
  permission.setNumber(number)
  if (ownerType == OwnerType.User) {
    permission.setUser(owner)
  } else if (ownerType == OwnerType.Role) {
    permission.setRole(owner)
  } else if (ownerType == OwnerType.Application) {
    permission.setApplication(owner)
  }

  rqst.setPermission(permission)

  globular.ressourceService
    .setPermission(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: SetPermissionRsp) => {
      callback();
    })
    .catch((error:any)  => {
      if (errorCallback != undefined) {
        errorCallback(error);
      }
    });
}

/**
 * Delete a file permission for a give user.
 * @param path The path of the file on the server.
 * @param owner The owner of the file
 * @param callback The success callback.
 * @param errorCallback The error callback.
 */
export function deleteRessourcePermissions(
  path: string,
  owner: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {

  let rqst = new DeletePermissionsRqst
  path = path.replace("/webroot", ""); // remove the /webroot part.
  if (path.length == 0) {
    path = "/";
  }

  rqst.setPath(path);
  rqst.setOwner(owner);

  globular.ressourceService
    .deletePermissions(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: DeletePermissionsRsp) => {
      callback();
    })
    .catch((error:any)  => {
      if (errorCallback != undefined) {
        errorCallback(error);
      }
    });
}

///////////////////////////////////// File operations /////////////////////////////////
/**
 * Rename a file or a directorie with given name.
 * @param path The path inside webroot
 * @param newName The new file name
 * @param oldName  The old file name
 * @param callback  The success callback.
 * @param errorCallback The error callback.
 */
export function renameFile(
  path: string,
  newName: string,
  oldName: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new RenameRequest();
  path = path.replace("/webroot", ""); // remove the /webroot part.
  if (path.length == 0) {
    path = "/";
  }
  rqst.setPath(path);
  rqst.setOldName(oldName);
  rqst.setNewName(newName);

  globular.fileService
    .rename(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: RenameResponse) => {
      callback();
    })
    .catch((error:any) => {
      if (errorCallback != undefined) {
        errorCallback(error);
      }
    });
}

/**
 * Delete a file with a given path.
 * @param path The path of the file to be deleted.
 * @param callback The success callback.
 * @param errorCallback The error callback.
 */
export function deleteFile(
  path: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new DeleteFileRequest();
  path = path.replace("/webroot", ""); // remove the /webroot part.
  if (path.length == 0) {
    path = "/";
  }
  rqst.setPath(path);

  globular.fileService
    .deleteFile(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: RenameResponse) => {
      callback();
    })
    .catch((error:any)  => {
      if (errorCallback != undefined) {
        errorCallback(error);
      }
    });
}

/**
 * 
 * @param path The path of the directory to be deleted.
 * @param callback The success callback
 * @param errorCallback The error callback.
 */
export function deleteDir(
  path: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new DeleteDirRequest();
  path = path.replace("/webroot", ""); // remove the /webroot part.
  if (path.length == 0) {
    path = "/";
  }
  rqst.setPath(path);
  globular.fileService
    .deleteDir(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: RenameResponse) => {
      callback();
    })
    .catch((error:any)  => {
      if (errorCallback != undefined) {
        errorCallback(error);
      }
    });
}

/**
 * Create a dir archive.
 * @param path 
 * @param name 
 * @param callback 
 * @param errorCallback 
 */
export function createArchive(path: string, name: string, callback: (path: string) => void, errorCallback: (err: any) => void) {
  let rqst = new CreateArchiveRequest;
  path = path.replace("/webroot", ""); // remove the /webroot part.
  if (path.length == 0) {
    path = "/";
  }
  rqst.setPath(path)
  rqst.setName(name)

  globular.fileService.createAchive(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then(
    (rsp: CreateArchiveResponse) => {
      callback(rsp.getResult())
    }
  ).catch((error:any)  => {
    if (errorCallback != undefined) {
      errorCallback(error);
    }
  });
}

/**
 * 
 * @param urlToSend 
 */
export function downloadFileHttp(urlToSend: string, fileName: string, callback: () => void) {
  var req = new XMLHttpRequest();
  req.open("GET", urlToSend, true);

  // Set the token to manage downlaod access.
  req.setRequestHeader("token", localStorage.getItem("user_token"))
  req.setRequestHeader("application", "admin")
  req.setRequestHeader("domain", domain)

  req.responseType = "blob";
  req.onload = function (event) {
    var blob = req.response;
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    callback();
  };

  req.send();
}

/**
 * Download a directory as archive file. (.tar.gz)
 * @param path The path of the directory to dowload.
 * @param callback The success callback.
 * @param errorCallback The error callback.
 */
export function downloadDir(path: string, callback: () => void, errorCallback: (err: any) => void) {
  let name = path.split("/")[path.split("/").length - 1]
  path = path.replace("/webroot", ""); // remove the /webroot part.
  if (path.length == 0) {
    path = "/";
  }

  // Create an archive-> download it-> delete it...
  createArchive(path, name, (path: string) => {
    let name = path.split("/")[path.split("/").length - 1]
    // display the archive path...
    downloadFileHttp(window.location.origin + path, name, () => {
      // Here the file was downloaded I will now delete it.
      setTimeout(() => {
        // wait a little and remove the archive from the server.
        let rqst = new DeleteFileRequest
        rqst.setPath(path)
        globular.fileService.deleteFile(rqst, {
          token: localStorage.getItem("user_token"),
          application: application, domain: domain + ":" + window.location.port
        }).then(callback)
          .catch(errorCallback)
      }, 5000); // wait 5 second, arbritary...
    });

  }, errorCallback)
}

// Merge tow array together.
function mergeTypedArraysUnsafe(a: any, b: any) {
  var c = new a.constructor(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}

/**
 * Read the content of a dir from a given path.
 * @param path The parent path of the dir to be read.
 * @param callback  Return the path of the dir with more information.
 * @param errorCallback Return a error if the file those not contain the value.
 */
export function readDir(path: string, callback: (dir: any) => void, errorCallback: (err: any) => void) {
  path = path.replace("/webroot", ""); // remove the /webroot part.
  if (path.length == 0) {
    path = "/";
  }

  let rqst = new ReadDirRequest
  rqst.setPath(path)
  rqst.setRecursive(true)
  rqst.setThumnailheight(256)
  rqst.setThumnailwidth(256)

  var uint8array = new Uint8Array();

  var stream = globular.fileService.readDir(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  });

  stream.on("data", (rsp:any) => {
    uint8array = mergeTypedArraysUnsafe(uint8array, rsp.getData())
  });

  stream.on("status", function (status:any) {
    if (status.code == 0) {
      var jsonStr = new TextDecoder("utf-8").decode(uint8array);
      var content = JSON.parse(jsonStr)
      callback(content)
    } else {
      // error here...
      errorCallback({ "message": status.details })
    }
  });

}

/**
 * 
 * @param files 
 */
function fileExist(fileName: string, files: Array<any>): boolean {
  if (files != null) {
    for (var i = 0; i < files.length; i++) {
      if (files[i].Name == fileName) {
        return true;
      }
    }
  }
  return false
}

/**
 * Create a new directory inside existing one.
 * @param path The path of the directory
 * @param callback The callback
 * @param errorCallback The error callback
 */
export function createDir(path: string, callback: (dirName: string) => void, errorCallback: (err: any) => void) {
  path = path.replace("/webroot", ""); // remove the /webroot part.
  if (path.length == 0) {
    path = "/";
  }
  // first of all I will read the directory content...
  readDir(path, (dir: any) => {
    let newDirName = "New Folder"
    for (var i = 0; i < 1024; i++) {
      if (!fileExist(newDirName, dir.Files)) {
        break
      }
      newDirName = "New Folder (" + i + ")"
    }

    // Set the request.
    let rqst = new CreateDirRequest
    rqst.setPath(path)
    rqst.setName(newDirName)

    // Create a directory at the given path.
    globular.fileService.createDir(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    }).then(() => {
      // The new directory was created.
      callback(newDirName)
    })
      .catch(
        (err: any) => {
          errorCallback(err)
        }
      )

  }, errorCallback)
}

///////////////////////////////////// Monitoring //////////////////////////////////////
// Run a query.
export function query(
  connectionId: string,
  query: string,
  ts: number,
  callback: (value: any) => void,
  errorCallback: (error: any) => void
) {
  // Create a new request.
  var request = new QueryRequest();
  request.setConnectionid(connectionId);
  request.setQuery(query);
  request.setTs(ts);

  // Now I will test with promise
  globular.monitoringService
    .query(request, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((resp:any) => {
      if (callback != undefined) {
        callback(JSON.parse(resp.getValue()));
      }
    })
    .catch((error:any)  => {
      if (errorCallback != undefined) {
        errorCallback(error);
      }
    });
}

// Run Query with a given range.
export function queryRange(
  connectionId: string,
  query: string,
  startTime: number,
  endTime: number,
  step: number,
  callback: (values: any) => void,
  errorCallback: (err: any) => void
) {
  // Create a new request.
  var request = new QueryRangeRequest();
  request.setConnectionid(connectionId);
  request.setQuery(query);
  request.setStarttime(startTime);
  request.setEndtime(endTime);
  request.setStep(step);

  let buffer = { value: "", warning: "" };

  var stream = globular.monitoringService.queryRange(request, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  });
  stream.on("data", (rsp:any) => {
    buffer.value += rsp.getValue();
    buffer.warning = rsp.getWarnings();
  });

  stream.on("status", function (status:any) {
    if (status.code == 0) {
      callback(JSON.parse(buffer.value));
    } else {
      errorCallback({ "message": status.details })
    }
  });

  stream.on("end", () => {
    // stream end signal
  });
}

///////////////////////////////////// Account //////////////////////////////////////

/**
 * Register a new user.
 * @param userName The name of the account
 * @param email The email
 * @param password The password
 * @param confirmPassword
 * @param callback
 * @param errorCallback
 */
export function registerAccount(
  userName: string,
  email: string,
  password: string,
  confirmPassword: string,
  callback: (value: any) => void,
  errorCallback: (err: any) => void
) {
  var request = new RegisterAccountRqst();
  var account = new Account();
  account.setName(userName);
  account.setEmail(email);
  request.setAccount(account);
  request.setPassword(password);
  request.setConfirmPassword(confirmPassword);

  // Create the user account.
  globular.ressourceService
    .registerAccount(request, { application: application, domain: domain + ":" + window.location.port })
    .then(rsp => {
      callback(rsp.getResult());
    })
    .catch(err => {
      errorCallback(err);
    });
}

/**
 * Remove an account from the server.
 * @param name  The _id of the account.
 * @param callback The callback when the action succed
 * @param errorCallback The error callback.
 */
export function DeleteAccount(
  id: string,
  callback: (value: any) => void,
  errorCallback: (err: any) => void) {
  let rqst = new DeleteAccountRqst
  rqst.setId(id)

  // Remove the account from the database.
  globular.ressourceService
    .deleteAccount(rqst, { token: localStorage.getItem("user_token"), application: application, domain: domain + ":" + window.location.port })
    .then(rsp => {
      callback(rsp.getResult());
    })
    .catch(err => {
      errorCallback(err);
    });
}

/**
 * Remove a role from an account.
 * @param accountId The account id
 * @param roleId The role name (id)
 * @param callback The success callback
 * @param errorCallback The error callback
 */
export function RemoveRoleFromAccount(
  accountId: string,
  roleId: string,
  callback: (value: any) => void,
  errorCallback: (err: any) => void
) {

  let rqst = new RemoveAccountRoleRqst
  rqst.setAccountid(accountId)
  rqst.setRoleid(roleId)

  globular.ressourceService
    .removeAccountRole(rqst, { token: localStorage.getItem("user_token"), application: application, domain: domain + ":" + window.location.port })
    .then(rsp => {
      callback(rsp.getResult());
    })
    .catch(err => {
      errorCallback(err);
    });

}

/**
 * Append a role to an account.
 * @param accountId The account id
 * @param roleId The role name (id)
 * @param callback The success callback
 * @param errorCallback The error callback.
 */
export function AppendRoleToAccount(
  accountId: string,
  roleId: string,
  callback: (value: any) => void,
  errorCallback: (err: any) => void
) {

  let rqst = new AddAccountRoleRqst
  rqst.setAccountid(accountId)
  rqst.setRoleid(roleId)

  globular.ressourceService
    .addAccountRole(rqst, { token: localStorage.getItem("user_token"), application: application, domain: domain + ":" + window.location.port })
    .then(rsp => {
      callback(rsp.getResult());
    })
    .catch(err => {
      errorCallback(err);
    });

}

/**
 * Update the account email
 * @param accountId The account id
 * @param old_email the old email
 * @param new_email the new email
 * @param callback  the callback when success
 * @param errorCallback the error callback in case of error
 */
export function updateAccountEmail(accountId: string, old_email: string, new_email: string, callback: () => void, errorCallback: (err: any) => void) {
  let rqst = new SetEmailRequest
  rqst.setAccountid(accountId)
  rqst.setOldemail(old_email)
  rqst.setNewemail(new_email)

  globular.adminService.setEmail(rqst,
    {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    }).then(rsp => {
      callback()
    })
    .catch(err => {
      console.log("fail to save config ", err);
    });
}

/**
 * The update account password
 * @param accountId The account id
 * @param old_password The old password
 * @param new_password The new password
 * @param confirm_password The new password confirmation
 * @param callback The success callback
 * @param errorCallback The error callback.
 */
export function updateAccountPassword(accountId: string, old_password: string, new_password: string, confirm_password: string, callback: () => void, errorCallback: (err: any) => void) {
  let rqst = new SetPasswordRequest
  rqst.setAccountid(accountId)
  rqst.setOldpassword(old_password)
  rqst.setNewpassword(new_password)

  if (confirm_password != new_password) {
    errorCallback("password not match!")
    return
  }

  globular.adminService.setPassword(rqst,
    {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    }).then(rsp => {
      callback()
    })
    .catch((error:any)  => {
      if (errorCallback != undefined) {
        errorCallback(error);
      }
    });
}

/**
 * Authenticate the user and get the token
 * @param userName The account name or email
 * @param password  The user password
 * @param callback
 * @param errorCallback
 */
export function authenticate(
  userName: string,
  password: string,
  callback: (value: any) => void,
  errorCallback: (err: any) => void
) {
  var rqst = new AuthenticateRqst();
  rqst.setName(userName);
  rqst.setPassword(password);

  // Create the user account.
  globular.ressourceService
    .authenticate(rqst, { application: application, domain: domain + ":" + window.location.port })
    .then(rsp => {
      // Here I will set the token in the localstorage.
      let token = rsp.getToken();
      let decoded = jwt(token);

      // here I will save the user token and user_name in the local storage.
      localStorage.setItem("user_token", token);
      localStorage.setItem("user_name", (<any>decoded).username);

      readFullConfig((config: any) => {
        // Publish local login event.
        eventHub.publish("onlogin", config, true); // return the full config...
        callback(decoded);
      }, (err: any) => {
        errorCallback(err)
      })
    })
    .catch(err => {
      console.log(err)
      errorCallback(err);
    });
}

/**
 * Function to be use to refresh token or full configuration.
 * @param callback On success callback
 * @param errorCallback On error callback
 */
export function refreshToken(callback: (token: any) => void, errorCallback: (err: any) => void) {
  let rqst = new RefreshTokenRqst();
  rqst.setToken(localStorage.getItem("user_token"));

  globular.ressourceService
    .refreshToken(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: RefreshTokenRsp) => {
      // Here I will set the token in the localstorage.
      let token = rsp.getToken();
      let decoded = jwt(token);

      // here I will save the user token and user_name in the local storage.
      localStorage.setItem("user_token", token);
      localStorage.setItem("user_name", (<any>decoded).username);

      readFullConfig((config: any) => {

        // Publish local login event.
        eventHub.publish("onlogin", config, true); // return the full config...

        callback(decoded);
      }, (err: any) => {
        errorCallback(err)
      })

    })
    .catch((err: any) => {
      onerror(err);
    });
}

/**
 * Save user data into the user_data collection.
 */
export function appendUserData(data: any, callback: (id: string) => void) {
  let userName = localStorage.getItem("user_name");
  let database = userName + "_db";
  let collection = "user_data";

  let rqst = new InsertOneRqst();
  rqst.setId(database);
  rqst.setDatabase(database);
  rqst.setCollection(collection);
  rqst.setJsonstr(JSON.stringify(data));
  rqst.setOptions("");

  // call persist data
  globular.persistenceService
    .insertOne(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: any) => {
      callback(rsp.getId());
    })
    .catch((err: any) => {
      console.log(err);
    });
}

/**
 * Read user data one result at time.
 */
export function readOneUserData(
  query: string,
  callback: (results: any) => void
) {
  let userName = localStorage.getItem("user_name");
  let database = userName + "_db";
  let collection = "user_data";

  let rqst = new FindOneRqst();
  rqst.setId(database);
  rqst.setDatabase(database);
  rqst.setCollection(collection);
  rqst.setQuery(query);
  rqst.setOptions("");

  // call persist data
  globular.persistenceService
    .findOne(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: any) => {
      callback(JSON.parse(rsp.getJsonstr()));
    })
    .catch((err: any) => {
      console.log(err);
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////
// Roles
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Return the list of all account on the server, guest and admin are new account...
 * @param callback 
 */
export function GetAllAccountsInfo(callback: (
  accounts: Array<any>) => void,
  errorCallback: (err: any) => void
) {
  let rqst = new FindRqst();
  rqst.setCollection("Accounts");
  rqst.setDatabase("local_ressource");
  rqst.setId("local_ressource");
  rqst.setQuery("{}"); // means all values.

  var stream = globular.persistenceService.find(rqst, {
    application: application, domain: domain + ":" + window.location.port
  });

  let accounts = new Array<any>()

  stream.on("data", (rsp: FindResp) => {
    accounts = accounts.concat(JSON.parse(rsp.getJsonstr()))
  });

  stream.on("status", function (status:any) {
    if (status.code == 0) {
      callback(accounts);
    } else {
      errorCallback({ "message": status.details })
    }
  });
}

/**
 * Retreive all available actions on the server.
 * @param callback That function is call in case of success.
 * @param errorCallback That function is call in case error.
 */
export function getAllActions(
  callback: (ations: Array<string>) => void,
  errorCallback: (err: any) => void
) {
  let rqst = new GetAllActionsRqst();
  globular.ressourceService
    .getAllActions(rqst, { application: application, domain: domain + ":" + window.location.port })
    .then((rsp: GetAllActionsRsp) => {
      callback(rsp.getActionsList());
    })
    .catch((err: any) => {
      errorCallback(err);
    });
}

/**
 * Retreive the list of all available roles on the server.
 * @param callback That function is call in case of success.
 * @param errorCallback That function is call in case error.
 */
export function getAllRoles(
  callback: (roles: Array<any>) => void,
  errorCallback: (err: any) => void
) {
  let rqst = new FindRqst();
  rqst.setCollection("Roles");
  rqst.setDatabase("local_ressource");
  rqst.setId("local_ressource");
  rqst.setQuery("{}"); // means all values.

  var stream = globular.persistenceService.find(rqst, {
    application: application, domain: domain + ":" + window.location.port
  });

  var roles = new Array<any>();

  stream.on("data", (rsp: FindResp) => {
    roles = roles.concat(JSON.parse(rsp.getJsonstr()));
  });

  stream.on("status", function (status:any) {
    if (status.code == 0) {
      callback(roles);
    } else {
      errorCallback({ "message": status.details })
    }
  });
}

/**
 * Append Action to a given role.
 * @param action The action name.
 * @param role The role.
 * @param callback The success callback
 * @param errorCallback The error callback.
 */
export function AppendActionToRole(
  role: string,
  action: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new AddRoleActionRqst();
  rqst.setRoleid(role);
  rqst.setAction(action);

  globular.ressourceService
    .addRoleAction(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: AddRoleActionRsp) => {
      callback();
    })
    .catch((err: any) => {
      errorCallback(err);
    });
}

/**
 * Remove the action from a given role.
 * @param action The action id
 * @param role The role id
 * @param callback success callback
 * @param errorCallback error callback
 */
export function RemoveActionFromRole(
  role: string,
  action: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new RemoveRoleActionRqst();
  rqst.setRoleid(role);
  rqst.setAction(action);

  globular.ressourceService
    .removeRoleAction(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: AddRoleActionRsp) => {
      callback();
    })
    .catch((err: any) => {
      errorCallback(err);
    });
}

export function CreateRole(
  id: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new CreateRoleRqst();
  let role = new Role();
  role.setId(id);
  role.setName(id);
  rqst.setRole(role);

  globular.ressourceService
    .createRole(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: CreateRoleRsp) => {
      callback();
    })
    .catch((err: any) => {
      errorCallback(err);
    });
}

export function DeleteRole(
  id: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new DeleteRoleRqst();
  rqst.setRoleid(id);

  globular.ressourceService
    .deleteRole(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: CreateRoleRsp) => {
      callback();
    })
    .catch((err: any) => {
      errorCallback(err);
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////
// Files and directories management.
///////////////////////////////////////////////////////////////////////////////////////////////
export function GetAllFilesInfo(
  callbak: (filesInfo: any) => void,
  errorCallback: (err: any) => void
) {
  let rqst = new GetAllFilesInfoRqst();
  globular.ressourceService
    .getAllFilesInfo(rqst, { application: application, domain: domain + ":" + window.location.port })
    .then((rsp: GetAllFilesInfoRsp) => {
      let filesInfo = JSON.parse(rsp.getResult());
      callbak(filesInfo);
    })
    .catch((err: any) => {
      errorCallback(err);
    });
}

export function GetAllApplicationsInfo(
  callback: (infos: any) => void,
  errorCallback: (err: any) => void
) {
  let rqst = new GetAllApplicationsInfoRqst();
  globular.ressourceService
    .getAllApplicationsInfo(rqst)
    .then((rsp: GetAllApplicationsInfoRsp) => {
      let infos = JSON.parse(rsp.getResult());
      callback(infos);
    })
    .catch((err: any) => {
      errorCallback(err);
    });
}

export function AppendActionToApplication(
  applicationId: string,
  action: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new AddApplicationActionRqst;
  rqst.setApplicationid(applicationId)
  rqst.setAction(action)
  globular.ressourceService.addApplicationAction(rqst, { token: localStorage.getItem("user_token"), application: application, domain: domain + ":" + window.location.port })
    .then((rsp: AddApplicationActionRsp) => {
      callback()
    })
    .catch((err: any) => {
      console.log(err)
      errorCallback(err);
    });

}

export function RemoveActionFromApplication(
  applicationId: string,
  action: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new RemoveApplicationActionRqst;
  rqst.setApplicationid(applicationId)
  rqst.setAction(action)
  globular.ressourceService.removeApplicationAction(rqst, { token: localStorage.getItem("user_token"), application: application, domain: domain + ":" + window.location.port })
    .then((rsp: AddApplicationActionRsp) => {
      callback()
    })
    .catch((err: any) => {
      console.log(err)
      errorCallback(err);
    });

}

export function DeleteApplication(
  applicationId: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new DeleteApplicationRqst;
  rqst.setApplicationid(applicationId)
  globular.ressourceService.deleteApplication(rqst, { token: localStorage.getItem("user_token"), application: application, domain: domain + ":" + window.location.port })
    .then((rsp: AddApplicationActionRsp) => {
      callback()
    })
    .catch((err: any) => {
      console.log(err)
      errorCallback(err);
    });

}

export function SaveApplication(
  application: any,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new ReplaceOneRqst;
  rqst.setCollection("Applications");
  rqst.setDatabase("local_ressource");
  rqst.setId("local_ressource");
  rqst.setValue(JSON.stringify(application))
  rqst.setQuery(`{"_id":"${application._id}"}`); // means all values.

  globular.persistenceService.replaceOne(rqst, { token: localStorage.getItem("user_token"), application: application, domain: domain + ":" + window.location.port })
    .then((rsp: ReplaceOneRsp) => {
      eventHub.publish("update_application_info_event", JSON.stringify(application), false);
      callback()
    })
    .catch((err: any) => {
      console.log(err)
      errorCallback(err);
    });

}


///////////////////////////////////////////////////////////////////////////////////////////////
// Services
///////////////////////////////////////////////////////////////////////////////////////////////

export function GetServiceDescriptor(serviceId: string, publisherId: string, callback: (descriptors: Array<ServiceDescriptor>) => void, errorCallback: (err: any) => void) {
  let rqst = new GetServiceDescriptorRequest
  rqst.setServiceid(serviceId);
  rqst.setPublisherid(publisherId);

  globular.servicesDicovery.getServiceDescriptor(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  })
    .then((rsp: GetServiceDescriptorResponse) => {
      callback(rsp.getResultsList())
    }).catch(
      (err: any) => {
        errorCallback(err);
      }
    );
}

export function GetServicesDescriptor(callback: (descriptors: Array<ServiceDescriptor>) => void, errorCallback: (err: any) => void) {
  let rqst = new GetServicesDescriptorRequest

  var stream = globular.servicesDicovery.getServicesDescriptor(rqst, {
    application: application, domain: domain + ":" + window.location.port
  });

  let descriptors = new Array<ServiceDescriptor>()

  stream.on("data", (rsp: GetServicesDescriptorResponse) => {
    descriptors = descriptors.concat(rsp.getResultsList())
  });

  stream.on("status", function (status) {
    if (status.code == 0) {
      callback(descriptors);
    } else {
      errorCallback({ "message": status.details })
    }
  });
}

export function SetServicesDescriptor(descriptor: ServiceDescriptor, callback: () => void, errorCallback: (err: any) => void) {
  let rqst = new SetServiceDescriptorRequest
  rqst.setDescriptor(descriptor);

  globular.servicesDicovery.setServiceDescriptor(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then(callback)
    .catch(
      (err: any) => {
        errorCallback(err);
      }
    );
}

/**
 * Find services by keywords.
 * @param query
 * @param callback
 */
export function findServices(
  keywords: Array<string>,
  callback: (results: Array<ServiceDescriptor>) => void,
  errorCallback: (err: any) => void
) {
  let rqst = new FindServicesDescriptorRequest();
  rqst.setKeywordsList(keywords);

  // Find services by keywords.
  globular.servicesDicovery
    .findServices(rqst, { application: application, domain: domain + ":" + window.location.port })
    .then((rsp: FindServicesDescriptorResponse) => {
      let results = rsp.getResultsList()
      callback(results);
    })
    .catch(
      (err: any) => {
        errorCallback(err);
      }
    );
}

export function installService(
  discoveryId: string,
  serviceId: string,
  publisherId: string,
  version: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new InstallServiceRequest();
  rqst.setPublisherid(publisherId);
  rqst.setDicorveryid(discoveryId);
  rqst.setServiceid(serviceId);
  rqst.setVersion(version);

  // Install the service.
  globular.adminService
    .installService(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: InstallServiceResponse) => {
      readFullConfig(callback, errorCallback)
    }).catch(
      (err: any) => {
        errorCallback(err);
      }
    );
}

/**
 * Stop a service.
 */
export function stopService(serviceId: string, callback: () => void, errorCallback: (err: any) => void) {
  let rqst = new StopServiceRequest();
  rqst.setServiceId(serviceId);
  globular.adminService
    .stopService(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then(() => {
      callback();
    })
    .catch((err: any) => {
      errorCallback(err);
    });
}

/**
 * Start a service
 * @param serviceId The id of the service to start.
 * @param callback  The callback on success.
 */
export function startService(serviceId: string, callback: () => void, errorCallback: (err: any) => void) {
  let rqst = new StartServiceRequest();
  rqst.setServiceId(serviceId);
  globular.adminService
    .startService(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then(() => {
      callback();
    })
    .catch((err: any) => {
      errorCallback(err)
    });
}

/**
 * Here I will save the service configuration.
 * @param service The configuration to save.
 */
export function saveService(
  service: GlobularWebClient.IServiceConfig,
  callback: (config: any) => void,
  errorCallback: (err: any) => void
) {
  let rqst = new SaveConfigRequest();

  rqst.setConfig(JSON.stringify(service));
  globular.adminService
    .saveConfig(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: SaveConfigResponse) => {
      // The service with updated values...
      let service = JSON.parse(rsp.getResult());
      callback(service);
    })
    .catch((err: any) => {
      errorCallback(err)
    });
}

export function uninstallService(
  service: GlobularWebClient.IServiceConfig,
  deletePermissions: boolean,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new UninstallServiceRequest
  rqst.setServiceid(service.Id)
  rqst.setPublisherid(service.PublisherId)
  rqst.setVersion(service.Version)
  rqst.setDeletepermissions(deletePermissions)

  globular.adminService
    .uninstallService(rqst, {
      token: localStorage.getItem("user_token"),
      application: application, domain: domain + ":" + window.location.port
    })
    .then((rsp: UninstallServiceResponse) => {
      delete globular.config.Services[service.Id]
      // The service with updated values...
      callback();
    })
    .catch((err: any) => {
      errorCallback(err)
    });
}

/**
 * Return the list of service bundles.
 * @param callback 
 */
export function GetServiceBundles(publisherId: string, serviceId: string, version: string, callback: (
  bundles: Array<any>) => void,
  errorCallback: (err: any) => void
) {
  let rqst = new FindRqst();
  rqst.setCollection("ServiceBundle");
  rqst.setDatabase("local_ressource");
  rqst.setId("local_ressource");
  rqst.setQuery(`{}`); // means all values.

  var stream = globular.persistenceService.find(rqst, {
    application: application, domain: domain + ":" + window.location.port
  });

  let bundles = new Array<any>()

  stream.on("data", (rsp: FindResp) => {
    bundles = bundles.concat(JSON.parse(rsp.getJsonstr()))
  });

  stream.on("status", function (status:any) {
    if (status.code == 0) {
      // filter localy.
      callback(bundles.filter(bundle => String(bundle._id).startsWith(publisherId + '%' + serviceId + '%' + version)));
    } else {
      errorCallback({ "message": status.details })
    }
  });
}

// Get the object pointed by a reference.
export function getReferencedValue(ref: any, callback: (results: any) => void, errorCallback: (err: any) => void) {

  let database = ref.$db;
  let collection = ref.$ref;

  let rqst = new FindOneRqst();
  rqst.setId(database);
  rqst.setDatabase(database);
  rqst.setCollection(collection);
  rqst.setQuery(`{"_id":"${ref.$id}"}`);
  rqst.setOptions("");

  globular.persistenceService.findOne(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then((rsp: FindOneResp) => {
    callback(JSON.parse(rsp.getJsonstr()))
  }).catch((err: any) => {
    errorCallback(err)
  });
}

/**
 * Read all user data.
 */
export function readUserData(query: string, callback: (results: any) => void, errorCallback: (err: any) => void) {
  let userName = localStorage.getItem("user_name");
  let database = userName + "_db";
  let collection = "user_data";

  let rqst = new FindOneRqst();
  rqst.setId(database);
  rqst.setDatabase(database);
  rqst.setCollection(collection);
  rqst.setQuery(query);
  rqst.setOptions("");

  // call persist data
  let stream = globular.persistenceService.find(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  });
  let results = new Array();

  // Get the stream and set event on it...
  stream.on("data", (rsp:any) => {
    results = results.concat(JSON.parse(rsp.getJsonstr()));
  });

  stream.on("status", (status:any) => {
    if (status.code == 0) {
      callback(results);
    } else {
      errorCallback({ "message": status.details })
    }
  });
}


/**
 * Read all errors data.
 * @param callback 
 */
export function readErrors(callback: (results: any) => void, errorCallback: (err: any) => void) {
  let database = "local_ressource";
  let collection = "Logs";

  let rqst = new FindOneRqst();
  rqst.setId(database);
  rqst.setDatabase(database);
  rqst.setCollection(collection);
  rqst.setOptions("");
  rqst.setQuery("{}");

  // call persist data
  let stream = globular.persistenceService.find(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  });
  let results = new Array();

  // Get the stream and set event on it...
  stream.on("data", (rsp:any) => {
    results = results.concat(JSON.parse(rsp.getJsonstr()));
  });

  stream.on("status", (status:any) => {
    if (status.code == 0) {
      callback(results);
    } else {
      errorCallback({ "message": status.details })
    }
  });
}

export function readAllActionPermission(callback: (results: any) => void, errorCallback: (err: any) => void) {
  let database = "local_ressource";
  let collection = "ActionPermission";

  let rqst = new FindRqst();
  rqst.setId(database);
  rqst.setDatabase(database);
  rqst.setCollection(collection);
  rqst.setOptions("");
  rqst.setQuery("{}");

  // call persist data
  let stream = globular.persistenceService.find(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  });
  let results = new Array();

  // Get the stream and set event on it...
  stream.on("data", (rsp:any) => {
    results = results.concat(JSON.parse(rsp.getJsonstr()));
  });

  stream.on("status", (status:any) => {
    if (status.code == 0) {
      callback(results);
    } else {
      errorCallback({ "message": status.details })
    }
  });
}

export function getRessources(path: string, name: string, callback: (results: Ressource[]) => void, errorCallback: (err: any) => void) {

  let rqst = new GetRessourcesRqst
  rqst.setPath(path)
  rqst.setName(name)

  // call persist data
  let stream = globular.ressourceService.getRessources(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  });

  let results = new Array<Ressource>();

  // Get the stream and set event on it...
  stream.on("data", rsp => {
    results = results.concat(rsp.getRessourcesList())
  });

  stream.on("status", status => {
    if (status.code == 0) {
      callback(results);
    } else {
      errorCallback({ "message": status.details })
    }
  });
}

export function setActionPermission(action: string, permission: number, callback: (results: any) => void, errorCallback: (err: any) => void) {
  /*let rqst = new SetActionPermissionRqst
  rqst.setAction(action)
  rqst.setPermission(permission)

  // Call set action permission.
  globular.ressourceService.setActionPermission(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then(callback)
    .catch((err: any) => {
      errorCallback(err)
    })*/
    errorCallback("Not implemented!")
}

export function removeActionPermission(action: string, callback: (results: any) => void, errorCallback: (err: any) => void) {
  let rqst = new RemoveActionPermissionRqst
  rqst.setAction(action)
  // Call set action permission.
  globular.ressourceService.removeActionPermission(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then(callback)
    .catch((err: any) => {
      errorCallback(err)
    })
}

export function removeRessource(path: string, name: string, callback: () => void, errorCallback: (err: any) => void) {
  let rqst = new RemoveRessourceRqst
  let ressource = new Ressource
  ressource.setPath(path)
  ressource.setName(name)
  rqst.setRessource(ressource)
  globular.ressourceService.removeRessource(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then(callback)
    .catch((err: any) => {
      errorCallback(err)
    })

}

///////////////////////////// Logging ////////////////////////////////////////

/**
 * Read all logs
 * @param callback The success callback.
 */
export function readLogs(query: string, callback: (results: any) => void, errorCallback: (err: any) => void) {

  let rqst = new GetLogRqst();
  rqst.setQuery(query);

  // call persist data
  let stream = globular.ressourceService.getLog(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  });

  let results = new Array<LogInfo>();

  // Get the stream and set event on it...
  stream.on("data", rsp => {
    results = results.concat(rsp.getInfoList());
  });

  stream.on("status", status => {
    if (status.code == 0) {
      results = results.sort((t1, t2) => {
        const name1 = t1.getDate();
        const name2 = t2.getDate();
        if (name1 < name2) { return 1; }
        if (name1 > name2) { return -1; }
        return 0;
      });

      callback(results);
    } else {
      console.log(status.details)
      errorCallback({ "message": status.details })
    }
  });
}

export function clearAllLog(logType: LogType, callback: () => void, errorCallback: (err: any) => void) {
  let rqst = new ClearAllLogRqst
  rqst.setType(logType)
  globular.ressourceService.clearAllLog(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then(callback)
    .catch((err: any) => {
      errorCallback(err)
    })
}

export function deleteLog(log: LogInfo, callback: () => void, errorCallback: (err: any) => void) {
  let rqst = new DeleteLogRqst
  rqst.setLog(log)
  globular.ressourceService.deleteLog(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  }).then(callback)
    .catch((err: any) => {
      errorCallback(err)
    })
}

/**
 * Return the logged method and their count.
 * @param pipeline
 * @param callback 
 * @param errorCallback 
 */
export function getNumbeOfLogsByMethod(callback: (resuts: Array<any>) => void, errorCallback: (err: any) => void) {

  let database = "local_ressource";
  let collection = "Logs";
  let rqst = new AggregateRqst
  rqst.setId(database);
  rqst.setDatabase(database);
  rqst.setCollection(collection);
  rqst.setOptions("");

  let pipeline = `[{"$group":{"_id":{"method":"$method"}, "count":{"$sum":1}}}]`;

  rqst.setPipeline(pipeline);

  // call persist data
  let stream = globular.persistenceService.aggregate(rqst, {
    token: localStorage.getItem("user_token"),
    application: application, domain: domain + ":" + window.location.port
  });
  let results = new Array();

  // Get the stream and set event on it...
  stream.on("data", (rsp:any) => {
    results = results.concat(JSON.parse(rsp.getJsonstr()));
  });

  stream.on("status", (status:any) => {
    if (status.code == 0) {
      callback(results);
    } else {
      errorCallback({ "message": status.details })
    }
  });

}

//////////////////////////// PLC functions ///////////////////////////////////
export enum PLC_TYPE {
  ALEN_BRADLEY = 1,
  SIEMENS = 2,
  MODBUS = 3
}

/**
* Read a plc tag from the defined backend.
* @param plcType  The plc type can be Alen Bradley or Simens, modbus is on the planned.
* @param connectionId  The connection id defined for that plc.
* @param name The name of the tag to read.
* @param type The type name of the plc.
* @param offset The offset in the memory.
*/
export async function readPlcTag(plcType: PLC_TYPE, connectionId: string, name: string, type: TagType, offset: number) {
  let rqst = new ReadTagRqst();
  rqst.setName(name)
  rqst.setType(type)
  rqst.setOffset(offset)
  rqst.setConnectionId(connectionId)

  let value: any
  let result: string

  // Try to get the value from the server.
  try {
    if (plcType == PLC_TYPE.ALEN_BRADLEY) {
      if (globular.plcService_ab != undefined) {
        let rsp = await globular.plcService_ab.readTag(rqst);
        result = rsp.getValues()
      } else {
        return "No Alen Bradlay PLC server configured!"
      }
    } else if (plcType == PLC_TYPE.SIEMENS) {
      if (globular.plcService_siemens != undefined) {
        let rsp = await globular.plcService_siemens.readTag(rqst);
        result = rsp.getValues()
      } else {
        return "No Siemens PLC server configured!"
      }
    } else {
      return "No PLC server configured!"
    }
  } catch (err) {
    return err
  }

  // Here I got the value in a string I will convert it into it type.
  if (type == TagType.BOOL) {
    return result == "true" ? true : false
  } else if (type == TagType.REAL) {
    return parseFloat(result)
  } else { // Must be cinsidere a integer.
    return parseInt(result)
  }
}

