import { ConfigurationPanel } from "../configurationPanel"
import { syncLdapInfos } from "../backend";

class LdapUsersSyncServicePanel extends ConfigurationPanel {
    private baseTextLine: any;
    private queryTextLine: any;
    private idTextLine: any;
    private emailTextLine: any;

    constructor(userInfos: any, id: string, name: string) {

        // The config must be LDAP sync info.
        super(userInfos, name, id)

        // The LDAP base.
        this.baseTextLine = this.appendTextualConfig("Base");

        // The Query text
        this.queryTextLine = this.appendTextualConfig("Query", "Query");

        // The LDAP user id field
        this.idTextLine = this.appendTextualConfig("Id", "Id Field");

        // The LDAP user email field
        this.emailTextLine = this.appendTextualConfig("Email", "Email Field");
    }

    onlogin(data: any) {
        super.onlogin(data);

        // simply append the root variable.
        this.baseTextLine.unlock()
        this.queryTextLine.unlock()
        this.idTextLine.unlock()
        this.emailTextLine.unlock()
    }

    onlogout() {
        super.onlogout();
        this.baseTextLine.lock()
        this.queryTextLine.lock()
        this.idTextLine.lock()
        this.emailTextLine.lock()
    }
}

class LdapGroupsSyncServicePanel extends ConfigurationPanel {
    private baseTextLine: any;
    private queryTextLine: any;
    private idTextLine: any;

    constructor(groupInfos: any, id: string, name: string) {

        // The config must be LDAP sync info.
        super(groupInfos, name, id)

        // The LDAP base.
        this.baseTextLine = this.appendTextualConfig("Base");

        // The Query text
        this.queryTextLine = this.appendTextualConfig("Query",);

        // The LDAP group id field
        this.idTextLine = this.appendTextualConfig("Id", "Id Field");
    }

    onlogin(data: any) {
        super.onlogin(data);
        // simply append the root variable.
        this.baseTextLine.unlock()
        this.queryTextLine.unlock()
        this.idTextLine.unlock()
    }

    onlogout() {
        super.onlogout();
        this.baseTextLine.lock()
        this.queryTextLine.lock()
        this.idTextLine.lock()
    }
}

/**
 * LDAP syncronication panel...
 */
export class LdapSyncServicePanel extends ConfigurationPanel {

    // Contain information's to synchronyze LDAP with Globular.
    private connectionIdEnumLine: any;
    private ldapRefreshRateLine: any;

    // The ldap users sync service panel.
    private ldapUsersSyncServicePanel: LdapUsersSyncServicePanel;

    // The ldap group sync service panel.
    private ldapGroupsSyncServicePanel: LdapGroupsSyncServicePanel;

    constructor(syncInfos: any, id: string, name: string) {
        // The config must be LDAP sync info.
        super(syncInfos, name, id)
        this.connectionIdEnumLine = this.appendEnumConfig("ConnectionId", [], false, "Connection");
        
        //Display the number of ldap refresh rate per day's
        this.ldapRefreshRateLine = this.appendTextualConfig("Refresh", "Refresh rates", "number", 1, 0, 65535);
              

        // The ldap user sync infos.
        this.ldapUsersSyncServicePanel = new LdapUsersSyncServicePanel(syncInfos.UserSyncInfos, "", "");
        let userSyncInfos =  this.appendEmptyConfig("UserSyncInfos", "Users")
        userSyncInfos.label.element.className = "s12"
        userSyncInfos.content.appendElement(this.ldapUsersSyncServicePanel.content)
        userSyncInfos.content.getChildById("content").element.style.padding = "12px";

        // The ldap group sync infos.
        this.ldapGroupsSyncServicePanel = new LdapGroupsSyncServicePanel(syncInfos.GroupSyncInfos, "", "")
        let groupSyncInfos =  this.appendEmptyConfig("GroupSyncInfos", "Groups")
        groupSyncInfos.label.element.className = "s12"
        groupSyncInfos.content.appendElement(this.ldapGroupsSyncServicePanel.content)
        groupSyncInfos.content.getChildById("content").element.style.padding = "12px";

        this.ldapUsersSyncServicePanel.hasChange = () => {
            this.hasChange()
        }

        this.ldapGroupsSyncServicePanel.hasChange = () => {
            this.hasChange()
        }
    }

    // Set the ldap info.
    setLdap(ldap: any) {
        this.connectionIdEnumLine.getValueEditor().removeAllChilds()
        for (let connectionId in ldap.Connections) {
            this.connectionIdEnumLine.getValueEditor().appendElement({ tag: "option", value: connectionId, innerHtml: connectionId })
        }

    }

    onlogin(data: any) {
        super.onlogin(data);
        // Do nothing in case the connections are ready exist.
        if (this.content.getChildById("connections_div") != undefined) {
            return;
        }

        // simply append the root variable.
        this.ldapRefreshRateLine.unlock();
        this.connectionIdEnumLine.unlock();

        // Set the data configuration from the data object.
        this.ldapUsersSyncServicePanel.onlogin(data.UserSyncInfos)
        this.ldapGroupsSyncServicePanel.onlogin(data.GroupSyncInfos)

    }

    onlogout() {
        super.onlogout();
        this.ldapRefreshRateLine.lock();
        this.connectionIdEnumLine.lock();

    }

    save() {

        // set the ldap fiedl into the 
        this.ldapGroupsSyncServicePanel.save()
        this.ldapUsersSyncServicePanel.save()

        // Call the default function.
        super.save()
        
        // Here I will set ldap infon
        syncLdapInfos(this.config, 1, () => {
            console.log("info was ", this.config.id, " was synchronize!")
        })
    }
}