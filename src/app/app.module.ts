import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { Route, RouterModule, UrlMatcher, UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProjectsComponent } from './projects/projects.component';
import { BlogComponent } from './blog/blog.component';
import { ResourcesComponent } from './resources/resources.component';
import { MarkdownToHtmlPipe } from './markdown-to-html.pipe';
import { GithubMarkdownComponent } from './github-markdown.component';
import { TrustHtmlPipe } from './trust-html.pipe';
import { ResourceComponent } from './resource/resource.component';
import { MyLinksComponent } from './my-links/my-links.component';
import { RichContentService } from './rich-content.service';
import { MassReferenceModule } from './mass-reference';
import { CommonUiModule, NotFoundComponent } from '../common-ui';
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


const pathMatcher: UrlMatcher = (segments: UrlSegment[], group: UrlSegmentGroup, route: Route) => {
    if (segments.length > 0) {
        return {
            consumed: segments,
            posParams: {
                path: new UrlSegment(segments.join("/"), {})
            }
        };
    }
    return null;
}

@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        HomeComponent,
        ProjectsComponent,
        BlogComponent,
        ResourcesComponent,
        ResourceComponent,
        MarkdownToHtmlPipe,
        TrustHtmlPipe,
        GithubMarkdownComponent,
        MyLinksComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonUiModule,
        MaterialModule,
        MassReferenceModule,
        RouterModule.forRoot([
            { path: '', pathMatch: 'full', component: HomeComponent },
            { path: 'projects', pathMatch: 'full', component: ProjectsComponent },
            { path: 'about', pathMatch: 'full', component: AboutComponent },
            { path: 'blog', pathMatch: 'full', component: BlogComponent },
            {
                path: 'resources',
                children: [
                    { path: '', pathMatch: 'full', component: ResourcesComponent },
                    { matcher: pathMatcher, component: ResourceComponent },
                    // { path: '**', component: NotFoundComponent }
                ]
            },
            { path: 'reference/unreal/mass', children: MassReferenceModule.routes() },
            { path: '**', component: NotFoundComponent },
        ], { bindToComponentInputs: true })
    ],
    providers: [
        provideClientHydration(),
        RichContentService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
