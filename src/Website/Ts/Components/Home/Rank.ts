import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { FrontpageTopUser } from "../../Models/frontpage-top-user";

class RankImageComponent implements Component {

    E: FrameworkElement;

    constructor(xOffset: string, yOffset: string) {
        this.E = {
            e: ['div'],
            a: [[A.Style, `background: url('/img/frontpage.png') ${xOffset}px ${yOffset}px transparent; width: 50px; height: 50px;`], [A.Class, 'fp-right']]
        };
    }
}

class RankNameComponent implements Component {

    E: FrameworkElement;

    constructor(user: FrontpageTopUser, rank: number) {
        this.E = {
            e: ['p', `Rank ${rank.toString(10)}: `],
            a: [[A.Class, 'fp-left']],
            c: [
                {
                    e: ['strong'],
                    c: [
                        {
                            e: ['span', user.name],
                            a: [[A.Id, 'number-one']]
                        }
                    ]
                },
                {
                    e: ['span', ` (${user.contributions.toString(10)} contributions)`]
                }
            ]
        };
    }
}


export { RankImageComponent, RankNameComponent }