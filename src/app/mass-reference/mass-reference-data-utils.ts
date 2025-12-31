import { MassElementRef, MassFragmentRef, MassModule, MassProcessingRequirement, MassTag } from "./mass-types";

export class RefBuilder implements MassElementRef {
    constructor(public id: string, public module: string) {
    }

    remark?: string;

    from(moduleId: string) {
        this.module = moduleId;
        return this;
    }

    withRemark(value: string) {
        this.remark = value;
        return this;
    }

    // Convert to ProcessingRequirementBuilder

    noAccess() { return this.withAccess('None'); }
    readOnly() { return this.withAccess('ReadOnly'); }
    readWrite() { return this.withAccess('ReadWrite'); }

    all() { return this.withPresence('All'); }
    any() { return this.withPresence('Any'); }
    none() { return this.withPresence('None'); }
    optional() { return this.withPresence('Optional'); }

    withAccess(value: 'None' | 'ReadOnly' | 'ReadWrite') {
        return new ProcessingRequirementBuilder(this).withAccess(value);
    }

    withPresence(value: 'All' | 'Any' | 'None' | 'Optional') {
        return new ProcessingRequirementBuilder(this).withPresence(value);
    }
}

export class ProcessingRequirementBuilder extends RefBuilder implements MassProcessingRequirement {
    constructor(ref: MassElementRef) {
        super(ref.id, ref.module);
        this.access = 'None';
        this.presence = 'All';
        Object.assign(this, ref);
    }

    access?: 'None' | 'ReadOnly' | 'ReadWrite';
    presence?: 'All' | 'Any' | 'None' | 'Optional';

    override noAccess() { return this.withAccess('None'); }
    override readOnly() { return this.withAccess('ReadOnly'); }
    override readWrite() { return this.withAccess('ReadWrite'); }

    override all() { return this.withPresence('All'); }
    override any() { return this.withPresence('Any'); }
    override none() { return this.withPresence('None'); }
    override optional() { return this.withPresence('Optional'); }

    override withAccess(value: 'None' | 'ReadOnly' | 'ReadWrite') {
        this.access = value;
        return this;
    }

    override withPresence(value: 'All' | 'Any' | 'None' | 'Optional') {
        this.presence = value;
        return this;
    }
}

export class ModuleBuilder {
    constructor(private moduleId: string) {
    }

    r(id: string): RefBuilder {
        return new RefBuilder(id, this.moduleId);
    }

    ref(id: string, extra?: Partial<MassElementRef>) {
        return {
            module: extra?.module || this.moduleId,
            ...extra,
            id
        };
    }

    /**
     * @deprecated use ref() instead
     */
    frag(id: string, extra?: Partial<MassFragmentRef>) {
        return {
            id,
            module: this.moduleId,
            ...(extra || {}),
        };
    }
}

export function declareModule(moduleId: string, declarator: (module: ModuleBuilder) => Omit<MassModule, 'id'>) {
    return {
        ...declarator(new ModuleBuilder(moduleId)),
        id: moduleId
    };
}

export function declareTag(id: string, extra?: Partial<MassTag>): MassTag {
    return { id, parent: { id: 'FMassTag', module: 'MassEntity' }, type: 'tag', ...(extra ?? {}) };
}
