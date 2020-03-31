import { ServicePanel } from "../servicePanel"
import { IServiceConfig } from "globular-web-client"

/**
 * The sql service admin configuration interface.
 */
export class FileServicePanel extends ServicePanel {

    constructor(service: IServiceConfig, id: string, name: string) {
        super(service, name, id)
    }

    onlogin(data: any) {
        super.onlogin(data);

        // Do nothing in case the connections are ready exist.
        if (this.content.getChildById("connections_div") != undefined) {
            return;
        }

        // simply append the root variable.
        let rootTextLine = this.appendTextualConfig("Root");
        rootTextLine.unlock()
    }

    onlogout() {
        super.onlogout();
        console.log("---------> logout...")
    }
}