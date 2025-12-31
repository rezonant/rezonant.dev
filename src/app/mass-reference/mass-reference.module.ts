import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MassModuleComponent } from "./mass-module/mass-module.component";
import { MassTraitComponent } from "./mass-trait/mass-trait.component";
import { MassProcessorComponent } from "./mass-processor/mass-processor.component";
import { MassFragmentComponent } from "./mass-fragment/mass-fragment.component";
import { MassIndexComponent } from "./mass-index/mass-index.component";
import { MassElementComponent } from "./mass-element/mass-element.component";
import { MassReferenceService } from "./mass-reference.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CommonUiModule } from "../../common-ui";
import { MassElementListComponent } from "./element-list.component";
import { MassPluginComponent } from "./mass-plugin/mass-plugin.component";
import { MaterialModule } from "../material.module";
import { MassTagComponent } from "./mass-tag/mass-tag.component";
import { MassPropertyListComponent } from "./mass-property-list.component";
import { A11yModule } from "@angular/cdk/a11y";
import { MassReferenceShellComponent } from "./mass-reference-shell.component";
import { MassStubsComponent } from "./mass-stubs/mass-stubs.component";
import { MassJsonComponent } from "./mass-json.component";
import { MassElementJsonComponent } from "./mass-element-json/mass-element.component";
import { MassElementSubclassesComponent } from "./mass-element-subclasses/mass-element-subclasses.component";

@NgModule({
    declarations: [
        MassReferenceShellComponent,
        MassIndexComponent,
        MassStubsComponent,
        MassModuleComponent,
        MassTraitComponent,
        MassProcessorComponent,
        MassFragmentComponent,
        MassElementComponent,
        MassElementListComponent,
        MassPluginComponent,
        MassTagComponent,
        MassPropertyListComponent,
        MassJsonComponent,
        MassElementJsonComponent,
        MassElementSubclassesComponent
    ],
    providers: [
        MassReferenceService
    ],
    imports: [
        CommonModule,
        CommonUiModule,
        MaterialModule,
        FormsModule,
        RouterModule,
        A11yModule
    ]
})
export class MassReferenceModule {
    static routes(): Routes {
        return [
            {
                path: '',
                component: MassReferenceShellComponent,
                children: [
                    { path: '', component: MassIndexComponent },
                    { path: 'stubs', component: MassStubsComponent },
                    { path: 'source', component: MassJsonComponent },
                    { path: 'plugins/:pluginId', component: MassPluginComponent },
                    { path: ':moduleId', component: MassModuleComponent },
                    { path: ':moduleId/:id', component: MassElementComponent },
                    { path: ':moduleId/:id/subclasses', component: MassElementSubclassesComponent },
                    { path: ':moduleId/:id/source', component: MassElementJsonComponent },
                ]
            }
        ];
    }
}
