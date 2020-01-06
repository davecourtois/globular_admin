import { Panel } from './panel';
import { getAllActions, getAllRoles } from './backend';

export class RolePanel extends Panel {
    private allActions: Array<string>
    private roles: Array<any>

    /** The read only roles */
    private readOnlyRolesDiv: any;

    /** The constructor. */
    constructor(id: string) {
        super(id)

        // Retreive the list of all actions and keep it in a local variable.
        getAllActions(
            (actions: Array<string>) => {
                this.allActions = actions
                getAllRoles((roles: Array<any>)=>{
                    this.roles = roles;
                    this.displayReadOnlyRoles()
                }, (err: any)=>{

                })
            },
            (err: any) => {
                console.log(err)
            })

        
    }

    // Here I will react to login information...
    onlogin(data: any) {
        // overide...
        console.log("Panel --> onlogin: ", this.id)
    }

    onlogout() {
        // overide...
    }

    // Display the readOnly role.
    displayReadOnlyRoles(){
        if(this.readOnlyRolesDiv == null){
            this.readOnlyRolesDiv = this.div.appendElement({"tag":"div", "class":"row"}).down()
                .appendElement({"tag":"div", "class":"col s12 m8 offset-m2"}).down()
        }else{
            this.readOnlyRolesDiv.element.innerHTML = ""
        }

        // Create a collapsible panel.
        let collapsiblePanel = this.readOnlyRolesDiv.appendElement({"tag":"ul", "id":"roles_list", "class":"collapsible"}).down()

        /** Here I will display the roles in accordeon panel. */
        for(var i=0; i < this.roles.length; i++){
            let content = collapsiblePanel.appendElement({"tag":"li"}).down()
            .appendElement({"tag":"div", "class":"collapsible-header", "style":"display: flex; align-items: center;"}).down()
            .appendElement({"tag":"span", "innerHtml":this.roles[i]._id}).up()
            .appendElement({"tag":"div", "class":"collapsible-body"}).down()
            
            let actionsList = content.appendElement({"tag":"ul", "class":"collection"}).down()
            for(var j=0; j < this.roles[i].actions.length; j++){
                actionsList.appendElement({"tag":"li", "class":"collection-item", "innerHtml": this.roles[i].actions[j]})
            }
        }
    }
}