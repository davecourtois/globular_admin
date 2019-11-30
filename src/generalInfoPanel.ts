import { IConfig } from "globular-web-client";
import { ConfigurationPanel } from "./configurationPanel";

/**
 * That class will contain the general server information.
 */
export class GeneralInfoPanel extends ConfigurationPanel {
  constructor(config: IConfig) {
    // Init the configuration panel informations.
    super(config, "General Server Informations", "general_info_panel");

    // Set the name propertie.
    this.appendTextualConfig("Name");

    // Set the domain propertie.
    this.appendTextualConfig("Domain");

    // Set the general server informations.
    this.appendMultipleOptionsSingleChoiceConfig("Protocol", ["http", "https"]);

    // Set the Ports..
    this.appendTextualConfig("PortHttp", "Http port", "number", 1, 0, 65535);

    // Set the Ports..
    this.appendTextualConfig("PortHttps", "Https port", "number", 1, 0, 65535);

    // Display list of domains
    this.appendStringListConfig("Discoveries")

    // Display the list nameserver.
    this.appendStringListConfig("Discoveries")
  }
}
