import { Component, ElementRef, inject, PLATFORM_ID, viewChild } from "@angular/core";
import { MassReferenceService, SearchResult, IndexEntry } from "./mass-reference.service";
import { MatAutocompleteActivatedEvent } from "@angular/material/autocomplete";
import { Router } from "@angular/router";
import { MassElement } from "./mass-types";
import { isPlatformServer } from "@angular/common";

@Component({
    selector: 'rez-massref-shell',
    template: `
        <nav>
            <a class="home" routerLink="/reference/unreal/mass">
                <mat-icon>local_library</mat-icon>
                mass
            </a>

            <mat-form-field appearance="outline" floatLabel="auto" >
                <mat-label>Search</mat-label>
                <input type="text"
                    #searchBox
                    matInput
                    [matAutocomplete]="resultPicker"
                    [(ngModel)]="searchQuery"
                    (blur)="searchQuery = ''"
                    (keydown)="search()"
                    (change)="search()"
                    (focus)="search()"
                    />
                <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>
            <mat-autocomplete
                #resultPicker="matAutocomplete"
                [autoActiveFirstOption]="true"
                [autoSelectActiveOption]="false">
                @for (option of searchResults; track option) {
                    <mat-option class="search-result" value="" (onSelectionChange)="activateSearchResult(option)">
                        <ul class="facts">
                            <li><span class="type">{{option.typeLabel}}</span></li>
                            <li>{{ option.label }}</li>
                            @if (option.summary) {
                                <li><span class="summary">{{option.summary}}</span></li>
                            }
                        </ul>
                    </mat-option>
                }
            </mat-autocomplete>
        </nav>
        <router-outlet />
    `,
    styles: `
        .search-result {
            ul.facts li {
                border-color: #666;
            }
            span.type, span.summary {
                color: #666;
            }
        }
        nav {
            display: flex;
            gap: 1em;
            //border: 1px solid #503232;
            border-top: none;
            border-radius: 0 0 8px 8px;
            padding: 1.5em 0 0.5em 0;
            margin-top: -2em;
            align-items: baseline;

            mat-form-field {
                flex-grow: 1;
            }
        }

        a.home {
            font-size: 150%;
            font-weight: 100;
            &:hover {
                text-decoration: none;
            }
        }

        @media (max-width: 450px) {
            a.home {
                font-size: 90%;
            }
        }
    `
})
export class MassReferenceShellComponent {
    private ref = inject(MassReferenceService);
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);

    searchBox = viewChild.required<ElementRef>('searchBox');
    searchQuery: string = '';
    searchResults: IndexEntry[] = [];

    globalKeyDown = (ev: KeyboardEvent) => {
        let modified = (ev.ctrlKey || ev.altKey);

        if (modified && ev.key === 'p') {
            ev.stopImmediatePropagation();
            ev.preventDefault();
            this.searchBox().nativeElement.focus();
            this.searchQuery = '';
        }
    };

    ngOnInit() {
        if (!isPlatformServer(this.platformId))
            document.addEventListener('keydown', this.globalKeyDown);
    }

    ngOnDestroy() {
        if (!isPlatformServer(this.platformId))
            document.removeEventListener('keydown', this.globalKeyDown);
    }

    search() {
        this.searchResults = this.ref.search(this.searchQuery);
    }

    activateSearchResult(entry: IndexEntry) {
        switch (entry.object.type) {
            case 'module':
                this.router.navigateByUrl(`/reference/unreal/mass/${entry.text}`);
                break;
            case 'plugin':
                this.router.navigateByUrl(`/reference/unreal/mass/plugins/${entry.text}`);
                break;
            default:
                let element = entry.object as MassElement;
                this.router.navigateByUrl(`/reference/unreal/mass/${element.module}/${element.id}`);
        }
    }
}
