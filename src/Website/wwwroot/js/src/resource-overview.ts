import { Boxes } from './components/boxes';

(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const wrapper = document.getElementById('resources');
        const boxContainerIds = new Array<string>();
        const boxes = new Array<Boxes>();

        // collect all IDs
        if (wrapper && wrapper instanceof HTMLDivElement) {
            const boxContainers = wrapper.getElementsByClassName('box-container');
            if (boxContainers && boxContainers.length > 0) {
                for (let i = 0; i < boxContainers.length; i++) {
                    if (boxContainers[i].id) {
                        boxContainerIds.push(boxContainers[i].id);
                    }
                }
            } else {
                throw 'no box-containers found!';
            }
        } else {
            throw 'no wrapper found';
        }

        // todo: create boxes!
        //for (const id of boxContainerIds) {
        //    const box = new Boxes(id);
        //    boxes.push(box);
        //    box.elementWasSelected.subscribe(isaacResourceId => {
        //        window.location.assign(`/${isaacResourceId}`);
        //    });
        //}

        console.log('created boxes:', boxes);
    });
})();

