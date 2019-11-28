import { Panel } from "./panel";
import { IConfig } from "globular-web-client";
import { saveConfig, readFullConfig } from "./backend";

/**
 * That class will contain the general server information.
 */
export class ConfigurationPanel extends Panel{
    protected config: IConfig;
    protected content: any;
    private saveBtn: any;
    private cancelBtn: any;
    private btnGroup: any;

    constructor(config: IConfig, title: string, id:string){
        super(id);

        // Keep a pointer to the config.
        this.config = config;

        // Display general information.
        this.div.appendElement({ "tag": "div", "class": "row configuration_panel" }).down()
        .appendElement({"tag":"div", "class":"col s12 m8 offset-m2"}).down()
        .appendElement({"tag":"div", "class":"card"}).down()
        .appendElement({"tag":"div", "class":"card-content"}).down()
        .appendElement({"tag":"span", "class":"card-title" , "style":"font-size: 1.5em;", "innerHtml":title})
        .appendElement({"tag":"div", "id":"content"})
        // The action buttons.
        .appendElement({"tag":"div", "class":"card-action", "id":"btn_group", "style":"text-align: right; display: none;"}).down()
        .appendElement({ "tag":"a", "id":"save_btn", "href": "javascript:void(0)", "class":"waves-effect waves-light btn disabled", "innerHtml":"Save"})
        .appendElement({ "tag":"a", "id":"cancel_btn", "href": "javascript:void(0)", "class":"waves-effect waves-light btn disabled", "innerHtml":"Cancel"})

        // The save button
        this.saveBtn = this.div.getChildById("save_btn")
        this.saveBtn.element.onclick = ()=>{
            this.save()
        }

        // The cancel button
        this.cancelBtn = this.div.getChildById("cancel_btn")
        this.cancelBtn.element.onclick = ()=>{
            this.cancel()
        }

        // The group of button.
        this.btnGroup = this.div.getChildById("btn_group")

        // get the content.
        this.content = this.div.getChildById("content")
    }

    onlogin(data: any){
        this.btnGroup.element.style.display = ""
        readFullConfig((config: IConfig)=>{
            // read the full configuration...
            this.config = config
        })
    }

    onlogout(){
        this.btnGroup.element.style.display = "none"
        this.cancel()
    }

    // That function is the same for all configuration panels.
    save(){
        this.cancelBtn.element.classList.add("disabled")
        this.saveBtn.element.classList.add("disabled")

        // Now I will save the configuration.
        saveConfig(this.config, (config: IConfig)=>{
            M.toast({html: 'The configuration was saved!'})
            this.config = config // set back the config...
        })
  
    }

    // must be overide by each panel.
    cancel(){
        this.cancelBtn.element.classList.add("disabled")
        this.saveBtn.element.classList.add("disabled")
    }

    hasChange(){
        this.cancelBtn.element.classList.remove("disabled")
        this.saveBtn.element.classList.remove("disabled")
    }
}