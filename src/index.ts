import { MainPage } from './mainpage';
import { initServices } from './backend';

initServices(()=>{
    // Create the main page object.
    let mainPage = new MainPage();
});


