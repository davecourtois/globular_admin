import * as M from "materialize-css";
import "materialize-css/sass/materialize.scss";
import { globular, authenticate } from "./backend";
import { GeneralInfoPanel } from "./generalInfoPanel";
import { SearchServicesPanel } from "./searchServicesPanel";
import { ServicePanel } from "./servicePanel";
import { RolePanel } from "./rolePanel";
import { randomUUID } from "./utility";
import { AccountManager } from "./accountPanel";
import { FileManager } from "./filePanel";
import { ApplicationManager } from "./applicationPanel";
import { LogManager } from "./logPanel";
import { createElement } from './element.js'
import { SqlServicePanel } from "./services/sqlServicePanel";
import { SmtpServicePanel } from "./services/smtpServicePanel";
import { LdapServicePanel } from "./services/ldapServicePanel";
import { PersistenceServicePanel } from "./services/persistenceServicePanel";
import { FileServicePanel } from './services/fileServicePanel';
import { PlcServerConfigPanel } from './services/plcServerConfigPanel';
import { PlcExporterConfigPanel } from "./services/plcExporterConfigPanel";
import { RessourceManager } from "./ressourcePanel";
import { MetricManager } from "./metricPanel";


export class MainPage {
  // The outer most div.
  private container: any;

  private loginLnk: any;
  private logoutLnk: any;
  private searchLnk: any;
  private homeLnk: any;

  private sideLoginLnk: any;
  private sideLogoutLnk: any;
  private sideSearchLnk: any;
  private sideHomeLnk: any;
  private searchInput: any;

  // The general information panel.
  private generalInfoPanel: GeneralInfoPanel;
  private searchServicesPanel: SearchServicesPanel;
  private rolePanel: RolePanel;
  private accountPanel: AccountManager;
  private filePanel: FileManager;
  private ressourcePanel: RessourceManager;
  private applicationPanel: ApplicationManager;
  private logPanel: LogManager;
  private metricPanel: MetricManager;

  constructor() {
    // Here I will create the main container.
    let div = createElement(null, { tag: "div" });
    document.body.appendChild(div.element);

    ////////////////////////////// Navigation //////////////////////////////
    // Now Will create the navbar.
    let navBar = div
      .appendElement({ tag: "div", class: "navbar-fixed" })
      .down()
      .appendElement({ tag: "nav" })
      .down();

    // The mobile nav menu..
    div
      .appendElement({ tag: "ul", class: "sidenav", id: "slide-out" })
      .down()
      .appendElement({ tag: "li", id: "home-side-lnk" })
      .down()
      .appendElement({
        tag: "a",
        href: "javascript:void(0)",
        class: "waves-effect",
        innerHtml: "Home"
      })
      .up()
      .appendElement({
        tag: "li",
        id: "search-side-lnk",
        style: "display: none;"
      })
      .down()
      .appendElement({
        tag: "a",
        href: "javascript:void(0)",
        class: "waves-effect",
        innerHtml: "Search"
      })
      .up()
      .appendElement({ tag: "li", id: "login-side-lnk" })
      .down()
      .appendElement({
        tag: "a",
        href: "javascript:void(0)",
        class: "waves-effect",
        innerHtml: "Login"
      })
      .up()
      .appendElement({
        tag: "li",
        id: "logout-side-lnk",
        style: "display: none;"
      })
      .down()
      .appendElement({
        tag: "a",
        href: "javascript:void(0)",
        class: "waves-effect",
        innerHtml: "Logout"
      })
      .up();

    var elem = document.querySelector(".sidenav");
    var instance = M.Sidenav.init(elem, {
      inDuration: 350,
      outDuration: 350,
      edge: "left"
    });

    ////////////////////////////// Login //////////////////////////////
    //  The large menu...indigo darken-4
    this.loginLnk = navBar
      .appendElement({
        tag: "div",
        class: "nav-wrapper indigo darken-4",
        style: "display: flex;"
      })
      .down()
      //.appendElement({ "tag": "a", "id": "logo_btn", "class": "flow-text", "innerHtml": "Globular" })
      .appendElement({ tag: "ul", class: "left" })
      .down()
      .appendElement({ tag: "li" })
      .down()
      .appendElement({
        tag: "a",
        href: "javascript:void(0)",
        "data-target": "slide-out",
        class: "sidenav-trigger"
      })
      .down()
      .appendElement({
        tag: "i",
        class: "hamburger material-icons hide-on-large-only",
        innerHtml: "menu"
      })
      .up()
      .up()
      .up()
      .appendElement({
        tag: "div",
        style: "flex-grow:1; display: flex; justify-content: flex-end;"
      })
      .down()
      .appendElement({
        tag: "div",
        class: "input-field",
        style: "max-width: 430px;"
      })
      .down()
      .appendElement({
        tag: "input",
        type: "search",
        id: "search_input",
        autocomplete: "off"
      })
      .appendElement({ tag: "label", class: "label-icon", for: "search_input" })
      .down()
      .appendElement({ tag: "i", class: "material-icons", innerHtml: "search" })
      .up()
      .appendElement({ tag: "i", class: "material-icons", innerHtml: "close" })
      .up()
      .up()
      .appendElement({
        tag: "ul",
        id: "nav-mobile",
        class: "right hide-on-med-and-down"
      })
      .down()
      .appendElement({ tag: "li", id: "Home" })
      .down()
      .appendElement({
        tag: "a",
        href: "javascript:void(0)",
        class: "waves-effect waves-light",
        innerHtml: "Home"
      })
      .up()
      .appendElement({ tag: "li", id: "Search", style: "display: none;" })
      .down()
      .appendElement({
        tag: "a",
        href: "javascript:void(0)",
        class: "waves-effect waves-light",
        innerHtml: "Search"
      })
      .up()
      .appendElement({ tag: "li", id: "Logout", style: "display: none;" })
      .down()
      .appendElement({
        tag: "a",
        href: "javascript:void(0)",
        class: "waves-effect waves-light",
        innerHtml: "Logout"
      })
      .up()
      .appendElement({ tag: "li" })
      .down()
      .appendElement({
        tag: "a",
        id: "login",
        href: "javascript:void(0)",
        class: "waves-effect waves-light",
        innerHtml: "Login"
      })
      .down();

    this.logoutLnk = navBar.getChildById("Logout");
    this.searchLnk = navBar.getChildById("Search");
    this.homeLnk = navBar.getChildById("Home");

    this.sideLoginLnk = div.getChildById("login-side-lnk");
    this.sideLogoutLnk = div.getChildById("logout-side-lnk");
    this.sideSearchLnk = div.getChildById("search-side-lnk");
    this.sideHomeLnk = div.getChildById("home-side-lnk");

    ////////////////////////////// General informations //////////////////////////////
    // This will be the workspace...
    this.container = div
      .appendElement({ tag: "div", class: "container" })
      .down();
    this.showSearchServicePanel(); // must be call once to initialyse it
    this.showGeneralInfo();

    // Set the search input action.
    this.searchInput = navBar.getChildById("search_input");
    this.searchInput.element.onkeyup = (evt: any) => {
      if (evt.keyCode == 13) {
        this.showSearchServicePanel();
        let keywords = this.searchInput.element.value.split(" ");
        this.searchInput.element.value = "";
        this.searchServicesPanel.search(keywords);
        this.searchLnk.element.style.display = "";
        this.sideSearchLnk.element.style.display = "";
      }
    };

    ////////////////////////////// connect event //////////////////////////////

    // Show general info.
    this.homeLnk.element.onclick = () => {
      this.showGeneralInfo();
    };

    // Show search results.
    this.searchLnk.element.onclick = () => {
      this.showSearchServicePanel();
    };

    // Show login
    this.loginLnk.element.onclick = () => {
      this.showLogin();
    };

    // Show the login dialog
    this.sideLoginLnk.element.onclick = () => {
      instance.close();
      this.loginLnk.element.click();
    };

    this.sideSearchLnk.element.onclick = () => {
      instance.close();
    };

    this.sideHomeLnk.element.onclick = () => {
      instance.close();
    };

  }

  login(email: string, password: string) {
    authenticate(
      email,
      password,
      (tokenInfo: any) => {
        M.toast({ html: "You are now logged in as Administrator." });
        this.logoutLnk.element.style.display = "";
        this.loginLnk.element.style.display = "none";
        this.sideLogoutLnk.element.style.display = "";
        this.sideLoginLnk.element.style.display = "none";
      },
      (error: any) => {
        M.toast({ html: "login fail!" });
      }
    );
  }

  /**
   * Display the login dialog.
   */
  showLogin() {
    // Create the dialog only if is not already exist.
    if (document.getElementById("login-dialog") != null) {
      document.getElementById("email").focus();
      return;
    }

    // Here I will create the login dialog.
    let loginDialog = createElement(null, {
      tag: "div",
      id: "login-dialog",
      style:
        "position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: rgba(0.0, 0.0, 0.0, 0.5); z-index: 10;"
    });
    loginDialog.element.innerHTML = `<div class="col s12 z-depth-6 card-panel" style="position: absolute; margin:auto; top: 57px; left: 0px; right: 0px; bottom: 0px;">
          <form class="login-form">
            <div class="row">
            </div>
            <div class="row">
              <div class="input-field col s12">
                <i class="material-icons prefix indigo-text text-darken-3">mail_outline</i>
                <input class="validate" id="email" type="email">
                <label for="email" data-error="wrong" data-success="right">Email</label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <i class="material-icons prefix indigo-text text-darken-3">lock_outline</i>
                <input id="password" type="password">
                <label for="password">Password</label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <a id="login-lnk" href="javascript:void(0)" class="btn waves-effect waves-light col s12 indigo darken-3">Login</a>
              </div>
            </div>
          </form>`;

    document.body.appendChild(loginDialog.element);
    document.getElementById("email").focus();

    // TODO implement the login event here.
    this.loginLnk.element.onclick = () => {
      if (document.getElementById("login-dialog") == null) {
        this.showLogin();
      } else {
        this.login(
          (<HTMLInputElement>document.getElementById("email")).value,
          (<HTMLInputElement>document.getElementById("password")).value
        );
        loginDialog.element.parentNode.removeChild(loginDialog.element);
      }
    };

    document.getElementById("email").onkeyup = (evt: any) => {
      if (evt.keyCode == 27) {
        loginDialog.element.parentNode.removeChild(loginDialog.element);
      }
    };

    document.getElementById("password").onkeyup = (evt: any) => {
      if (evt.keyCode == 27) {
        loginDialog.element.parentNode.removeChild(loginDialog.element);
      } else if (evt.keyCode == 13) {
        this.login(
          (<HTMLInputElement>document.getElementById("email")).value,
          (<HTMLInputElement>document.getElementById("password")).value
        );
        loginDialog.element.parentNode.removeChild(loginDialog.element);
      }
    };

    document.getElementById("login-lnk").onclick = (evt: any) => {
      this.login(
        (<HTMLInputElement>document.getElementById("email")).value,
        (<HTMLInputElement>document.getElementById("password")).value
      );
      loginDialog.element.parentNode.removeChild(loginDialog.element);
    };
  }

  showGeneralInfo() {
    this.container.removeAllChilds();

    // Show the tabs...
    this.container
      .appendElement({
        tag: "div",
        class: "row",
        style: "margin-bottom: 0px; margin-top:10px;"
      })
      .down()
      .appendElement({ tag: "div", class: "col s12 /*m10 offset-m1*/" })
      .down()
      .appendElement({ tag: "ul", id: "main_tabs", class: "tabs" })
      .down()
      .appendElement({ tag: "li", class: "tab col s2" })
      .down()
      .appendElement({
        tag: "a",
        id: "main_tabs_tab_0",
        class: "grey-text text-darken-3",
        href: "javascript:void(0)",
        innerHtml: "Services"
      })
      .up()
      .appendElement({ tag: "li", class: "tab col s1" })
      .down()
      .appendElement({
        tag: "a",
        id: "main_tabs_tab_1",
        class: "grey-text text-darken-3",
        href: "javascript:void(0)",
        innerHtml: "Roles"
      })
      .up()
      .appendElement({ tag: "li", class: "tab col s2" })
      .down()
      .appendElement({
        tag: "a",
        id: "main_tabs_tab_2",
        class: "grey-text text-darken-3",
        href: "javascript:void(0)",
        innerHtml: "Accounts"
      })
      .up()
      .appendElement({ tag: "li", class: "tab col s2" })
      .down()
      .appendElement({
        tag: "a",
        id: "main_tabs_tab_3",
        class: "grey-text text-darken-4",
        href: "javascript:void(0)",
        innerHtml: "Applications"
      })
      .up()
      .appendElement({ tag: "li", class: "tab col s1" })
      .down()
      .appendElement({
        tag: "a",
        id: "main_tabs_tab_4",
        class: "grey-text text-darken-4",
        href: "javascript:void(0)",
        innerHtml: "Files"
      })
      .up()
      .appendElement({ tag: "li", class: "tab col s2" })
      .down()
      .appendElement({
        tag: "a",
        id: "main_tabs_tab_5",
        class: "grey-text text-darken-4",
        href: "javascript:void(0)",
        innerHtml: "Ressource"
      })
      .up()
      .appendElement({ tag: "li", class: "tab col s1" })
      .down()
      .appendElement({
        tag: "a",
        id: "main_tabs_tab_6",
        class: "grey-text text-darken-3",
        href: "javascript:void(0)",
        innerHtml: "Logs"
      })
      .up()
      .appendElement({ tag: "li", class: "tab col s1" })
      .down()
      .appendElement({
        tag: "a",
        id: "main_tabs_tab_7",
        class: "grey-text text-darken-3",
        href: "javascript:void(0)",
        innerHtml: "Metrics"
      })

    // Initialyse various panels.
    if (this.generalInfoPanel == null) {
      this.generalInfoPanel = new GeneralInfoPanel(globular.config);
    }

    if (this.rolePanel == null) {
      this.rolePanel = new RolePanel(randomUUID());
    }

    if (this.filePanel == null) {
      this.filePanel = new FileManager(randomUUID());
    }

    if (this.ressourcePanel == null) {
      this.ressourcePanel = new RessourceManager();
    }

    if (this.accountPanel == null) {
      this.accountPanel = new AccountManager(randomUUID());
    }

    if (this.logPanel == null) {
      this.logPanel = new LogManager(randomUUID());
    }

    if (this.applicationPanel == null) {
      this.applicationPanel = new ApplicationManager(randomUUID());
    }

    if (this.metricPanel == null) {
      this.metricPanel = new MetricManager();
    }

    // Set tabs.
    let tab_0_content = this.container.appendElement({ tag: "div" }).down();
    this.generalInfoPanel.setParent(tab_0_content);
    this.showServicesPanel(tab_0_content);

    // The tab content.
    let tab_1_content = this.container
      .appendElement({ tag: "div", style: "display: none" })
      .down();
    this.rolePanel.setParent(tab_1_content);

    let tab_2_content = this.container
      .appendElement({ tag: "div", style: "display: none" })
      .down();
    this.accountPanel.setParent(tab_2_content);

    let tab_3_content = this.container
      .appendElement({ tag: "div", style: "display: none" })
      .down();
    this.applicationPanel.setParent(tab_3_content);

    let tab_4_content = this.container
      .appendElement({ tag: "div", style: "display: none" })
      .down();
    this.filePanel.setParent(tab_4_content);

    let tab_5_content = this.container
      .appendElement({ tag: "div", style: "display: none" })
      .down();
    this.ressourcePanel.setParent(tab_5_content);

    let tab_6_content = this.container
      .appendElement({ tag: "div", style: "display: none" })
      .down();
    this.logPanel.setParent(tab_6_content);

    let tab_7_content = this.container
      .appendElement({ tag: "div", style: "display: none" })
      .down();
    this.metricPanel.setParent(tab_7_content);

    // Init the materialyse tabs.
    M.Tabs.init(document.getElementById("main_tabs"));

    // hide and show tab content.
    this.container.getChildById("main_tabs_tab_0").element.onclick = () => {
      tab_0_content.element.style.display = "";
      tab_1_content.element.style.display = "none";
      tab_2_content.element.style.display = "none";
      tab_3_content.element.style.display = "none";
      tab_4_content.element.style.display = "none";
      tab_5_content.element.style.display = "none";
      tab_6_content.element.style.display = "none";
      tab_7_content.element.style.display = "none";
    };

    this.container.getChildById("main_tabs_tab_1").element.onclick = () => {
      tab_0_content.element.style.display = "none";
      tab_1_content.element.style.display = "";
      tab_2_content.element.style.display = "none";
      tab_3_content.element.style.display = "none";
      tab_4_content.element.style.display = "none";
      tab_5_content.element.style.display = "none";
      tab_6_content.element.style.display = "none";
      tab_7_content.element.style.display = "none";
    };

    this.container.getChildById("main_tabs_tab_2").element.onclick = () => {
      tab_0_content.element.style.display = "none";
      tab_1_content.element.style.display = "none";
      tab_2_content.element.style.display = "";
      tab_3_content.element.style.display = "none";
      tab_4_content.element.style.display = "none";
      tab_5_content.element.style.display = "none";
      tab_6_content.element.style.display = "none";
      tab_7_content.element.style.display = "none";
    };

    this.container.getChildById("main_tabs_tab_3").element.onclick = () => {
      tab_0_content.element.style.display = "none";
      tab_1_content.element.style.display = "none";
      tab_2_content.element.style.display = "none";
      tab_3_content.element.style.display = "";
      tab_4_content.element.style.display = "none";
      tab_5_content.element.style.display = "none";
      tab_6_content.element.style.display = "none";
      tab_7_content.element.style.display = "none";
    };

    this.container.getChildById("main_tabs_tab_4").element.onclick = () => {
      tab_0_content.element.style.display = "none";
      tab_1_content.element.style.display = "none";
      tab_2_content.element.style.display = "none";
      tab_3_content.element.style.display = "none";
      tab_4_content.element.style.display = "";
      tab_5_content.element.style.display = "none";
      tab_6_content.element.style.display = "none";
      tab_7_content.element.style.display = "none";
    };

    this.container.getChildById("main_tabs_tab_5").element.onclick = () => {
      tab_0_content.element.style.display = "none";
      tab_1_content.element.style.display = "none";
      tab_2_content.element.style.display = "none";
      tab_3_content.element.style.display = "none";
      tab_4_content.element.style.display = "none";
      tab_5_content.element.style.display = "";
      tab_6_content.element.style.display = "none";
      tab_7_content.element.style.display = "none";
    };

    this.container.getChildById("main_tabs_tab_6").element.onclick = () => {
      tab_0_content.element.style.display = "none";
      tab_1_content.element.style.display = "none";
      tab_2_content.element.style.display = "none";
      tab_3_content.element.style.display = "none";
      tab_4_content.element.style.display = "none";
      tab_5_content.element.style.display = "none";
      tab_6_content.element.style.display = "";
      tab_7_content.element.style.display = "none";
    };

    this.container.getChildById("main_tabs_tab_7").element.onclick = () => {
      tab_0_content.element.style.display = "none";
      tab_1_content.element.style.display = "none";
      tab_2_content.element.style.display = "none";
      tab_3_content.element.style.display = "none";
      tab_4_content.element.style.display = "none";
      tab_5_content.element.style.display = "none";
      tab_6_content.element.style.display = "none";
      tab_7_content.element.style.display = "";
    };
    
    M.Tabs.init(document.getElementById("logs_tabs"));
  }

  showServicesPanel(container: any) {
    // The tab div...
    let div = container
      .appendElement({
        tag: "div",
        class: "row",
        style: "margin-bottom: 0px; margin-top:10px; margin-left: 10px; margin-right: 10px;"
      })
      .down()
      .appendElement({ id: "service_tabs", tag: "div", class: "col s12 /*m10 offset-m1*/" })
      .down()
      .appendElement({ tag: "ul", id: "services_list", class: "collapsible" })
      .down();

    for (var key in globular.config.Services) {
      if (globular.config.Services[key].PublisherId != null) {
        let title = key.replace("_", " ");
        let servicePanel: ServicePanel;

        // Here I will instantiate the correct service configuration interface.
        if (globular.config.Services[key].Name == "sql_server") {
          servicePanel = new SqlServicePanel(
            globular.config.Services[key],
            title,
            key
          );
        } else if (globular.config.Services[key].Name == "smtp_server") {
          servicePanel = new SmtpServicePanel(
            globular.config.Services[key],
            title,
            key
          );
        } else if (globular.config.Services[key].Name == "ldap_server") {
          servicePanel = new LdapServicePanel(
            globular.config.Services[key],
            title,
            key
          );
        } else if (globular.config.Services[key].Name == "persistence_server") {
          servicePanel = new PersistenceServicePanel(
            globular.config.Services[key],
            title,
            key
          );
        } else if (globular.config.Services[key].Name == "file_server") {
          servicePanel = new FileServicePanel(
            globular.config.Services[key],
            title,
            key
          );
        } else if (globular.config.Services[key].Name.startsWith("plc_server_")) {
          servicePanel = new PlcServerConfigPanel(
            globular.config.Services[key],
            title,
            key
          );
        } else if (globular.config.Services[key].Name.startsWith("plc_exporter")) {
          servicePanel = new PlcExporterConfigPanel(
            globular.config.Services[key],
            title,
            key
          );
        } else {
          servicePanel = new ServicePanel(
            globular.config.Services[key],
            title,
            key
          );
        }


        // Here I will create the tab...
        let panel = div
          .appendElement({ tag: "li" })
          .down()
          .appendElement({
            tag: "div",
            class: "collapsible-header",
            style: "display: flex; align-items: center;"
          })
          .down()
          .appendElement({ tag: "span", class: "col s6", innerHtml: title })
          .appendElement({
            tag: "span",
            id: key + "_state",
            class: "col s6 right-align",
            innerHtml: globular.config.Services[key].State
          })
          .appendElement(servicePanel.actionBtnGroup)
          .up()
          .appendElement({ tag: "div", class: "collapsible-body" })
          .down();

        panel.appendElement(servicePanel.content);
        panel.appendElement(servicePanel.btnGroup);
        servicePanel.btnGroup.element.style.display = "none";
        servicePanel.stateDiv = div.getChildById(key + "_state");
      }
    }
    // initialyse the tab component.
    M.Collapsible.init(document.getElementById("services_list"));
  }

  showSearchServicePanel() {
    this.container.removeAllChilds();
    // set the general info panel if it not exist.
    if (this.searchServicesPanel == null) {
      this.searchServicesPanel = new SearchServicesPanel();
    }
    this.searchServicesPanel.setParent(this.container);
  }
}
