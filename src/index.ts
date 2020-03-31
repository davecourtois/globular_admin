import { MainPage } from './mainpage';
import { initServices, getErrorMessage } from './backend';
import "../style.css"

initServices(()=>{
    // Create the main page object.
    let mainPage = new MainPage();
},
(err: any) => {
  M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
});


