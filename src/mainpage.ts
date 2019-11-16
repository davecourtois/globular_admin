
import * as M from "materialize-css";
import {createElement} from "./element"

// Auto init materialyse.
M.AutoInit();

export class MainPage {
    // The outer most div.
    private container:any;

    private navBar:any;

    constructor(){
        // Here I will create the main container.
        this.container = createElement(null, { "tag": "div", "class": "container" })
        document.body.append(this.container.element)

        // Now Will create the navbar.
        this.navBar = this.container.appendElement({"tag":"nav"}).down()

        // The rest of elements...
        this.navBar.appendElement({"tag":"div", "class":"nav-wrapper green"}).down()
            .appendElement({"tag":"a", "id":"logo_btn", "class":"brand-logo left", "innerHtml":"Logo"})
            .appendElement({"tag":"ul", "id":"nav-mobile", "class":"right hide-on-med-and-down"}).down()
            .appendElement({"tag":"li"}).down().appendElement({"tag":"a", "id":"home", "innerHtml":"Home"}).up()
            .appendElement({"tag":"li"}).down().appendElement({"tag":"a", "id":"login", "innerHtml":"Login"}).up()
        
    }
}