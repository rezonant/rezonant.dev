import { Component, computed, inject, input } from "@angular/core";
import { MassElementRef, MassFragment, MassProcessor } from "../mass-types";
import { MassReferenceService } from "../mass-reference.service";

@Component({
    selector: 'rez-mass-fragment',
    template: `
        <br/>
        <rez-mass-property-list [properties]="fragment().properties || []" />
        <rez-mass-element-list name="Added by" [showRemarks]="false" [showSummary]="true" [elements]="providerTraits()" />
        <rez-mass-element-list name="Queries" [elements]="queryRefs()" />
    `,
    standalone: false
})
export class MassFragmentComponent {
    private ref = inject(MassReferenceService);

    moduleId = input.required<string>();
    fragment = input.required<MassFragment>();
    providerTraits = computed(() => this.ref.getTraitsThatProvideFragment(this.fragment()));
    queryRefs = computed(() =>
        this.ref.getQueriesThatReferenceFragment(this.fragment())
            .map(q => ({ q, p: this.ref.resolve<MassProcessor>(q.owner!) }))
            .filter(pq => pq.p)
            .map<MassElementRef>(pq => ({ ...this.ref.ref(pq.p)!, remark: `Referenced in query '${pq.q.id}'` }))

    );
    keys(o: any) {
        return Object.keys(o);
    }
}
