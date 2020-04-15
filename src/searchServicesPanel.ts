import { Panel } from "./panel";
import { findServices, installService, getErrorMessage } from "./backend";
import { ServiceDescriptor } from "globular-web-client/lib/services/services_pb";

/**
 * Search panel is use to retreive services on registerd discoveries.
 */
export class SearchServicesPanel extends Panel {
  private resultsPanel: any;
  private isAdmin: boolean;
  private fullConfig: any;

  constructor() {
    super("search_panel");
    // That will contain the results of the actual search.
    this.resultsPanel = this.div.appendElement({ tag: "div" }).down();
    this.isAdmin = false;
  }

  /**
   * That function is call when the user set press the enter button.
   * @param keywords
   */
  search(keywords: Array<string>) {
    this.resultsPanel.removeAllChilds();
    findServices(keywords, (services: Array<ServiceDescriptor>) => {
      for (var i = 0; i < services.length; i++) {
        let descriptorPanel = new ServiceDescriptorPanel(services[i]);
        descriptorPanel.setParent(this.resultsPanel);
        if (this.isAdmin) {
          descriptorPanel.onlogin(this.fullConfig);
        }
      }
    });
  }

  onlogin(data: any) {
    this.isAdmin = true;
    this.fullConfig = data;
  }

  onlogout() {
    this.isAdmin = false;
  }
}

/**
 * Display the description of a services.
 */
class ServiceDescriptorPanel extends Panel {
  private descriptor: ServiceDescriptor;
  private content: any;
  private installBtn: any;
  private uninstallBtn:any;
  private updateBtn:any;
  private btnGroup: any;
  private idInput: any;

  constructor(descriptor: ServiceDescriptor) {
    // Set the panel id.
    super(
      "service_description_panel_" +
      descriptor.getPublisherid() +
      "_" +
      descriptor.getId() +
      "_" +
      descriptor.getVersion()
    );

    // keep track of the service diplayed.
    this.descriptor = descriptor;

    // Display general information.
    this.div
      .appendElement({ tag: "div", class: "row service_descriptor_panel" })
      .down()
      .appendElement({ tag: "div", class: "col s12 /*m10 offset-m1*/" })
      .down()
      .appendElement({ tag: "div", class: "card" })
      .down()
      .appendElement({ tag: "div", class: "card-content" })
      .down()
      .appendElement({
        tag: "span",
        class: "card-title",
        style: "font-size: medium; font-weight: inherit;",
        innerHtml: descriptor.getId()
      })
      .appendElement({ tag: "div", id: "content" })
      // The action buttons.
      .appendElement({
        tag: "div",
        class: "card-action row",
        id: "btn_group",
        style: "text-align: right; display: none; align-items: baseline;"
      })
      .down()
      .appendElement({ tag: "div", class: "input-field col s4 offset-s6" })
      .down()
      .appendElement({
        tag: "input",
        id: this.id + "_install_id_input",
        placeholder: "service id",
        title: "the is of the service on the server.",
        type: "text"
      })
      .appendElement({ tag: "label", for: this.id + "_install_id_input" })
      .up()
      .appendElement({
        tag: "a",
        id: this.id + "_install_btn",
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn disabled col s2",
        innerHtml: "Install"
      })
      .appendElement({
        tag: "a",
        id: this.id + "_update_btn",
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn disabled col s2",
        style: "display: none;",
        innerHtml: "Update"
      })
      .appendElement({
        tag: "a",
        id: this.id + "_uninstall_btn",
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn disabled col s2",
        style: "display: none;",
        innerHtml: "Uninstall"
      })

    this.installBtn = this.div.getChildById(this.id + "_install_btn");
    this.uninstallBtn = this.div.getChildById(this.id + "_uinstall_btn");
    this.updateBtn = this.div.getChildById(this.id + "_update_btn");
    this.content = this.div.getChildById("content");
    this.btnGroup = this.div.getChildById("btn_group");
    this.idInput = this.div.getChildById(this.id + "_install_id_input");

    // Display the publisher id.
    this.content
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({
        tag: "div",
        class: "col s12 m6",
        style: "height: 100%",
        innerHtml: "Publisher"
      })
      .appendElement({
        tag: "div",
        id: "publisher_div",
        class: "col s12 m6",
        innerHtml: descriptor.getPublisherid()
      })
      .down();

    this.content
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({
        tag: "div",
        class: "col s12 m6",
        style: "height: 100%",
        innerHtml: "Version"
      })
      .appendElement({
        tag: "div",
        id: "publisher_div",
        class: "col s12 m6",
        innerHtml: descriptor.getVersion()
      })
      .down();

    this.content
      .appendElement({ tag: "div", class: "row" })
      .down()
      .appendElement({
        tag: "div",
        class: "col s12 m6",
        style: "height: 100%",
        innerHtml: "Description"
      })
      .appendElement({
        tag: "div",
        id: "publisher_div",
        class: "col s12 m6",
        innerHtml: descriptor.getDescription()
      })
      .down();

    // Now actions...
    this.idInput.element.onkeyup = (evt: any) => {
      let value = this.idInput.element.value.replace(/\s/g, "");

      if (value.length > 0) {
        this.installBtn.element.classList.remove("disabled");
      } else {
        this.installBtn.element.classList.add("disabled");
      }
      if (evt.keyCode == 13) {
        installService(
          descriptor.getDiscoveriesList()[0],
          descriptor.getId(),
          descriptor.getPublisherid(),
          descriptor.getVersion(),
          () => {
            
            M.toast({ html: "Service " + descriptor.getId() + " installed successfully!", displayLength: 3000 });
          },
          (err: any) => {
            M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
          }
        );
      }
    };
  }

  onlogin(data: any) {
    // Display textual input
    this.btnGroup.element.style.display = "flex";

    if(data.Services[this.descriptor.getId()] != undefined){
      // The service is already install.
      let service = data.Services[this.descriptor.getId()]
      console.log("----> ", service)
    }
    
  }

  onlogout() {
    // display values.
    this.btnGroup.element.style.display = "none";
  }
}
