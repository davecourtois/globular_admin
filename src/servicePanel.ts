import { ConfigurationPanel } from "./configurationPanel";
import { IServiceConfig, IConfig } from "globular-web-client";
import { randomUUID } from "./utility";
import { createElement } from "./element";
import {
  stopService,
  eventHub,
  startService,
  saveService,
  readFullConfig,
  getErrorMessage
} from "./backend";

/**
 * That class is use to display service configuration.
 */
export class ServicePanel extends ConfigurationPanel {
  private uninstallBtn: any;
  private stopBtn: any;
  private startBtn: any;
  public actionBtnGroup: any;

  // configuration lines.
  private domainConfig: any;
  private publisherConfig: any;
  private versionConfig: any;
  private keepUpdataConfig: any;
  private keepAliveConfig: any;
  private portConfig: any;
  private proxyConfig: any;
  private tlsConfig: any;
  public stateDiv: any;

  constructor(service: IServiceConfig, id: string, name: string) {
    super(service, name, randomUUID());

    // So Here I will display common service function...

    // Set the domain propertie.
    this.domainConfig = this.appendTextualConfig("Domain");

    // Set the id of the publisher
    this.publisherConfig = this.appendTextualConfig("PublisherId", "Publisher");

    // The version of the service...
    this.versionConfig = this.appendTextualConfig("Version");

    // TLS todo create boolean configuration values...
    this.keepUpdataConfig = this.appendBooleanConfig(
      "KeepUpToDate",
      ["True", "False"],
      "Keep up to date"
    );

    // Restart the service if it stop...
    this.keepAliveConfig = this.appendBooleanConfig(
      "KeepAlive",
      ["True", "False"],
      "Keep alive"
    );

    // The port
    this.portConfig = this.appendTextualConfig(
      "Port",
      "Port",
      "number",
      1,
      0,
      65535
    );

    // The proxy
    this.proxyConfig = this.appendTextualConfig(
      "Proxy",
      "Proxy",
      "number",
      1,
      0,
      65535
    );

    // TLS todo create boolean configuration values...
    this.tlsConfig = this.appendBooleanConfig(
      "TLS",
      ["True", "False"],
      "Use TLS"
    );

    // Here I will append specific button
    this.actionBtnGroup = createElement(null, {
      tag: "div",
      class: "col s6 right-align",
      style: "display: none;"
    });

    this.actionBtnGroup
      .appendElement({
        tag: "a",
        id: "uninstall_btn",
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn-flat",
        innerHtml: "Uninstall",
        style: "margin-right: 2px;"
      })
      .appendElement({
        tag: "a",
        id: "stop_btn",
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn-flat",
        innerHtml: "Stop",
        style: "margin-right: 2px;"
      })
      .appendElement({
        tag: "a",
        id: "start_btn",
        href: "javascript:void(0)",
        class: "waves-effect waves-light btn-flat",
        innerHtml: "Start",
        style: "margin-right: 2px; display: none;"
      });

    this.uninstallBtn = this.actionBtnGroup.getChildById("uninstall_btn");
    this.stopBtn = this.actionBtnGroup.getChildById("stop_btn");
    this.startBtn = this.actionBtnGroup.getChildById("start_btn");

    // display the start button and hide stop if the service is not running.
    if (service.State != "running") {
      this.stopBtn.element.style.display = "none";
      this.startBtn.element.style.display = "";
    }

    // Actions..
    this.uninstallBtn.element.onclick = (evt: any) => {
      evt.stopPropagation();
    };

    this.stopBtn.element.onclick = (evt: any) => {
      evt.stopPropagation();
      stopService(id, () => {
        // Here I will set the start button...
        console.log("stop_service_event_" + id);
        eventHub.publish("stop_service_event_" + id, id, false);
      },
      (err: any) => {
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      });
    };

    /**
     * That event will be call when a service will be stopped.
     */
    eventHub.subscribe(
      "stop_service_event_" + id,
      (uuid: string) => {
        /** Subscriber id. todo diconnect on logout...*/
        //console.log("stop_service_event_" + id, uuid);
      },
      (evt: any) => {
        this.stopBtn.element.style.display = "none";
        this.startBtn.element.style.display = "";
        this.keepAliveConfig.set(); // set the value...
        this.stateDiv.element.innerHTML = "stopped";
      },
      false
    );

    this.startBtn.element.onclick = (evt: any) => {
      evt.stopPropagation();
      startService(id, () => {
        // Here I will set the start button...
        eventHub.publish("start_service_event_" + id, id, false);
      },
      (err: any) => {
              
        M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
      });
    };

    eventHub.subscribe(
      "start_service_event_" + id,
      (uuid: string) => {
        //console.log("start_service_event_" + id, uuid);
      },
      (evt: any) => {
        this.stopBtn.element.style.display = "";
        this.startBtn.element.style.display = "none";
        this.stateDiv.element.innerHTML = "running";
      },
      false
    );

    // Here I will update the configuration on save event.
    eventHub.subscribe(
      "save_service_config_event_" + id,
      (uuid: string) => {
        //console.log("save_service_config_event_" + id, uuid);
      },
      (configStr: string) => {
        this.config = JSON.parse(configStr);
        this.keepAliveConfig.reset();
        this.domainConfig.reset();
        this.publisherConfig.reset();
        this.versionConfig.reset();
        this.keepUpdataConfig.reset();
        this.keepAliveConfig.reset();
        this.portConfig.reset();
        this.proxyConfig.reset();
        this.tlsConfig.reset();
        this.stateDiv.element.innerHTML = this.config.State;
      },
      false
    );
  }

  onlogin(data: any) {
    super.onlogin(data);
    this.actionBtnGroup.element.style.display = "";
    this.stateDiv.element.style.display = "none";

    readFullConfig((config: IConfig) => {
      // Set the service configuration.
      this.config = config.Services[this.config.Id];
    },
    (err: any) => {
      M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
    });
  }

  onlogout() {
    super.onlogout();
    this.actionBtnGroup.element.style.display = "none";
    this.stateDiv.element.style.display = "";
  }

  save() {
    super.save();

    // Now I will save the configuration.
    console.log("save service!");
    saveService(this.config, (service: any) => {
      // So here I will publish an event to update configuration.
      eventHub.publish(
        "save_service_config_event_" + service.Id,
        JSON.stringify(service),
        false
      );
    },(err: any) => {
              
      M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
    });
  }
}
