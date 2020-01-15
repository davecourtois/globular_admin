import * as GlobularWebClient from "globular-web-client";
import {
  GetConfigRequest,
  SaveConfigRequest,
  InstallServiceRequest,
  InstallServiceResponse,
  StopServiceRequest,
  StartServiceRequest,
  SaveConfigResponse
} from "globular-web-client/lib/admin/admin_pb";
import {
  QueryRangeRequest,
  QueryRequest
} from "globular-web-client/lib/monitoring/monitoringpb/monitoring_pb";
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
  GetAllFilesInfoRsp
} from "globular-web-client/lib/ressource/ressource_pb";
import * as jwt from "jwt-decode";
import {
  InsertOneRqst,
  FindOneRqst,
  FindRqst,
  FindResp
} from "globular-web-client/lib/persistence/persistencepb/persistence_pb";
import {
  FindServicesDescriptorRequest,
  FindServicesDescriptorResponse,
  ServiceDescriptor
} from "globular-web-client/lib/services/services_pb";
import {
  RenameRequest,
  RenameResponse,
  DeleteFileRequest,
  DeleteDirRequest,
  CreateArchiveRequest,
  CreateArchiveResponse,
  CreateDirRequest,
  ReadDirRequest,

} from "globular-web-client/lib/file/filepb/file_pb";

// Create a new connection with the backend.
export let globular: GlobularWebClient.Globular;
export let eventHub: GlobularWebClient.EventHub;

// The name of the application
let application = "admin";

let config: any;
export async function initServices(callback: () => void) {
  config = {
    Protocol: window.location.protocol.replace(":", ""),
    Domain: window.location.hostname,
    PortHttps: window.location.port,
    AdminPort: 10001,
    AdminProxy: 10002,
    Services: {} // empty for start.
  };

  // Create a new connection with the backend.
  globular = new GlobularWebClient.Globular(config);
  console.log("init globular services.");
  let rqst = new GetConfigRequest();
  if (globular.adminService !== undefined) {
    globular.adminService
      .getConfig(rqst)
      .then(rsp => {
        let config = JSON.parse(rsp.getResult());
        // init the services from the configuration retreived.
        globular = new GlobularWebClient.Globular(config);
        // create the event hub and set globular.eventService to enable
        // network events.
        eventHub = new GlobularWebClient.EventHub(globular.eventService);
        callback();
      })
      .catch(err => {
        console.log("fail to get config ", err);
      });
  }
}

// let config = globular.adminService.GetConfig()
export function readFullConfig(
  callback: (config: GlobularWebClient.IConfig) => void
) {
  let rqst = new GetConfigRequest();
  if (globular.adminService !== undefined) {
    globular.adminService
      .getFullConfig(rqst, {
        token: localStorage.getItem("user_token"),
        application: application
      })
      .then(rsp => {
        config = JSON.parse(rsp.getResult());
        callback(config);
      })
      .catch(err => {
        console.log("fail to get config ", err);
      });
  }
}

// Save the configuration.
export function saveConfig(
  config: GlobularWebClient.IConfig,
  callback: (config: GlobularWebClient.IConfig) => void
) {
  let rqst = new SaveConfigRequest();
  rqst.setConfig(JSON.stringify(config));
  if (globular.adminService !== undefined) {
    globular.adminService
      .saveConfig(rqst, {
        token: localStorage.getItem("user_token"),
        application: application
      })
      .then(rsp => {
        config = JSON.parse(rsp.getResult());
        callback(config);
      })
      .catch(err => {
        console.log("fail to save config ", err);
      });
  }
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
      application: application
    })
    .then((rsp: RenameResponse) => {
      callback();
    })
    .catch(error => {
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
      application: application
    })
    .then((rsp: RenameResponse) => {
      callback();
    })
    .catch(error => {
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
      application: application
    })
    .then((rsp: RenameResponse) => {
      callback();
    })
    .catch(error => {
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
    application: application
  }).then(
    (rsp: CreateArchiveResponse) => {
      callback(rsp.getResult())
    }
  ).catch(error => {
    if (errorCallback != undefined) {
      errorCallback(error);
    }
  });
}

/**
 * 
 * @param urlToSend 
 */
function downloadFileHttp(urlToSend: string, fileName: string, callback: () => void) {
  var req = new XMLHttpRequest();
  req.open("GET", urlToSend, true);
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
          application: application
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
    application: application
  });

  stream.on("data", rsp => {
    uint8array = mergeTypedArraysUnsafe(uint8array, rsp.getData())
  });

  stream.on("status", function (status) {
    if (status.code == 0) {
      var jsonStr = new TextDecoder("utf-8").decode(uint8array);
      var content = JSON.parse(jsonStr)
      callback(content)
    } else {
      // error here...
    }
  });

  stream.on("end", () => {
    // stream end signal
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
      application: application
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
      application: application
    })
    .then(resp => {
      if (callback != undefined) {
        callback(JSON.parse(resp.getValue()));
      }
    })
    .catch(error => {
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
  errorCallback: (err: string) => void
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
    application: application
  });
  stream.on("data", rsp => {
    buffer.value += rsp.getValue();
    buffer.warning = rsp.getWarnings();
  });

  stream.on("status", function (status) {
    if (status.code == 0) {
      callback(JSON.parse(buffer.value));
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
    .registerAccount(request, { application: application })
    .then(rsp => {
      callback(rsp.getResult());
    })
    .catch(err => {
      errorCallback(err);
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
    .authenticate(rqst, { application: application })
    .then(rsp => {
      // Here I will set the token in the localstorage.
      let token = rsp.getToken();
      let decoded = jwt(token);

      // here I will save the user token and user_name in the local storage.
      localStorage.setItem("user_token", token);
      localStorage.setItem("user_name", (<any>decoded).username);

      // Publish local login event.
      eventHub.publish("onlogin", decoded, true);
      callback(decoded);

      // Refresh the token at session timeout
      setTimeout(() => {
        refreshToken(errorCallback);
      }, globular.config.SessionTimeout.valueOf()); // 1 second before token expire.
    })
    .catch(err => {
      errorCallback(err);
    });
}

function refreshToken(onError: (err: any) => void) {
  let rqst = new RefreshTokenRqst();
  rqst.setToken(localStorage.getItem("user_token"));

  globular.ressourceService
    .refreshToken(rqst, {
      token: localStorage.getItem("user_token"),
      application: application
    })
    .then((rsp: RefreshTokenRsp) => {
      // Here I will set the token in the localstorage.
      let token = rsp.getToken();
      let decoded = jwt(token);

      // here I will save the user token and user_name in the local storage.
      localStorage.setItem("user_token", token);
      localStorage.setItem("user_name", (<any>decoded).username);

      // Publish local login event.
      eventHub.publish("onlogin", decoded, true);

      // Refresh the token at session timeout
      setTimeout(() => {
        refreshToken(onError);
      }, globular.config.SessionTimeout.valueOf()); // 1 second before token expire.
    })
    .catch((err: any) => {
      onError(err);
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
      application: application
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
      application: application
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
    .getAllActions(rqst, { application: application })
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
    application: application
  });
  var jsonStr = "";

  stream.on("data", (rsp: FindResp) => {
    jsonStr += rsp.getJsonstr();
  });

  stream.on("status", function (status) {
    if (status.code == 0) {
      callback(JSON.parse(jsonStr));
    } else {
      errorCallback({});
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
  action: string,
  role: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new AddRoleActionRqst();
  rqst.setRoleid(role);
  rqst.setAction(action);

  globular.ressourceService
    .addRoleAction(rqst, {
      token: localStorage.getItem("user_token"),
      application: application
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
  action: string,
  role: string,
  callback: () => void,
  errorCallback: (err: any) => void
) {
  let rqst = new RemoveRoleActionRqst();
  rqst.setRoleid(role);
  rqst.setAction(action);

  globular.ressourceService
    .removeRoleAction(rqst, {
      token: localStorage.getItem("user_token"),
      application: application
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
  role.setName(id);
  rqst.setRole(role);

  globular.ressourceService
    .createRole(rqst, {
      token: localStorage.getItem("user_token"),
      application: application
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
      application: application
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
    .getAllFilesInfo(rqst, { application: application })
    .then((rsp: GetAllFilesInfoRsp) => {
      let filesInfo = JSON.parse(rsp.getResult());
      callbak(filesInfo);
    })
    .catch((err: any) => {
      errorCallback(err);
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////
// Services
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Find services by keywords.
 * @param query
 * @param callback
 */
export function findServices(
  keywords: Array<string>,
  callback: (results: Array<ServiceDescriptor>) => void
) {
  let rqst = new FindServicesDescriptorRequest();
  rqst.setKeywordsList(keywords);

  // Find services by keywords.
  globular.servicesDicovery
    .findServices(rqst, { application: application })
    .then((rsp: FindServicesDescriptorResponse) => {
      console.log(rsp);
      callback(rsp.getResultsList());
    })
    .catch((err: any) => {
      console.log(err);
    });
}

export function installService(
  discoveryId: string,
  serviceId: string,
  publisherId: string,
  version: string,
  callback: () => void
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
      application: application
    })
    .then((rsp: InstallServiceResponse) => {
      console.log("---> service install");
      callback();
    });
}

/**
 * Stop a service.
 */
export function stopService(serviceId: string, callback: () => void) {
  let rqst = new StopServiceRequest();
  rqst.setServiceId(serviceId);
  globular.adminService
    .stopService(rqst, {
      token: localStorage.getItem("user_token"),
      application: application
    })
    .then(() => {
      callback();
    })
    .catch((err: any) => {
      console.log("fail to stop service ", serviceId);
      console.log(err);
    });
}

/**
 * Start a service
 * @param serviceId The id of the service to start.
 * @param callback  The callback on success.
 */
export function startService(serviceId: string, callback: () => void) {
  let rqst = new StartServiceRequest();
  rqst.setServiceId(serviceId);
  globular.adminService
    .startService(rqst, {
      token: localStorage.getItem("user_token"),
      application: application
    })
    .then(() => {
      callback();
    })
    .catch((err: any) => {
      console.log("fail to start service ", serviceId);
      console.log(err);
    });
}

/**
 * Here I will save the service configuration.
 * @param service The configuration to save.
 */
export function saveService(
  service: GlobularWebClient.IServiceConfig,
  callback: (config: any) => void
) {
  let rqst = new SaveConfigRequest();

  rqst.setConfig(JSON.stringify(service));
  globular.adminService
    .saveConfig(rqst, {
      token: localStorage.getItem("user_token"),
      application: application
    })
    .then((rsp: SaveConfigResponse) => {
      // The service with updated values...
      let service = JSON.parse(rsp.getResult());
      callback(service);
    });
}

/**
 * Read all user data.
 */
export function readUserData(query: string, callback: (results: any) => void) {
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
    application: application
  });
  let results = new Array();

  // Get the stream and set event on it...
  stream.on("data", rsp => {
    results = results.concat(JSON.parse(rsp.getJsonstr()));
  });

  stream.on("status", status => {
    if (status.code == 0) {
      callback(results);
    }
  });

  stream.on("end", () => {
    // stream end signal
  });
}
