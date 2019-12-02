import { Panel } from "./panel";
import { findServices } from "./backend";
import { ServiceDescriptor } from "globular-web-client/lib/services/services_pb";

/**
 * Search panel is use to retreive services on registerd discoveries.
 */
export class SearchServicesPanel extends Panel {
    private resultsPanel: any;

    constructor() {
        super("search_panel")

    }

    /**
     * That function is call when the user set press the enter button.
     * @param keywords 
     */
    search(keywords: Array<string>){
        findServices(keywords, (services: Array<ServiceDescriptor>)=>{
            for(var i=0; i < services.length; i++){
                console.log(services[i].getId(), services[i].getVersion())
            }
        })
    }

}