import { IConfig } from "globular-web-client";
import { ConfigurationPanel } from "./configurationPanel";
import { saveConfig, readFullConfig } from "./backend";
import { LdapSyncServicePanel } from "./services/ldapSyncServicePanel";

/**
 * That class will contain the general server information.
 */
export class GeneralInfoPanel extends ConfigurationPanel {
  private ldapSyncInfosLine: any;
  private ldapSyncPanels: Array<LdapSyncServicePanel>;
  private ldapServices: any;

  constructor(config: IConfig) {
    // Init the configuration panel informations.
    super(config, "General Server Informations", "general_info_panel");

    // Set the name propertie.
    this.appendTextualConfig("Name");

    // Set the domain propertie.
    this.appendTextualConfig("Domain");

    // Set the general server informations.
    this.appendMultipleOptionsSingleChoiceConfig("Protocol", ["http", "https"]);

    // Set the Ports..
    this.appendTextualConfig("PortHttp", "Http port", "number", 1, 0, 65535);

    // Set the Ports..
    this.appendTextualConfig("PortHttps", "Https port", "number", 1, 0, 65535);

    // Display list of domains
    this.appendStringListConfig("Discoveries", "Services Discorvery");

    // Display the list nameserver.
    this.appendStringListConfig("DNS", "Domain Name Servers");

    this.ldapSyncPanels = new Array<any>();
    this.ldapServices = {};

  }


  createLdapSynInfoPanel(ul: any, info: any): any {

    // Here I will create the connections.
    let li = ul.prependElement({ tag: "li" }).down()

    // The ldap service object.
    let ldap = this.ldapServices[info.LdapSeriveId]

    if (ldap == undefined) {
      // Set to the first element.
      ldap = this.ldapServices[Object.keys(this.ldapServices)[0]]
      info.LdapSeriveId = ldap.Id
    }

    let deleteBtn = li.appendElement({ tag: "div", class: "collapsible-header", style: "display: flex; align-items: center;" }).down()
      .appendElement({ tag: "span", id: "id_span", class: "col s6", innerHtml: ldap.Id })
      .appendElement({ tag: "select", id: "id_select", class: "col s6 browser-default col", value: ldap.Id, style: "display:none;" })
      .appendElement({ tag: "div", class: "col s6 right-align" }).down()
      .appendElement({ tag: "i", class: "Small material-icons", style: "cursor: default;", innerHtml: "delete" }).down()

    // Here I will create the list of option from the list of ldap services.
    let idSelect = li.getChildById("id_select")
    let idSpan = li.getChildById("id_span")

    for (let id in this.ldapServices) {
      idSelect.appendElement({ tag: "option", value: id, innerHtml: id })
    }

    // display the span or the select box...
    if (this.ldapServices[info.LdapSeriveId] == undefined) {
      idSelect.element.style.display = ""
      idSpan.element.style.display = "none"
    }

    // init the select.
    M.FormSelect.init(idSelect)

    idSelect.element.onkeyup = (evt: any) => {
      // Set the value...
      idSpan.element.innerHTML = idSelect.element.value;
      if (evt.keyCode == 13) {
        idSpan.element.style.display = ""
        idSelect.element.style.display = "none"
      }
    }


    idSelect.element.onclick = (evt: any) => {
      evt.stopPropagation()
    }

    deleteBtn.element.onmouseover = function () {
      this.style.cursor = "pointer"
    }

    deleteBtn.element.onmouseout = function () {
      this.style.cursor = "default"
    }

    let syncInfoDiv = li.appendElement({ tag: "div", class: "collapsible-body" }).down()
      .appendElement({ tag: "div", id: "content" }).down()

    // Now I will create a new coniguration panel.
    let synInfoPanel = new LdapSyncServicePanel(info, "", "")
    synInfoPanel.setLdap(ldap)
    
    idSelect.element.onchange = () => {
      // Set the value...
      idSpan.element.innerHTML = idSelect.element.value;
      info.LdapSeriveId = idSelect.element.value;
      synInfoPanel.setLdap(this.ldapServices[info.LdapSeriveId])
    }

    syncInfoDiv.appendElement(synInfoPanel.content);

    // keep the connction config panel.
    this.ldapSyncPanels.push(synInfoPanel)

    // Set the panel editable.
    synInfoPanel.onlogin(info)

    // redirect the config event...
    synInfoPanel.hasChange = () => {
      this.hasChange()
    }

    deleteBtn.element.onclick = (evt: any) => {
      evt.stopPropagation()
      let index = this.ldapSyncPanels.indexOf(synInfoPanel)
      this.ldapSyncPanels.splice(index, 1)
      delete this.config.ldapSyncPanels[info.Id]
      // Delete the connection div.
      li.delete()
      this.hasChange()
    }

    return li;

  }

  // create control...
  onlogin(data: any) {
    // Display textual input
    super.onlogin(data);
    readFullConfig((config: IConfig) => {
      // read the full configuration...
      this.config = config;

      // Here I will try to get the ldap information to synchronise user/group
      for (var serviceId in this.config.Services) {
        if (this.config.Services[serviceId].Name == "ldap_server") {
          this.ldapServices[serviceId] = this.config.Services[serviceId]
        }
      }

      if (Object.keys(this.ldapServices).length > 0) {

        // get the ldap service.
        // let ldap_service = this.config.Services["ldap_server"]

        // Create an empty panel. 
        this.ldapSyncInfosLine = this.appendEmptyConfig("LdapSyncInfos", "LDAP Sync infos")

        // So here I will get the list of synchronization informations.
        this.ldapSyncInfosLine.content.element.firstChild.className = "col s11 m3"
        this.ldapSyncInfosLine.content.appendElement({ tag: "i", class: "material-icons col s1", id: "append_new_connection", innerHtml: "add" })

        let ul = this.ldapSyncInfosLine.content
          .appendElement({ tag: "div", class: "switch col s12 m8", id: "connections_div" }).down()
          .appendElement({ tag: "ul", class: "collapsible", style: "box-shadow: none;" }).down()

        // Now in each ul I will append the synchronization panel.
        for (var id in this.config.Connections) {
          this.createLdapSynInfoPanel(ul, this.config.Connections[id])
        }

        M.Collapsible.init(ul.element)

        // The connection id.
        let newSyncInfoBtn = this.ldapSyncInfosLine.content.getChildById("append_new_connection")
        newSyncInfoBtn.element.onmouseover = function () {
          this.style.cursor = "pointer"
        }

        newSyncInfoBtn.element.onmouseout = function () {
          this.style.cursor = "default"
        }

        newSyncInfoBtn.element.onclick = () => {
          let connection = { LdapSeriveId: "", ConnectionId: "", Refresh:1, UserSyncInfos:{ Base:"", Query:"", Id:"", Email:"" },  GroupSyncInfos:{ Base:"", Query:"", Id:"" }}
          let li = this.createLdapSynInfoPanel(ul, connection)
        }
      }

    });
  }

  // That function is the same for all configuration panels.
  save() {
    super.save();

    // Now I will save the configuration.
    saveConfig(this.config, (config: IConfig) => {
      M.toast({ html: "The configuration was saved!" });
      this.config = config; // set back the config...

      // Save the services.
      for (let i = 0; i < this.ldapSyncPanels.length; i++) {
        this.ldapSyncPanels[i].save()
      }

    });
  }
}
