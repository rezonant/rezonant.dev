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
import { NotFoundComponent } from './not-found/not-found.component';
import { MyLinksComponent } from './my-links/my-links.component';


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
        NotFoundComponent,
        MyLinksComponent
    ],
    imports: [
        BrowserModule,
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
            { path: '**', component: NotFoundComponent }
        ])
    ],
    providers: [
        provideClientHydration()
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
