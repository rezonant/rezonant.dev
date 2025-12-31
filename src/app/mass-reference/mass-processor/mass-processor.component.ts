import { Component, input } from "@angular/core";
import { E_ALL, E_ALL_NET_MODES, E_ALL_WORLD_MODES, E_DEFAULT } from "../mass-reference-data";
import { MassProcessor, MassProcessorExecutionFlag } from "../mass-types";

@Component({
    selector: 'rez-mass-processor',
    template: `
        <ul class="facts">
            @if (processor().autoRegisters === false) {
                <li matTooltip="This processor does not automatically register itself">
                    <mat-icon>block</mat-icon>
                    No Auto Register
                </li>
            }

            @if (processor().requiresMutatingWorldAccess) {
                <li matTooltip="This processor requires access to mutate UWorld">
                    <mat-icon>public</mat-icon>
                    Mutates World
                </li>
            }
            @if (processor().requiresGameThread) {
                <li matTooltip="This processor runs on the Game Thread">
                    <mat-icon>sports_esports</mat-icon>
                    Game Thread
                </li>
            }

            @if (processor().executionFlags !== undefined) {
                <li matTooltip="Executes in: {{ processor().executionFlags!.join(', ') }}">
                    <mat-icon>start</mat-icon>
                    {{ executionLabel(processor().executionFlags) }}
                </li>
            }

            <li matTooltip="Processing phase">
                <mat-icon>nightlight</mat-icon>
                {{ processor().processingPhase || 'PrePhysics' }}
            </li>

            @if (processor().executionGroup !== undefined) {
                <li matTooltip="Execution Group: Indirectly affect execution order">
                    <mat-icon>segment</mat-icon>
                    {{ executionGroupLabel(processor().executionGroup) }}
                </li>
            }
            <li matTooltip="Pruning Behavior: {{ processor().queryBasedPruning === 'Never' ? 'Never apply pruning' : 'Always apply pruning'}}">
                <mat-icon>content_cut</mat-icon>
                {{ processor().queryBasedPruning ?? 'Prune' }}
            </li>
        </ul>

        @if (processor().executeBefore?.length ?? 0 > 0) {
            <strong>Executes Before</strong>
            <ul>
            @for (item of processor().executeBefore || []; track item) {
                <li>{{ item }}</li>
            }
            </ul>
        }
        @if (processor().executeAfter?.length ?? 0 > 0) {
            <strong>Executes After</strong>
            <ul>
            @for (item of processor().executeAfter || []; track item) {
                <li>{{ item }}</li>
            }
            </ul>
        }

        <rez-mass-element-list [module]="moduleId()" name="Required Subsystems" [elements]="processor().requiresSubsystems" />

        <hr />
        @for (query of processor().queries; track query.id) {
            <h1>
                <mat-icon>search</mat-icon>
                {{ query.id }}
            </h1>

            <div class="query-contents">
                @if (query.comment) {
                    <blockquote>{{ query.comment }}</blockquote>
                }

                @if (query.remark) {
                    <div [innerHTML]="query.remark | markdownToHtml | trustHtml"></div>
                }

                @if ((query.requiresFragments?.length ?? 0) > 0 || (query.requiresTags?.length ?? 0) > 0) {
                    <blockquote>
                        <rez-mass-element-list [module]="moduleId()" name="Required Subsystems" [elements]="query.requiresSubsystems" />
                        <rez-mass-element-list [module]="moduleId()" name="Required Fragments" [elements]="query.requiresFragments" />
                        <rez-mass-element-list [module]="moduleId()" name="Required Tags" [elements]="query.requiresTags" />
                    </blockquote>
                }
            </div>
        }
        <br/>
        <rez-mass-element-list [module]="moduleId()" name="Related Traits" [elements]="processor().relatedTraits" />
    `,
    styles: `
        mat-icon {
            vertical-align: middle;
        }

        .query-contents {
            margin-left: 2.5em;
        }

        h1 mat-icon {
            $size: 32px;
            width: $size;
            height: $size;
            font-size: $size;
        }
    `,
    standalone: false
})
export class MassProcessorComponent {
    moduleId = input.required<string>();
    processor = input.required<MassProcessor>();

    executionGroupLabel(group: string | undefined) {
        if (group === undefined)
            return 'Unknown';

        return group.replace(/^UE::Mass::ProcessorGroupNames::/, '');
    }

    executionLabel(flags: MassProcessorExecutionFlag[] | undefined) {
        if (flags === undefined)
            return `Unknown`;

        if (E_ALL.every(x => flags.includes(x)))
            return `All`;
        else if (E_ALL_NET_MODES.every(x => flags.includes(x)))
            return `All Net Modes`;
        else if (E_ALL_WORLD_MODES.every(x => flags.includes(x)))
            return `All World Modes`;
        // else if (E_DEFAULT.every(x => flags.includes(x)) && flags.every(x => E_DEFAULT.includes(x)))
        //     return `Default`;

        return flags.join('/');
    }
}
