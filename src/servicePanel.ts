import { ConfigurationPanel } from "./configurationPanel";
import { IServiceConfig } from "globular-web-client";
import { randomUUID } from "./utility";
import { createElement } from "./element";

/**
 * That class is use to display service configuration.
 */
export class ServicePanel extends ConfigurationPanel{
    private uninstallBtn: any;
    private stopBtn: any;
    private startBtn: any;
    public actionBtnGroup: any;

    constructor(service: IServiceConfig, name: string){
        super(service, name, randomUUID())

        // So Here I will display common service function...
        
        // Set the domain propertie.
        this.appendTextualConfig("Domain");

        // Set the id of the publisher
        this.appendTextualConfig("PublisherId", "Publisher");

        // The version of the service...
        this.appendTextualConfig("Version");

        // TLS todo create boolean configuration values...
        this.appendBooleanConfig("KeepUpToDate", ["True", "False"], "Keep up to date")

        // The port
        this.appendTextualConfig("Port", "Port", "number", 1, 0, 65535);

        // The proxy
        this.appendTextualConfig("Proxy", "Proxy", "number", 1, 0, 65535);

        // TLS todo create boolean configuration values...
        this.appendBooleanConfig("TLS", ["True", "False"], "Use TLS")
        
        // Here I will append specific button
        this.actionBtnGroup = createElement(null, {"tag":"div", "class":"col s6 right-align", "style":"visibility: hidden;"})

        this.actionBtnGroup
        .appendElement({ "tag":"a", "id":"uninstall_btn", "href": "javascript:void(0)", "class":"waves-effect waves-light btn-flat", "innerHtml":"Uninstall", "style":"margin-right: 2px;"})
        .appendElement({ "tag":"a", "id":"stop_btn", "href": "javascript:void(0)", "class":"waves-effect waves-light btn-flat", "innerHtml":"Stop", "style":"margin-right: 2px;"})
        .appendElement({ "tag":"a", "id":"start_btn", "href": "javascript:void(0)", "class":"waves-effect waves-light btn-flat disabled", "innerHtml":"Start", "style":"margin-right: 2px; display: none;"})

        this.uninstallBtn = this.actionBtnGroup.getChildById("uninstall_btn")
        this.stopBtn = this.actionBtnGroup.getChildById("stop_btn")
        this.startBtn = this.actionBtnGroup.getChildById("start_btn")

        // Actions..
        this.uninstallBtn.element.onclick = (evt: any) => {
            evt.stopPropagation()
        }

        this.stopBtn.element.onclick = (evt: any) => {
            evt.stopPropagation()
        }

        this.startBtn.element.onclick = (evt: any) => {
            evt.stopPropagation()
        }
    }

    onlogin(data: any){
        super.onlogin(data);
        this.actionBtnGroup.element.style.visibility = "visible"
    }

    onlogout(){
        super.onlogout()
        this.actionBtnGroup.element.style.visibility = "hidden"
    }

    save() {
        super.save()
    
        // Now I will save the configuration.
        console.log("save service!")
    
      }
}