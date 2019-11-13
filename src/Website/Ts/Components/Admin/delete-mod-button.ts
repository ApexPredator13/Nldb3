import { Component, FrameworkElement, ComponentWithForm, A, EventType } from "../../Framework/renderer";
import { Mod } from "../../Models/mod";
import { hide, show } from "../../Framework/browser";

export class DeleteModButton extends ComponentWithForm implements Component {
    E: FrameworkElement;

    private cancelButton: HTMLElement | null = null;
    private deleteButton: HTMLElement | null = null;
    private confirmButton: HTMLElement | null = null;

    constructor(mod: Mod) {
        super();

        const clickDelete = (e: Event) => {
            this.GetButtons(mod);
            e.preventDefault();
            hide(this.deleteButton);
            show(this.confirmButton, this.cancelButton);
        };

        const clickCancel = (e: Event) => {
            this.GetButtons(mod);
            e.preventDefault();
            hide(this.confirmButton, this.cancelButton);
            show(this.deleteButton);
        }

        this.E = {
            e: ['form'],
            a: [[A.Method, 'post']],
            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/delete_mod', true, '/Admin/ModDeleted', mod.name)]],
            c: [
                {
                    e: ['input'],
                    a: [
                        [A.Name, 'ModId'],
                        [A.Value, mod.id ? mod.id.toString(10) : ''],
                        [A.Type, 'hidden']
                    ]
                },
                {
                    e: ['button', 'Delete'],
                    a: [[A.Class, 'btn-red'], [A.Id, `delete-${mod.id}`]],
                    v: [[EventType.Click, clickDelete]]
                },
                {
                    e: ['button', 'Yes, Confirm!'],
                    a: [[A.Class, 'btn-red display-none'], [A.Id, `confirm-${mod.id}`], [A.Type, 'submit']],
                },
                {
                    e: ['button', 'No, Cancel!'],
                    a: [[A.Class, 'btn-orange display-none'], [A.Id, `cancel-${mod.id}`]],
                    v: [[EventType.Click, clickCancel]]
                }
            ]
        }
    }

    private GetButtons(mod: Mod) {
        if (!this.cancelButton || !this.deleteButton || !this.confirmButton) {
            this.cancelButton = document.getElementById(`cancel-${mod.id}`);
            this.deleteButton = document.getElementById(`delete-${mod.id}`);
            this.confirmButton = document.getElementById(`confirm-${mod.id}`);
        }
    }
}


