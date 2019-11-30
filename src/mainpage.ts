
import * as M from "materialize-css";
import { createElement } from "./element"
import { globular, authenticate } from "./backend";
import { GeneralInfoPanel } from "./generalInfoPanel";

export class MainPage {
  // The outer most div.
  private container: any;
  private loginLnk: any;
  private logoutLnk: any;

  // The general information panel.
  private generalInfoPanel: GeneralInfoPanel;

  constructor() {
    // Here I will create the main container.
    let div = createElement(null, { "tag": "div" })
    document.body.append(div.element)


    ////////////////////////////// Navigation //////////////////////////////
    // Now Will create the navbar.
    let navBar = div.appendElement({ "tag": "div", "class": "navbar-fixed" }).down()
      .appendElement({ "tag": "nav" }).down()

    // The mobile nav menu..
    div.appendElement({ "tag": "ul", "class": "sidenav", "id": "slide-out" }).down()
      .appendElement({ "tag": "li" }).down()
      .appendElement({ "tag": "a", "id": "home-side-lnk", "href": "javascript:void(0)", "class": "waves-effect", "innerHtml": "Home" }).up()
      .appendElement({ "tag": "li" }).down()
      .appendElement({ "tag": "a", "id": "login-side-lnk", "href": "javascript:void(0)", "class": "waves-effect", "innerHtml": "Login" }).up()
      .appendElement({ "tag": "li", "style":"display: none;" }).down()
      .appendElement({ "tag": "a", "id": "login-side-lnk", "href": "javascript:void(0)", "class": "waves-effect", "innerHtml": "Logout" }).up()

    var elem = document.querySelector('.sidenav');
    var instance = M.Sidenav.init(elem, {
      inDuration: 350,
      outDuration: 350,
      edge: 'left'
    });

    ////////////////////////////// Login //////////////////////////////
    //  The large menu...
    this.loginLnk = navBar.appendElement({ "tag": "div", "class": "nav-wrapper teal" }).down()
      .appendElement({ "tag": "a", "id": "logo_btn", "class": "brand-logo flow-text", "innerHtml": "Globular" })
      .appendElement({ "tag": "a", "href": "javascript:void(0)", "data-target": "slide-out", "class": "sidenav-trigger hide-on-large-only" }).down()
      .appendElement({ "tag": "i", "class": "material-icons", "innerHtml": "menu" }).up()
      .appendElement({ "tag": "ul", "id": "nav-mobile", "class": "right hide-on-med-and-down" }).down()
      .appendElement({ "tag": "li"}).down().appendElement({ "tag": "a", "id": "home", "href": "javascript:void(0)", "class": "waves-effect waves-light", "innerHtml": "Home" }).up()
      .appendElement({ "tag": "li", "style":"display: none;" }).down().appendElement({ "tag": "a", "id": "Logout", "href": "javascript:void(0)", "class": "waves-effect waves-light", "innerHtml": "Logout" }).up()
      .appendElement({ "tag": "li" }).down().appendElement({ "tag": "a", "id": "login", "href": "javascript:void(0)", "class": "waves-effect waves-light", "innerHtml": "Login" }).down()

    this.logoutLnk = navBar.getChildById("Logout")

    ////////////////////////////// General informations //////////////////////////////
    // This will be the workspace...
    this.container = div.appendElement({ "tag": "div", "class": "container" }).down()
    this.showGeneralInfo()


    ////////////////////////////// connect event //////////////////////////////

    // Show general info.
    document.getElementById("home").onclick = () => {
     this.showGeneralInfo()
    }

    // Show login 
    this.loginLnk.element.onclick = () => {
      this.showLogin()
    }

    // Show the login dialog
    document.getElementById("login-side-lnk").onclick = () => {
      instance.close()
      this.loginLnk.element.click()
    }

    // Go back to home.
    document.getElementById("home-side-lnk").onclick = () => {
      instance.close()

    }

    console.log(globular)
  }

  login(email: string, password: string){
    authenticate(email, password,
    (tokenInfo: any) => {
      M.toast({html: 'You are now logged in as Administrator.'})
      this.logoutLnk.element.parentNode.style.display = ""
      this.loginLnk.element.parentNode.style.display = "none"
    },
    (error: any) => {
      console.log("----> login fail!", error)
      M.toast({html: 'login fail!'})
    })
  }

  /**
   * Display the login dialog.
   */
  showLogin() {
    // Create the dialog only if is not already exist.
    if (document.getElementById("login-dialog") != null) {
      document.getElementById("email").focus()
      return
    }

    // Here I will create the login dialog.
    let loginDialog = createElement(null, { "tag": "div", "id": "login-dialog", "style": "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: rgba(0.0, 0.0, 0.0, 0.5); z-index: 10;" })
    loginDialog.element.innerHTML = `<div class="col s12 z-depth-6 card-panel" style="position: absolute; margin:auto; top: 57px; left: 0px; right: 0px; bottom: 0px;">
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
                <a id="login-lnk" href="#" class="btn waves-effect waves-light col s12">Login</a>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s6 m6 l6">
                <p class="margin medium-small"><a href="#">Register Account</a></p>
              </div>
              <div class="input-field col s6 m6 l6">
                  <p class="margin right-align medium-small"><a href="#">Forgot password?</a></p>
              </div>          
            </div>
          </form>`

    document.body.append(loginDialog.element)
    document.getElementById("email").focus()

    // TODO implement the login event here.
    document.getElementById("login-lnk").onclick = () => {
      this.login((<HTMLInputElement>document.getElementById("email")).value, (<HTMLInputElement>document.getElementById("password")).value)
      loginDialog.element.parentNode.removeChild(loginDialog.element)
    }

    document.getElementById("email").onkeyup = (evt: any) => {
      if (evt.keyCode == 27) {
        loginDialog.element.parentNode.removeChild(loginDialog.element)
      }
    }

    document.getElementById("password").onkeyup = (evt: any) => {
      if (evt.keyCode == 27) {
        loginDialog.element.parentNode.removeChild(loginDialog.element)
      } else if (evt.keyCode == 13) {
        this.login((<HTMLInputElement>document.getElementById("email")).value, (<HTMLInputElement>document.getElementById("password")).value)
        loginDialog.element.parentNode.removeChild(loginDialog.element)
      }
    }
  }
  
  showGeneralInfo(){
    this.container.removeAllChilds()
    // set the general info panel if it not exist.
    if(this.generalInfoPanel == null){
      this.generalInfoPanel = new GeneralInfoPanel(globular.config)
    }
    this.generalInfoPanel.setParent(this.container)
  }
}