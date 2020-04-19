import { MainPage } from './mainpage';
import { initServices, getErrorMessage } from './backend';
import "../style.css"

// use it wizely...
export let mainPage: MainPage;

initServices(()=>{
    // Create the main page object.
    mainPage = new MainPage();
},
(err: any) => {
  M.toast({ html: getErrorMessage(err.message), displayLength: 2000 });
});


