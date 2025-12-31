import { Component, computed, inject, input } from "@angular/core";
import { MassElementRef, MassFragment, MassProcessor, MassTag } from "../mass-types";
import { MassReferenceService } from "../mass-reference.service";

@Component({
    selector: 'rez-mass-tag',
    template: `
        <br/>
        <rez-mass-element-list name="Added by" [showRemarks]="false" [showSummary]="true" [elements]="providerTraits()" />
        <rez-mass-element-list name="Queries" [elements]="queryRefs()" />
    `,
    standalone: false
})
export class MassTagComponent {
    private ref = inject(MassReferenceService);

    moduleId = input.required<string>();
    tag = input.required<MassTag>();
    providerTraits = computed(() => this.ref.getTraitsThatProvideTag(this.tag()));
    queryRefs = computed(() =>
        this.ref.getQueriesThatReferenceTag(this.tag())
            .map(q => ({ q, p: this.ref.resolve<MassProcessor>(q.owner!) }))
            .filter(pq => pq.p)
            .map<MassElementRef>(pq => ({ ...this.ref.ref(pq.p)!, remark: `Referenced in query '${pq.q.id}'` }))

    );
}
