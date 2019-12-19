import { Render, Main, id, cl } from '../../renderer'

export function MainContainer() {
    new Render([
        Main(
            id('main'),
            cl('w80')
        )
    ], 'body')
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