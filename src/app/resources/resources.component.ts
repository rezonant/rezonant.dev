import { Component, inject } from '@angular/core';
import { resourceUrlTransformer } from '../resource-url-transformer';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'rez-resources',
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.scss'
})
export class ResourcesComponent {
    titleService = inject(Title);
    title = '';

    setTitle(value: string) {
        this.title = value;
        this.titleService.setTitle(`${value} - rezonant.dev`);
    }
    urlTransformer = resourceUrlTransformer(() => '');
}
