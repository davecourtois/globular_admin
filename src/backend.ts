import * as GlobularWebClient from "globular-web-client";
import { GetConfigRequest, SaveConfigRequest } from "globular-web-client/lib/admin/admin_pb";
import { QueryRangeRequest, QueryRequest } from 'globular-web-client/lib/monitoring/monitoringpb/monitoring_pb';
import { randomUUID } from './utility'
import { RegisterAccountRqst, AuthenticateRqst, Account } from 'globular-web-client/lib/ressource/ressource_pb';
import * as jwt from 'jwt-decode'
import { InsertOneRqst, FindOneRqst } from "globular-web-client/lib/persistence/persistencepb/persistence_pb";
import { FindServicesDescriptorRequest, FindServicesDescriptorResponse, ServiceDescriptor } from "globular-web-client/lib/services/services_pb";

// Create a new connection with the backend.
export let globular: GlobularWebClient.Globular;
export let eventHub: GlobularWebClient.EventHub;

let config: any;
export async function initServices(callback: () => void) {
    // Set the basic configuration without services details.
    // TODO get the value found from http://domain:10000
    /*
    fetch("https://" + window.location.hostname + ":10000")
        .then(res => res.json())
        .then((out) => {
            console.log('Checkout this JSON! ', out);
        })
        .catch(err => { throw err }); 
    */

    config = {
        Protocol: "https",
        Domain: window.location.hostname,
        PortHttps: 443,
        AdminPort: 10001,
        AdminProxy: 10002,
        Services: {} // empty for start.
    };

    // Create a new connection with the backend.
    globular = new GlobularWebClient.Globular(config);
    console.log("init globular services.")
    let rqst = new GetConfigRequest();
    if (globular.adminService !== undefined) {
        globular.adminService.getConfig(rqst).then((rsp) => {
            let config = JSON.parse(rsp.getResult())
            // init the services from the configuration retreived.
            globular = new GlobularWebClient.Globular(config);
            // create the event hub and set globular.eventService to enable 
            // network events.
            eventHub = new GlobularWebClient.EventHub(globular.eventService);
            callback()
        }).catch((err) => {
            console.log("fail to get config ", err)
        })
    }
}

// let config = globular.adminService.GetConfig()
export function readFullConfig(callback: (config: GlobularWebClient.IConfig) => void) {
    let rqst = new GetConfigRequest();

    if (globular.adminService !== undefined) {
        globular.adminService.getFullConfig(rqst, { "token": localStorage.getItem("user_token") }).then((rsp) => {
            config = JSON.parse(rsp.getResult())
            callback(config)
        }).catch((err) => {
            console.log("fail to get config ", err)
        })
    }
}

// Save the configuration.
export function saveConfig(config: GlobularWebClient.IConfig, callback: (config: GlobularWebClient.IConfig) => void) {
    let rqst = new SaveConfigRequest();
    rqst.setConfig(JSON.stringify(config))

    if (globular.adminService !== undefined) {
        globular.adminService.saveConfig(rqst, { "token": localStorage.getItem("user_token") }).then((rsp) => {
            config = JSON.parse(rsp.getResult())
            callback(config)
        }).catch((err) => {
            console.log("fail to save config ", err)
        })
    }
}

///////////////////////////////////// Monitoring //////////////////////////////////////
// Run a query.
export function query(connectionId: string, query: string, ts: number, callback: (value: any) => void, errorCallback: (error: any) => void) {
    // Create a new request.
    var request = new QueryRequest();
    request.setConnectionid(connectionId)
    request.setQuery(query);
    request.setTs(ts)

    // Now I will test with promise
    globular.monitoringService.query(request)
        .then((resp) => {
            if (callback != undefined) {
                callback(JSON.parse(resp.getValue()))
            }
        })
        .catch((error) => {
            if (errorCallback != undefined) {
                errorCallback(error)
            }
        })
}

// Run Query with a given range.
export function queryRange(connectionId: string, query: string, startTime: number, endTime: number, step: number, callback: (values: any) => void, errorCallback: (err: string) => void) {
    // Create a new request.
    var request = new QueryRangeRequest();
    request.setConnectionid(connectionId)
    request.setQuery(query);
    request.setStarttime(startTime);
    request.setEndtime(endTime);
    request.setStep(step);
    var uuid = randomUUID()

    let buffer = { "value": "", "warning": "" }

    var stream = globular.monitoringService.queryRange(request)
    stream.on('data', (rsp) => {
        buffer.value += rsp.getValue()
        buffer.warning = rsp.getWarnings()
    });

    stream.on('status',
        function (status) {
            if (status.code == 0) {
                callback(JSON.parse(buffer.value))
            }
        })

    stream.on('end', () => {
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
export function registerAccount(userName: string, email: string, password: string, confirmPassword: string, callback: (value: any) => void, errorCallback: (err: any) => void) {
    var request = new RegisterAccountRqst()
    var account = new Account()
    account.setName(userName)
    account.setEmail(email)
    request.setAccount(account)
    request.setPassword(password)
    request.setConfirmPassword(confirmPassword)

    // Create the user account.
    globular.ressourceService.registerAccount(request).then((rsp) => {
        callback(rsp.getResult())
    }).catch((err) => {
        errorCallback(err)
    })
}

/**
 * Authenticate the user and get the token
 * @param userName The account name or email
 * @param password  The user password
 * @param callback 
 * @param errorCallback 
 */
export function authenticate(userName: string, password: string, callback: (value: any) => void, errorCallback: (err: any) => void) {
    var rqst = new AuthenticateRqst()
    rqst.setName(userName)
    rqst.setPassword(password)

    // Create the user account.
    globular.ressourceService.authenticate(rqst).then((rsp) => {
        // Here I will set the token in the localstorage.
        let token = rsp.getToken()
        let decoded = jwt(token);

        // here I will save the user token and user_name in the local storage.
        localStorage.setItem("user_token", token)
        localStorage.setItem("user_name", (<any>decoded).username)

        // Publish local login event.
        eventHub.publish("onlogin", decoded, true);
        callback(decoded)
    }).catch((err) => {
        errorCallback(err)
    })
}

/**
 * Save user data into the user_data collection.
 */
export function appendUserData(data: any, callback: (id: string) => void) {
    let userName = localStorage.getItem("user_name")
    let database = userName + "_db"
    let collection = "user_data"

    let rqst = new InsertOneRqst;
    rqst.setId(database)
    rqst.setDatabase(database)
    rqst.setCollection(collection)
    rqst.setJsonstr(JSON.stringify(data))
    rqst.setOptions("")

    // call persist data
    globular.persistenceService.insertOne(rqst, { "token": localStorage.getItem("user_token") })
        .then((rsp: any) => {
            callback(rsp.getId())
        })
        .catch((err: any) => {
            console.log(err)
        })
}

/**
 * Read user data one result at time.
 */
export function readOneUserData(query: string, callback: (results: any) => void) {
    let userName = localStorage.getItem("user_name")
    let database = userName + "_db"
    let collection = "user_data"

    let rqst = new FindOneRqst;
    rqst.setId(database)
    rqst.setDatabase(database)
    rqst.setCollection(collection)
    rqst.setQuery(query)
    rqst.setOptions("")

    // call persist data
    globular.persistenceService.findOne(rqst, { "token": localStorage.getItem("user_token") })
        .then((rsp: any) => {
            callback(JSON.parse(rsp.getJsonstr()))
        })
        .catch((err: any) => {
            console.log(err)
        })
}

/**
 * Find services by keywords.
 * @param query 
 * @param callback 
 */
export function findServices(keywords: Array<string>, callback: (results: Array<ServiceDescriptor>)=> void){
    let rqst = new FindServicesDescriptorRequest();
    rqst.setKeywordsList(keywords)

    // Find services by keywords.
    globular.servicesDicovery.findServices(rqst).then((rsp: FindServicesDescriptorResponse)=>{
        console.log(rsp)
        callback(rsp.getResultsList())
    })
    .catch((err: any) => {
        console.log(err)
    })
}

/**
 * Read all user data.
 */
export function readUserData(query: string, callback: (results: any) => void) {
    let userName = localStorage.getItem("user_name")
    let database = userName + "_db"
    let collection = "user_data"

    let rqst = new FindOneRqst();
    rqst.setId(database)
    rqst.setDatabase(database)
    rqst.setCollection(collection)
    rqst.setQuery(query)
    rqst.setOptions("")

    // call persist data
    let stream = globular.persistenceService.find(rqst, { "token": localStorage.getItem("user_token") })
    let results = new Array()

    // Get the stream and set event on it...
    stream.on('data', (rsp) => {
        results = results.concat(JSON.parse(rsp.getJsonstr()))
    });

    stream.on('status', (status) => {
        if (status.code == 0) {
            callback(results)
        }
    });

    stream.on('end', () => {
        // stream end signal
    });

}