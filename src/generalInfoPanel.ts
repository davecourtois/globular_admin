
import { IConfig } from "globular-web-client";
import { ConfigurationPanel } from "./configurationPanel";

/**
 * That class will contain the general server information.
 */
export class GeneralInfoPanel extends ConfigurationPanel {
    // The name of the server
    private nameInput: any;
    private nameDiv: any;
    // The domain of the server.
    private domainInput: any;
    private domainDiv: any;
    // The protocol in use can be http or https.
    private protocolDiv: any;
    private httpProtocolLabel: any;
    private httpProtocolInput: any;
    private httpsProtocolLabel: any;
    private httpsProtocolInput: any;

    constructor(config: IConfig) {
        // Init the configuration panel informations.
        super(config, "General Server Informations", "general_info_panel");

        // Keep a pointer to the config.
        this.config = config;

        // Set the general server informations.
        this.content
            // The name of the server.
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "height: 100%", "innerHtml": "Name" })
            .appendElement({ "tag": "div", "id": "name_div", "class": "col s12 m6", "innerHtml": config.Name })
            .appendElement({ "tag": "input", "id": "name_input", "style": "display: none;", "class": "col s12 m6", "type": "text" }).up()
            // The domain of the server.
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "height: 100%", "innerHtml": "Domain" })
            .appendElement({ "tag": "div", "id": "domain_div", "class": "col s12 m6", "innerHtml": config.Domain })
            .appendElement({ "tag": "input", "id": "domain_input", "style": "display: none;", "class": "col s12 m6", "type": "text" }).up()
            // The protocol 
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "height: 100%", "innerHtml": "Protocol" })
            .appendElement({ "tag": "div", "id": "protocol_div", "class": "col s12 m6", "innerHtml": config.Protocol })
            .appendElement({ "tag": "label", "id": "http_protocol_label", "style": "display: none;", "class": "col s6 m3" }).down()
            .appendElement({ "tag": "input", "id": "http_protocol_input", "name": "protocol_group", "type": "radio" })
            .appendElement({ "tag": "span", "innerHtml": "http" }).up()
            .appendElement({ "tag": "label", "id": "https_protocol_label", "style": "display: none;", "class": "col s6 m3", }).down()
            .appendElement({ "tag": "input", "id": "https_protocol_input", "name": "protocol_group", "type": "radio" })
            .appendElement({ "tag": "span", "innerHtml": "https" }).up()

        // Set the interface controls.
        // The name
        this.nameDiv = this.div.getChildById("name_div")
        this.nameInput = this.div.getChildById("name_input")
        // The domain
        this.domainDiv = this.div.getChildById("domain_div")
        this.domainInput = this.div.getChildById("domain_input")
        // The protocol 
        this.protocolDiv = this.div.getChildById("protocol_div")
        this.httpProtocolLabel = this.div.getChildById("http_protocol_label")
        this.httpProtocolInput = this.div.getChildById("http_protocol_input")
        this.httpsProtocolLabel = this.div.getChildById("https_protocol_label")
        this.httpsProtocolInput = this.div.getChildById("https_protocol_input")

        // Actions.
        this.domainInput.element.onchange = this.nameInput.element.onchange =
            this.httpProtocolInput.element.onchange = this.httpsProtocolInput.element.onchange =
            () => {
                this.hasChange()
            }
    }

    // Inialize html element whit the configuration values.
    initControl() {
        // The Name
        this.nameInput.element.value = this.nameDiv.element.innerHTML;
        this.nameDiv.element.style.display = "none"
        this.nameInput.element.style.display = ""
        // The Domain
        this.domainInput.element.value = this.domainDiv.element.innerHTML;
        this.domainDiv.element.style.display = "none"
        this.domainInput.element.style.display = ""
        // The protocol.
        this.httpProtocolLabel.element.style.display = ""
        this.httpsProtocolLabel.element.style.display = ""
        this.protocolDiv.element.style.display = "none"
        if (this.config.Protocol == "http") {
            this.httpsProtocolInput.element.checked = "false"
            this.httpProtocolInput.element.checked = "true"
        } else {
            this.httpProtocolInput.element.checked = "false"
            this.httpsProtocolInput.element.checked = "true"
        }
    }

    /**
     * Overload the parent.
     * @param data
     */
    onlogin(data: any) {
        if (data.username == "sa") {
            this.initControl()
            super.onlogin(data)
        }
    }


    cancel() {
        // Set back the interface to the previous values.
        this.initControl()

        // Call the function on the parent.
        super.cancel()

    }

    save() {
        // Here I will set each value into the configuration.
        this.config.Name = this.nameDiv.element.innerHTML = this.nameInput.element.value;
        this.config.Domain = this.domainDiv.element.innerHTML = this.domainInput.element.value;
        if(this.httpProtocolInput.element.checked){
            this.config.Protocol = "http"
        }else{
            this.config.Protocol = "https"
        }

        super.save()
    }

}