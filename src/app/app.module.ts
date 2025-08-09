import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProjectsComponent } from './projects/projects.component';
import { BlogComponent } from './blog/blog.component';
import { DocsComponent } from './docs/docs.component';
import { MarkdownToHtmlPipe } from './markdown-to-html.pipe';
import { GithubMarkdownComponent } from './github-markdown.component';
import { TrustHtmlPipe } from './trust-html.pipe';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    HomeComponent,
    ProjectsComponent,
    BlogComponent,
    DocsComponent,
    MarkdownToHtmlPipe,
    TrustHtmlPipe,
    GithubMarkdownComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
        { path: '', pathMatch: 'full', component: HomeComponent },
        { path: 'projects', pathMatch: 'full', component: ProjectsComponent },
        { path: 'about', pathMatch: 'full', component: AboutComponent },
        { path: 'blog', pathMatch: 'full', component: BlogComponent },
        { path: 'docs', pathMatch: 'full', component: DocsComponent }
    ])
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
