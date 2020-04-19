import { Panel } from "./panel";
import { findServices, installService, getErrorMessage, eventHub, uninstallService, refreshToken, globular } from "./backend";
import { ServiceDescriptor } from "globular-web-client/lib/services/services_pb";
import { randomUUID } from "./utility";

/**
 * Search panel is use to retreive services on registerd discoveries.
 */
export class SearchServicesPanel extends Panel {
  private resultsPanel: any;
  private isAdmin: boolean;

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
          descriptorPanel.onlogin(globular.config);
        }
      }
    });
  }

  onlogin(data: any) {
    this.isAdmin = true;
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
  private uninstallBtn: any;
  private updateBtn: any;
  private btnGroup: any;
  private idInput: any;
  private idDiv: any;

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

    let install_btn_id = randomUUID()
    let id_input = randomUUID()
    let id_div = randomUUID()
    let uninstall_btn_id = randomUUID()
    let update_btn_id = randomUUID()

    // In case the service is uninstall...
    eventHub.subscribe(
      "uninstall_service_event",
      (uuid: string) => {
        //console.log("start_service_event_" + id, uuid);
      },
      (evt: any) => {
        this.setButtons()
      },
      true
    );

    eventHub.subscribe(
      "install_service_event",
      (uuid: string) => {
        //console.log("start_service_event_" + id, uuid);
      },
      (evt: any) => {
        this.setButtons()
      },
      true
    );

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
      .appendElement({ tag: "div", id: id_div, class: "input-field col s4 offset-s6" })
      .down()
      .appendElement({
        tag: "input",
        id: id_input,
        placeholder: "service id",
        title: "the is of the service on the server.",
        type: "text"
      })
      .appendElement({ tag: "label", for: id_input, innerHtml: "service id" })
      .up()
      .appendElement({
        tag: "a",
        id: install_btn_id,
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn col s2",
        innerHtml: "Install"
      })
      .appendElement({
        tag: "a",
        id: update_btn_id,
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn col s2",
        style: "display: none;",
        innerHtml: "Update"
      })
      .appendElement({
        tag: "a",
        id: uninstall_btn_id,
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn col s2",
        style: "display: none;",
        innerHtml: "Uninstall"
      })


    this.installBtn = this.div.getChildById(install_btn_id);
    this.uninstallBtn = this.div.getChildById(uninstall_btn_id);
    this.updateBtn = this.div.getChildById(update_btn_id);
    this.content = this.div.getChildById("content");
    this.btnGroup = this.div.getChildById("btn_group");
    this.idInput = this.div.getChildById(id_input);
    this.idDiv = this.div.getChildById(id_div);

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
    this.installBtn.element.onclick = () => {
      installService(
        descriptor.getDiscoveriesList()[0],
        descriptor.getId(),
        descriptor.getPublisherid(),
        descriptor.getVersion(),
        () => {
          // here I will refresh the token and set the full config...
          refreshToken(
            () => {
              eventHub.publish("install_service_event", descriptor.getId(), true)
              M.toast({ html: "Service " + descriptor.getId() + " installed successfully!", displayLength: 3000 });
              // refresh the panel again to set the new service to admin mode.
              eventHub.publish("onlogin", globular.config, true)
            },
            (err: any) => {
              M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
            })
        },
        (err: any) => {
          M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
        }
      );
    }

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
            refreshToken(
              () => {
                eventHub.publish("install_service_event", descriptor.getId(), true)
                M.toast({ html: "Service " + descriptor.getId() + " installed successfully!", displayLength: 3000 });
                // refresh the panel again to set the new service to admin mode.
                eventHub.publish("onlogin", globular.config, true)
              },
              (err: any) => {
                M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
              })

          },
          (err: any) => {
            M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
          }
        );
      }
    };
  }

  setButtons() {
    // Display textual input
    this.btnGroup.element.style.display = "flex";

    // look better without it... uncomment if necessary.
    M.updateTextFields();
    this.idInput.element.value = this.descriptor.getId();

    if (globular.config.Services[this.descriptor.getId()] != undefined) {


      // The service is already install.
      let service = globular.config.Services[this.descriptor.getId()];
      this.uninstallBtn.element.style.display = "block";

      if (this.descriptor.getVersion() != service.Version) {
        this.updateBtn.element.style.display = "block";
      }

      this.installBtn.element.style.display = "none";
      this.idDiv.element.style.display = "none";

      this.uninstallBtn.element.onclick = (evt: any) => {
        evt.stopPropagation();
        uninstallService(service, () => {
          delete globular.config.Services[this.descriptor.getId()]
          eventHub.publish("uninstall_service_event", this.descriptor.getId(), true)
          M.toast({ html: "Service " + this.descriptor.getId() + " was uninstalled successfully!", displayLength: 3000 });
       
        },
          (err: any) => {

            M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
          });

      };
    }else{
      this.installBtn.element.style.display = "";
      this.idDiv.element.style.display = "";
      this.uninstallBtn.element.style.display = "none";
      this.updateBtn.element.style.display = "none";
    }
  }

  onlogin(data: any) {
    // keep a pointer to the full configuration.
    this.setButtons()
  }

  onlogout() {
    // display values.
    this.btnGroup.element.style.display = "none";
  }
}
