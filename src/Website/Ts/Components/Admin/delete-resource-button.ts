import { ComponentWithForm, Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { hide, show } from "../../Framework/browser";
import { AdminLink } from "../../Pages/Admin/_admin-link-creator";

export class DeleteResourceButton extends ComponentWithForm implements Component {
    E: FrameworkElement;

    constructor(resourceId: string) {
        super();

        const deleteButtonId = `delete-${resourceId}`;
        const cancelButtonId = `cancel-${resourceId}`;
        const confirmButtonId = `confirm-${resourceId}`;

        const deleteButtonClick = () => {
            hide(document.getElementById(deleteButtonId));
            show(document.getElementById(cancelButtonId));
            show(document.getElementById(confirmButtonId));
        }

        const cancelButtonClick = () => {
            show(document.getElementById(deleteButtonId));
            hide(document.getElementById(cancelButtonId));
            hide(document.getElementById(confirmButtonId));
        }

        this.E = {
            e: ['form'],
            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/delete_isaac_resource', true, AdminLink.ResourceDeleted(resourceId))]],
            c: [
                {
                    e: ['input'],
                    a: [[A.Name, 'resourceId'], [A.Value, resourceId], [A.Type, 'hidden']]
                },
                {
                    e: ['button', 'Delete'],
                    a: [[A.Id, deleteButtonId], [A.Class, 'btn-red']],
                    v: [[EventType.Click, deleteButtonClick]]
                },
                {
                    e: ['button', 'Cancel'],
                    a: [[A.Id, cancelButtonId], [A.Class, 'btn-yellow display-none']],
                    v: [[EventType.Click, cancelButtonClick]]
                },
                {
                    e: ['button', 'Confirm'],
                    a: [[A.Id, confirmButtonId], [A.Class, 'btn-red display-none'], [A.Type, 'submit']]
                },
            ]
        }
    }
}


