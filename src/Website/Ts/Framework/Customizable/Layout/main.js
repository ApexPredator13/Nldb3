import { cl, id, Main, Render } from '../../renderer';

export function renderMainContainer() {
    new Render([
        Main(
            id('main'),
            cl('w80')
        )
    ], 'body', true, false);
}

//export class MainComponent implements Component {
//    E: FrameworkElement;

//    constructor() {
//        this.E = {
//            e: ['main'],
//            a: [[A.Class, 'w80'], [A.Id, 'main-container']]
//        }
//    }
//}