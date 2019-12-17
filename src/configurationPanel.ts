import { Panel } from './panel';
import { saveConfig, readFullConfig, appendUserData } from './backend';

/**
 * That represent a single configuration information ex.
 * Domain -> globular3.globular.app
 */
class ConfigurationLine {
    // The panel inside where the line is display
    protected panel: ConfigurationPanel;

    // Must the name in the IConfig.
    private name: string;

    // The div that contain the line.
    protected content: any;

    // The div that display non-editable values.
    protected valueDiv: any;

    // The div that play editable values.
    protected valueEditor: any;

    constructor(panel: ConfigurationPanel, name: string, label: string, content: any) {
        this.name = name;
        this.content = content;
        this.panel = panel;

        // Name will be use if no label was given.
        if (label == undefined) {
            label = this.name
        }

        // Now I will create the part label of the interface.
        this.content = content.appendElement({ "tag": "div", "class": "row" }).down()
        this.content.appendElement({ "tag": "div", "class": "col s12 m6", "style": "height: 100%", "innerHtml": label })
    }

    // Return the configuration values.
    protected getValue(): any {
        return this.panel.config[this.name]
    }

    // Set the configuration values.
    protected setValue(v: any) {
        this.panel.config[this.name] = v
    }

    /**
     * Set the value of the configuration with the value contain in the editor.
     */
    public set() {
        this.setValue(this.valueEditor.getValue())
        this.valueDiv.setValue(this.valueEditor.getValue())
    }

    /**
     * Reset the value of the configuration with it initial value.
     */
    public reset() {
        this.valueEditor.setValue(this.getValue())
        this.valueDiv.setValue(this.getValue())
    }

    /**
     * Non editable mode
     */
    lock() {
        this.valueEditor.element.style.display = "none"
        this.valueDiv.element.style.display = ""
    }

    /**
     * Editable mode.
     */
    unlock() {
        this.valueEditor.element.style.display = ""
        this.valueDiv.element.style.display = "none"
    }
}

class ConfigurationTextLine extends ConfigurationLine {

    constructor(panel: ConfigurationPanel, name: string, label: string, content: any, type?: string, step?: number, min?: number, max?: number) {
        super(panel, name, label, content);
        let value = this.getValue()

        // Type can be any type that input box can support.
        if (type == undefined) {
            type = "text"
        }

        // Set the value div.
        this.valueDiv = this.content.appendElement({ "tag": "div", "id": name + "_div", "class": "col s12 m6", "innerHtml": value.toString() }).down()

        // Set the value editor.
        this.valueEditor = this.content.appendElement({ "tag": "input", "id": name + "_input", "style": "display: none;", "class": "col s12 m6", "type": type, "value": value }).down()

        this.valueEditor.element.onchange = () => {
            // set the value in the interface.
            this.valueDiv.setValue(this.valueEditor.getValue())
            this.panel.hasChange()
        }

        // Return the value of the input.
        this.valueEditor.getValue = function () {
            if (type == "number") {
                return parseFloat(this.element.value)
            }
            return this.element.value
        }

        // Return the value of the input.
        this.valueEditor.setValue = function (v: any) {
            this.element.value = v
        }

        // Return the value of the input.
        this.valueDiv.setValue = function (v: any) {
            this.element.innerHTML = v
        }
    }
}


class ConfigurationToggleLine extends ConfigurationLine {

    constructor(panel: ConfigurationPanel, name: string, label: string, content: any, labels: Array<string>) {
        super(panel, name, label, content);
        let value = this.getValue()

        // Set the value div.
        this.valueDiv = this.content.appendElement({ "tag": "div", "id": name + "_div", "class": "col s12 m6", "innerHtml": value.toString() }).down()

        // Set the value editor.
        this.valueEditor = this.content
            .appendElement({ "tag": "div", "class": "switch col s12 m6", "style": "display: none;" }).down()

        this.valueEditor.appendElement({ "tag": "label" }).down()
            .appendElement({ "tag": "span", "innerHtml": labels[1] })
            .appendElement({ "tag": "input", "id": name + "_input", "type": "checkbox" })
            .appendElement({ "tag": "span", "class": "lever" })
            .appendElement({ "tag": "span", "innerHtml": labels[0] })

        if (value == true) {
            this.valueEditor.getChildById(name + "_input").element.click()
        }

        this.valueEditor.element.onchange = () => {
            // set the value in the interface.
            this.valueDiv.setValue(this.valueEditor.getValue())
            this.panel.hasChange()
        }

        // Return the value of the input.
        this.valueEditor.getValue = function () {
            return this.getChildById(name + "_input").element.checked
        }

        // Return the value of the input.
        this.valueEditor.setValue = function (v: any) {
            this.getChildById(name + "_input").element.value = v
            this.getChildById(name + "_input").element.disabled = v
        }

        // Return the value of the input.
        this.valueDiv.setValue = function (v: any) {
            this.element.innerHTML = v
        }
    }
}

/**
 * That class implement multiple options single choice configuration line.
 */
class ConfigurationMultipleOptionsSingleChoiceLine extends ConfigurationLine {

    constructor(panel: ConfigurationPanel, name: string, options: Array<string>, label: string, content: any) {
        super(panel, name, label, content);
        this.valueDiv = this.content.appendElement({ "tag": "div", "id": name + "_div", "class": "col s12 m6", "innerHtml": this.getValue() }).down()
        this.valueEditor = this.content.appendElement({ "tag": "div", "class": "col s12 m6", "style": "display: none; justify-content: flex-start;" }).down()

        // Set the choice from options...
        for (var i = 0; i < options.length; i++) {
            this.valueEditor
                .appendElement({ "tag": "label", "id": options[i] + "_label", "style": "padding-right: 15px;" }).down()
                .appendElement({ "tag": "input", "id": options[i] + "_input", "name": name + "_group", "type": "radio" })
                .appendElement({ "tag": "span", "innerHtml": options[i] }).up()

            let input = this.content.getChildById(options[i] + "_input")
            input.element.onchange = () => {
                // set the value in the interface.
                this.valueDiv.setValue(this.valueEditor.getValue())
                this.panel.hasChange()
            }
        }

        // Return the value of the input.
        this.valueEditor.getValue = () => {
            // That function will return the actual checked value.
            for (var i = 0; i < options.length; i++) {
                let input = this.valueEditor.getChildById(options[i] + "_input")
                if (input.element.checked == true) {
                    return options[i]
                }
            }
        }

        // Return the value of the input.
        this.valueEditor.setValue = (v: any) => {
            for (var i = 0; i < options.length; i++) {
                let input = this.content.getChildById(options[i] + "_input")
                input.element.checked = false
            }
            let input = this.valueEditor.getChildById(v + "_input")
            input.element.checked = true;
        }

        // Return the value of the input.
        this.valueDiv.setValue = function (v: any) {
            this.element.innerHTML = v
        }

        // Set the value of the editor...
        this.valueEditor.setValue(this.getValue())
    }
}

/**
 * Use to display a liste of string values in a configuration.
 */
class ConfigurationStringListLine extends ConfigurationLine {
    constructor(panel: ConfigurationPanel, name: string, label: string, content: any) {
        super(panel, name, label, content);

        // The value div.
        this.valueDiv = this.content.appendElement({ "tag": "ul", "id": name + "_div", "class": "collection col s12 m6" }).down()

        // The editor div.
        this.valueEditor = this.content.appendElement({ "tag": "div", "id": name + "_editor", "class": "col s12 m6", "style": "display: none; padding: 0px; margin: 0px; position: relative;" }).down()

        // Return the value of the input.
        this.valueEditor.getValue = () => {
            let inputs = document.getElementsByName(name + "_group")
            let values = new Array<string>()
            for (var i = 0; i < inputs.length; i++) {
                values.push((<any>inputs[i]).value)
            }
            return values;
        }

        // Return the value of the input.
        this.valueEditor.setValue = (values: any) => {
            if (values == undefined) {
                return;
            }
            let appendEditor = (index: number, value: string) => {
                let li = ul.appendElement({ "tag": "li", "class": "collection-item", "style": "padding: 0px;" }).down()
                let removeBtn = li.appendElement({ "tag": "label", "id": index + "_label", "style": "display: flex; align-items: center;" }).down()
                    .appendElement({ "tag": "input", "id": index + "_input", "name": name + "_group", "type": "text", "value": value })
                    .appendElement({ "tag": "i", "class": "tiny material-icons", "innerHtml": "remove", "style": "z-index: 10;" }).down()
                removeBtn.element.onmouseover = () => {
                    removeBtn.element.style.cursor = "pointer"
                }
                removeBtn.element.onmouseout = () => {
                    removeBtn.element.style.cursor = "default"
                }
                removeBtn.element.onclick = () => {
                    this.panel.hasChange()
                    li.element.parentNode.removeChild(li.element)
                }
                let input = this.content.getChildById(index + "_input")
                input.element.onchange = () => {
                    // set the value in the interface.
                    this.valueDiv.setValue(this.valueEditor.getValue())
                    this.panel.hasChange()
                }
            }

            this.valueEditor.removeAllChilds()
            let newLineBtn = this.valueEditor.appendElement({ "tag": "i", "class": "tiny material-icons", "innerHtml": "add_circle_outline", "style": "position: absolute; top: 12px; left: 4px; z-index: 10;" }).down()
            newLineBtn.element.onmouseover = () => {
                newLineBtn.element.style.cursor = "pointer"
            }
            newLineBtn.element.onmouseout = () => {
                newLineBtn.element.style.cursor = "default"
            }

            // Here I will set the list of control to edit the values.
            var ul = this.valueEditor.appendElement({ "tag": "ul", "id": name + "_editor", "class": "collection", "style": "padding: 15px;" }).down()

            // Apppend values.
            for (var i = 0; i < values.length; i++) {
                appendEditor(i, values[i])
            }

            newLineBtn.element.onclick = () => {
                // append a new line element.
                appendEditor(this.getValue().length, "")
                this.valueEditor.getChildById(this.getValue().length + "_input").element.focus()
            }

        }

        // Return the value of the input.
        this.valueDiv.setValue = (values: any) => {
            if (values == undefined) {
                return;
            }
            // Clear the content.
            this.valueDiv.removeAllChilds()
            // Apppend values.
            for (var i = 0; i < values.length; i++) {
                this.valueDiv.appendElement({ "tag": "li", "class": "collection-item", "id": name + "_div_" + i, "innerHtml": values[i] })
            }
        }

        // Set the actual configuration values.
        this.valueDiv.setValue(this.getValue())
        this.valueEditor.setValue(this.getValue())
    }
}

/**
 * That class will contain the general server information.
 */
export class ConfigurationPanel extends Panel {
    public config: any;
    public content: any;
    public btnGroup: any;
    private saveBtn: any;
    private cancelBtn: any;
    private configurationLines: Array<ConfigurationLine>

    constructor(config: any, title: string, id: string) {
        super(id);

        // Keep a pointer to the config.
        this.config = config;

        // Keep textual control
        this.configurationLines = new Array<ConfigurationLine>()

        // Display general information.
        this.div.appendElement({ "tag": "div", "class": "row configuration_panel" }).down()
            .appendElement({ "tag": "div", "class": "col s12 m8 offset-m2" }).down()
            .appendElement({ "tag": "div", "class": "card" }).down()
            .appendElement({ "tag": "div", "class": "card-content" }).down()


            .appendElement({ "tag": "span", "class": "card-title", "style": "font-size: 1.5em;", "innerHtml": title })
            .appendElement({ "tag": "div", "id": "content" })
            // The action buttons.
            .appendElement({ "tag": "div", "class": "card-action", "id": "btn_group", "style": "text-align: right; display: none;" }).down()
            .appendElement({ "tag": "a", "id": "save_btn", "href": "javascript:void(0)", "class": "waves-effect waves-light btn disabled", "innerHtml": "Save" })
            .appendElement({ "tag": "a", "id": "cancel_btn", "href": "javascript:void(0)", "class": "waves-effect waves-light btn disabled", "innerHtml": "Cancel" })

        // The save button
        this.saveBtn = this.div.getChildById("save_btn")
        this.saveBtn.element.onclick = () => {
            this.save()
        }

        // The cancel button
        this.cancelBtn = this.div.getChildById("cancel_btn")
        this.cancelBtn.element.onclick = () => {
            this.cancel()
        }

        // The group of button.
        this.btnGroup = this.div.getChildById("btn_group")

        // get the content.
        this.content = this.div.getChildById("content")
    }

    /**
     * Append the textual configuration
     * @param name The name of the property in the configuration object.
     * @param label The value to display as label.
     */
    appendTextualConfig(name: string, label?: string, type?: string, step?: number, min?: number, max?: number): any {
        let configLine = new ConfigurationTextLine(this, name, label, this.content, type, step, min, max)
        this.configurationLines.push(configLine)
        return configLine
    }

    /**
     * Append a boolean configuration (on/off true/false male/female...)
     * @param name The name of the property
     * @param labels The labels to display beside the switch
     * @param label Alternative property name in case the property name is a compose name.
     */
    appendBooleanConfig(name: string, labels: Array<string>, label?: string): any {
        let configLine = new ConfigurationToggleLine(this, name, label, this.content, labels)
        this.configurationLines.push(configLine)
        return configLine
    }

    /**
     * Append a multiple line configuration
     * @param name The name of the configuration
     * @param label The display name
     */
    appendStringListConfig(name: string, label?: string): any {
        let configLine = new ConfigurationStringListLine(this, name, label, this.content)
        this.configurationLines.push(configLine)
        return configLine
    }

    /**
     * Append multiple options single choice configuration line.
     * @param name The name of the configuration to display
     * @param options The list of possible values.
     * @param label The name to display in the interface.
     */
    appendMultipleOptionsSingleChoiceConfig(name: string, options: Array<string>, label?: string): any {
        let configLine = new ConfigurationMultipleOptionsSingleChoiceLine(this, name, options, label, this.content)
        this.configurationLines.push(configLine)
        return configLine
    }

    // create control...
    onlogin(data: any) {
        super.onlogin(data)
        // Display textual input
        for (var i = 0; i < this.configurationLines.length; i++) {
            this.configurationLines[i].unlock()
        }
        this.btnGroup.element.style.display = ""
    }

    onlogout() {
        // display values.
        for (var i = 0; i < this.configurationLines.length; i++) {
            this.configurationLines[i].lock()
        }

        this.btnGroup.element.style.display = "none"
        this.cancel()
    }

    // That function is the same for all configuration panels.
    save() {
        for (var i = 0; i < this.configurationLines.length; i++) {
            this.configurationLines[i].set()
        }

        this.cancelBtn.element.classList.add("disabled")
        this.saveBtn.element.classList.add("disabled")
    }

    // must be overide by each panel.
    cancel() {
        for (var i = 0; i < this.configurationLines.length; i++) {
            this.configurationLines[i].reset()
        }

        this.cancelBtn.element.classList.add("disabled")
        this.saveBtn.element.classList.add("disabled")
    }

    hasChange() {
        this.cancelBtn.element.classList.remove("disabled")
        this.saveBtn.element.classList.remove("disabled")
    }
}