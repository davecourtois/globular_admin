import { eventHub } from "./backend";
import { createElement } from "./element"

export class Panel {
    protected div: any;
    private uuid: string;

    constructor(id: string) {
        // Div is the html element div.
        this.div = createElement(null, { "tag": "div", "id": id });
        eventHub.subscribe("onlogin", (uuid: string) => { this.uuid = uuid; }, (data: any) => { this.onlogin(data) })
    }

    // Here I will react to login information...
    onlogin(data: any) {
        // That function will be called when user will be log into the application.
        console.log("---> onlogin event received: ", data)
    }

    close() {
        // disconnect the subscriber from the event channel...
        eventHub.unSubscribe("onlogin", this.uuid)
    }

    setParent(parent: any){
        parent.appendElement(this.div)
    }
}