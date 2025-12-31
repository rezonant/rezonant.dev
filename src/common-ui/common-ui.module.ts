import { NgModule } from "@angular/core";
import { NotFoundComponent } from "./not-found/not-found.component";
import { MarkdownToHtmlPipe } from "./markdown-to-html.pipe";
import { RichContentService } from "./rich-content.service";
import { TrustHtmlPipe } from "./trust-html.pipe";

const DECLARATIONS = [
    NotFoundComponent,
    MarkdownToHtmlPipe,
    TrustHtmlPipe
];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    providers: [
        RichContentService
    ]
})
export class CommonUiModule {

}
