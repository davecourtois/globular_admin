import { MainPage } from './mainpage';
import { initServices } from './backend';
import "../style.css"

initServices(()=>{
    // Create the main page object.
    let mainPage = new MainPage();
});


