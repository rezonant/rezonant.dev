import { NgModule } from "@angular/core";
import { NotFoundComponent } from "./not-found/not-found.component";

const DECLARATIONS = [
    NotFoundComponent
];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS
})
export class CommonUiModule {

}
