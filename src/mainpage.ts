
import * as M from "materialize-css";
import { createElement } from "./element"
import { globular } from "./backend";

export class MainPage {
    // The outer most div.
    private container: any;

    private navBar: any;

    constructor() {
        // Here I will create the main container.
        this.container = createElement(null, { "tag": "div"})
        document.body.append(this.container.element)

        // Now Will create the navbar.
        this.navBar = this.container.appendElement({"tag":"div", "class":"navbar-fixed"}).down()
          .appendElement({ "tag": "nav" }).down()

        // The rest of elements...
        let loginLnk = this.navBar.appendElement({ "tag": "div", "class": "nav-wrapper teal" }).down()
            .appendElement({ "tag": "a", "id": "logo_btn", "class": "brand-logo left", "style": "padding-left: 10px;", "innerHtml": "Globular" })
            .appendElement({ "tag": "ul", "id": "nav-mobile", "class": "right hide-on-med-and-down" }).down()
            .appendElement({ "tag": "li" }).down().appendElement({ "tag": "a", "id": "home", "class": "waves-effect waves-light", "innerHtml": "Home" }).up()
            .appendElement({ "tag": "li" }).down().appendElement({ "tag": "a", "id": "login", "class": "waves-effect waves-light", "innerHtml": "Login" }).down()

        loginLnk.element.onclick = () => {
            // Here I will create the login dialog.
            let loginDialog = createElement(null, { "tag": "div", "style": "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: rgba(0.0, 0.0, 0.0, 0.3); z-index: 10;" })
            loginDialog.element.innerHTML = `<div class="col s12 z-depth-6 card-panel" style="position: absolute; margin:auto; top: 0px; left: 0px; right: 0px; bottom: 0px; width: 341px; height: 362px;">
              <form class="login-form">
                <div class="row">
                </div>
                <div class="row">
                  <div class="input-field col s12">
                    <i class="material-icons prefix">mail_outline</i>
                    <input class="validate" id="email" type="email">
                    <label for="email" data-error="wrong" data-success="right">Email</label>
                  </div>
                </div>
                <div class="row">
                  <div class="input-field col s12">
                    <i class="material-icons prefix">lock_outline</i>
                    <input id="password" type="password">
                    <label for="password">Password</label>
                  </div>
                </div>
                <div class="row">
                  <div class="input-field col s12">
                    <a id="login-lnk" href="#" class="btn teal waves-effect waves-light col s12">Login</a>
                  </div>
                </div>
              </form>
            </div>`
            document.body.append(loginDialog.element)
            document.getElementById("email").focus()

            // TODO implement the login event here.
            document.getElementById("login-lnk").onclick = () => {
                loginDialog.element.parentNode.removeChild(loginDialog.element) 
            }
        }

        // Here I will display the general configuration info.
        let configPanel = this.container.appendElement({"tag":"div", "class": "container" }).down()
        .appendElement({ "tag": "ul", "id": "config_info_panel", "class": "collapsible" }).down()
        configPanel.appendElement({ "tag": "li" }).down()
            .appendElement({ "tag": "div", "class": "collapsible-header" }).down()
            .appendElement({ "tag": "i", "class": "material-icons", "innerHtml": "filter_drama" })
            .appendElement({ "tag": "spac", "innerHtml": "Generals Informations" }).up()
            .appendElement({ "tag": "div", "class": "collapsible-body" }).down()
            // The name
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "Name" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.Name }).up()
            // The domain
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "Domain" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.Domain }).up()
            // The admin email.
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "Admin Email" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.AdminEmail }).up()
            // The current protocol.
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "Protocol" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.Protocol }).up()


        // Port Information
        configPanel.appendElement({ "tag": "li" }).down()
            .appendElement({ "tag": "div", "class": "collapsible-header" }).down()
            .appendElement({ "tag": "i", "class": "material-icons", "innerHtml": "filter_drama" })
            .appendElement({ "tag": "spac", "innerHtml": "Server Ports" }).up()
            .appendElement({ "tag": "div", "class": "collapsible-body" }).down()
            // Ports.
            // Http
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "http port" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.PortHttp.toString() }).up()
            // Https
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "https port" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.PortHttps.toString() }).up()
            // Now the admin port/proxy...
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12", "innerHtml": "Admin" }).down()
            .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "port" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.AdminPort.toString() }).up()
            .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "proxy" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.AdminProxy.toString() }).up().up().up()
            // The Ressource port/proxy
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12", "innerHtml": "Ressource" }).down()
            .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "port" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.RessourcePort.toString() }).up()
            .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "proxy" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.RessourceProxy.toString() }).up().up().up()
            // The Services Discovery port/proxy
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12", "innerHtml": "Services Discovery" }).down()
            .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "port" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.ServicesDiscoveryPort.toString() }).up()
            .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "proxy" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.ServicesDiscoveryProxy.toString() }).up().up().up()
            // The Services Repository port/proxy
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12", "innerHtml": "Services Repository" }).down()
            .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "port" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.ServicesRepositoryPort.toString() }).up()
            .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "proxy" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.ServicesRepositoryProxy.toString() }).up().up().up()
            // The certificate authority
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12", "innerHtml": "Certificates Authority" }).down()
            .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "port" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.CertificateAuthorityPort.toString() }).up()
            .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "proxy" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.CertificateAuthorityProxy.toString() }).up().up().up()

        configPanel.appendElement({ "tag": "li" }).down()
            .appendElement({ "tag": "div", "class": "collapsible-header" }).down()
            .appendElement({ "tag": "i", "class": "material-icons", "innerHtml": "filter_drama" })
            .appendElement({ "tag": "spac", "innerHtml": "Security" }).up()
            .appendElement({ "tag": "div", "class": "collapsible-body" }).down()
            // CertStableURL
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "Certificate Stable URL" })
            .appendElement({ "tag": "a", "href": globular.config.CertStableURL, "class": "col s12 m6", "innerHtml": "CertStableURL" }).up()
            // CertStableURL
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "Certificate URL" })
            .appendElement({ "tag": "a", "href": globular.config.CertURL, "class": "col s12 m6", "innerHtml": "CertURL" }).up()
            // TLS certificate delay
            .appendElement({ "tag": "div", "class": "row" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "TLS certificate expiration delay" })
            .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": globular.config.CertExpirationDelay.toString() + " (days)" }).up()

        let servicesConfig = configPanel.appendElement({ "tag": "li" }).down()
            .appendElement({ "tag": "div", "class": "collapsible-header" }).down()
            .appendElement({ "tag": "i", "class": "material-icons", "innerHtml": "filter_drama" })
            .appendElement({ "tag": "spac", "innerHtml": "Services" }).up()
            .appendElement({ "tag": "div", "class": "collapsible-body" }).down()

        for (var id in globular.config.Services) {

            let config = globular.config.Services[id]
            if (config.Version != null) {
                let hasTls = "false"
                if (config.TLS) {
                    hasTls = "true"
                }
                let keepUpToDate = "false"
                if (config.TLS) {
                    keepUpToDate = "true"
                }

                servicesConfig.appendElement({ "tag": "div", "class": "row" }).down()
                    .appendElement({ "tag": "div", "class": "col s12" }).down()
                    .appendElement({ "tag": "span", "innerHtml": id.replace("_", " "), "style": "font-weight: bold;" })
                    // The publisher
                    .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "Publisher" })
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": config.PublisherId }).up()
                    // The domain
                    .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "Domain" })
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": config.Domain }).up()
                    // The version
                    .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "Version" })
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": config.Version }).up()
                    // the service is secure.
                    .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "Has TLS" })
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": hasTls }).up()
                    // True if the service must be kept up to date.
                    .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": "Keep service up to date." })
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": keepUpToDate }).up()
                    // The port
                    .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
                    .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "port" })
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": config.Port.toString() }).up()
                    // The proxy
                    .appendElement({ "tag": "div", "class": "row", "style": "margin: 2px;" }).down()
                    .appendElement({ "tag": "div", "class": "col s12 m6", "style": "padding-left 20px;", "innerHtml": "proxy" })
                    .appendElement({ "tag": "div", "class": "col s12 m6", "innerHtml": config.Proxy.toString() })
            }
        }


        // init the collapse panel.
        M.Collapsible.init(document.getElementById("config_info_panel"))


        console.log(globular)
    }
}