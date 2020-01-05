import { cl, id, Main, Html } from '../../renderer';

export function renderMainContainer() {
    new Html([
        Main(
            id('main'),
            cl('w80')
        )
    ], 'body', true, false);
}