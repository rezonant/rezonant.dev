import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { resourceUrlTransformer } from '../resource-url-transformer';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'rez-resource',
    templateUrl: './resource.component.html',
    styleUrl: './resource.component.scss'
})
export class ResourceComponent {
    route = inject(ActivatedRoute);
    titleService = inject(Title);
    title = '';

    setTitle(value: string) {
        this.title = value;
        this.titleService.setTitle(`${value} - rezonant.dev`);
    }

    path: string | null = null;
    urlTransformer = resourceUrlTransformer(() => this.path!);
    ngOnInit() {
        this.route.paramMap.subscribe(params => this.path = params.get('path'));
    }
}
