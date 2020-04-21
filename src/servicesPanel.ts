import { Panel } from "./panel";
import {getErrorMessage } from "./backend";
import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";
import { randomUUID } from "./utility";

/**
 * This class is use to manage file on the server.
 */
export class ServiceManager extends Panel {
  private editable: boolean;

  // File panel constructor.
  constructor(id: string) {
    super(id);
    this.displayServices()
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
    this.editable = true;
    this.displayServices()
  }

  onlogout() {
    // overide...
    this.editable = false;
    this.displayServices()
  }

  /**
   * Display the Service.
   * @param content 
   * @param Service 
   */
  displayService(content: any, Service: any) {
    // reset the interface.
    content.removeAllChilds();

  }

  refresh(){
    this.displayServices()
  }

  displayServices() {
    // clear the panel before recreate information inside it.
    this.div.removeAllChilds()
  }

}