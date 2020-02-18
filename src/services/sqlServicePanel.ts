import { ServicePanel } from "../servicePanel"
import { IServiceConfig } from "globular-web-client"
import { ConfigurationPanel } from "../configurationPanel";

/**
 * The sql service admin configuration interface.
 */
export class SqlServicePanel extends ServicePanel {
    private connections: Array<ConfigurationPanel>;

    constructor(service: IServiceConfig, id: string, name: string) {
        super(service, name, id)
        this.connections = new Array<any>()
    }

    onlogin(data: any) {
        super.onlogin(data);

        // Do nothing in case the connections are ready exist.
        if (this.content.getChildById("connections_div") != undefined) {
            return;
        }

        // Here i will initialyse specifig configurations option.
        let connectionsLine = this.appendEmptyConfig("Connections")
        connectionsLine.content.element.firstChild.className = "col s11 m5"
        connectionsLine.content.appendElement({ tag: "i", class: "material-icons col s1", id: "append_new_connection", innerHtml: "add" })

        let ul = connectionsLine.content
            .appendElement({ tag: "div", class: "switch col s12 m6", id: "connections_div" }).down()
            .appendElement({ tag: "ul", class: "collapsible", style: "box-shadow: none;" }).down()

        for (var id in this.config.Connections) {
            let connection = this.config.Connections[id]
            // Here I will create the connections.
            let li = ul.appendElement({ tag: "li" }).down()

            let deleteBtn = li.appendElement({ tag: "div", class: "collapsible-header", style: "display: flex; align-items: center;" }).down()
                .appendElement({ tag: "span", class: "col s6", innerHtml: connection.Name })
                .appendElement({ tag: "div", class: "col s6 right-align" }).down()
                .appendElement({ tag: "i", class: "Small material-icons", style: "cursor: default;", innerHtml: "delete" }).down()

            deleteBtn.element.onmouseover = function () {
                this.style.cursor = "pointer"
            }

            deleteBtn.element.onmouseout = function () {
                this.style.cursor = "default"
            }

            let connectionDiv = li.appendElement({ tag: "div", class: "collapsible-body" }).down()
                .appendElement({ tag: "div", id: "content" }).down()

            // Now I will create a new coniguration panel.
            let configPanel = new ConfigurationPanel(connection, "", "")
            configPanel.appendTextualConfig("Name")
            configPanel.appendEnumConfig("Driver", ["odbc", "mysql", "postgres"])
            configPanel.appendTextualConfig("Charset")
            configPanel.appendTextualConfig("User")
            configPanel.appendTextualConfig("Password", "Password", "password")
            configPanel.appendTextualConfig("Port", "Port", "number", 1, 0, 65535)
            connectionDiv.appendElement(configPanel.content);
            configPanel.onlogin(connection)

            // redirect the config event...
            configPanel.hasChange = ()=>{
                this.hasChange()
            }

            // keep the connction config panel.
            this.connections.push(configPanel)
        }

        M.Collapsible.init(ul.element)

        // The connection id.
        let newConnectionBtn = connectionsLine.content.getChildById("append_new_connection")
        newConnectionBtn.element.onmouseover = function () {
            this.style.cursor = "pointer"
        }

        newConnectionBtn.element.onmouseout = function () {
            this.style.cursor = "default"
        }
    }

    onlogout() {
        super.onlogout();
        console.log("---------> 22")
    }


    cancel(){
        super.cancel();
        for(var i=0; i < this.connections.length; i++){
            // cancel each modifictions made on connections.
            this.connections[i].cancel()
        }
    }

    save(){
        for(var i=0; i < this.connections.length; i++){
            // Set the configuration values.
            this.connections[i].save()

            // Set the connection in the config.
            this.config.Connections[this.connections[i].config.Id] = this.connections[i].config
        }

        // save it...
        super.save();
    }
}