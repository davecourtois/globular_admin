import { ServicePanel } from "../servicePanel"
import { IServiceConfig } from "globular-web-client"

/**
 * The sql service admin configuration interface.
 */
export class DnsServicePanel extends ServicePanel {

    constructor(service: IServiceConfig, id: string, name: string) {
        super(service, id, name)
    }

    onlogin(data: any) {
        super.onlogin(data);

        // Do nothing in case the connections are ready exist.
        if (this.content.getChildById("connections_div") != undefined) {
            return;
        }

        // simply append the root variable.
        let dnsPort = this.appendTextualConfig("DnsPort", "DNS Port", "number", 1, 0, 64000);
        dnsPort.unlock()

        let storageDataPath = this.appendTextualConfig("StorageDataPath", "Storage Data Path");
        storageDataPath.unlock()

        let storageDataDomain = this.appendTextualConfig("StorageService", "Storage Address");
        storageDataDomain.unlock()

        let managedDomains = this.appendStringListConfig("Domains", "Managed Domains");
        managedDomains.unlock()

    }

    onlogout() {
        super.onlogout();
        console.log("---------> logout...")
    }
}