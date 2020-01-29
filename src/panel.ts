import { eventHub } from "./backend";
import { createElement } from "./element";

export class Panel {
  protected div: any;
  private uuid: string;
  protected id: string;

  constructor(id: string) {
    // Div is the html element div.
    this.div = createElement(null, {
      tag: "div",
      id: id,
      style: "padding: 10px;"
    });
    this.id = id;
    eventHub.subscribe(
      "onlogin",
      (uuid: string) => {
        this.uuid = uuid;
      },
      (data: any) => {
        this.onlogin(data);
      },
      true
    );
  }

  // Here I will react to login information...
  onlogin(data: any) {
    // overide...
  }

  onlogout() {
    // overide...
  }

  close() {
    // disconnect the subscriber from the event channel...
    eventHub.unSubscribe("onlogin", this.uuid);
  }

  setParent(parent: any) {
    parent.appendElement(this.div);
  }
}
