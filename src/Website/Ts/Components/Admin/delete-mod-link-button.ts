import { ComponentWithForm, Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { ModUrl } from "../../Models/mod-url";
import { show, hide } from "../../Framework/browser";
import { AdminLink } from "../../Pages/Admin/_admin-link-creator";

export class DeleteModLinkButton extends ComponentWithForm implements Component {
    E: FrameworkElement;

    private DeleteButton: HTMLElement | null = null;
    private ConfirmButton: HTMLElement | null = null;
    private CancelButton: HTMLElement | null = null;

    private deleteButtonId: string;
    private confirmButtonId: string;
    private cancelButtonId: string;

    constructor(link: ModUrl) {
        super();

        this.deleteButtonId = `delete-${link.id.toString(10)}`;
        this.confirmButtonId = `confirm-${link.id.toString(10)}`;
        this.cancelButtonId = `cancel-${link.id.toString(10)}`;

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['form'],
                    v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/delete_mod_link', true, AdminLink.ModLinkDeleted(link.link_text))]],
                    c: [
                        {
                            e: ['input'],
                            a: [[A.Name, 'LinkId'], [A.Type, 'hidden'], [A.Value, link.id.toString(10)]]
                        },
                        {
                            e: ['button', 'Delete'],
                            a: [[A.Class, 'button-green'], [A.Id, this.deleteButtonId]],
                            v: [[EventType.Click, e => { e.preventDefault(); this.GetButtons(); show(this.CancelButton, this.ConfirmButton); hide(this.DeleteButton); }]]
                        },
                        {
                            e: ['button', 'No, Cancel!'],
                            a: [[A.Class, 'btn-orange display-none'], [A.Id, this.cancelButtonId]],
                            v: [[EventType.Click, e => { e.preventDefault(); this.GetButtons(); show(this.DeleteButton); hide(this.ConfirmButton, this.CancelButton); }]]
                        },
                        {
                            e: ['button', 'Yes, Delete!'],
                            a: [[A.Class, 'btn-red display-none'], [A.Id, this.confirmButtonId], [A.Type, 'submit']]
                        }
                    ]
                }
            ]
        }
    }

    private GetButtons() {
        this.DeleteButton = document.getElementById(this.deleteButtonId);
        this.ConfirmButton = document.getElementById(this.confirmButtonId);
        this.CancelButton = document.getElementById(this.cancelButtonId);
    }
}

