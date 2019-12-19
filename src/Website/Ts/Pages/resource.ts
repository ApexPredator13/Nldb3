import { Component, FrameworkElement, AsyncComponentPart, A, EventType, render } from "../Framework/renderer";
import { PageData, PageType, registerPage, setOnLoadPageType, initRouter, setTitle } from "../Framework/router";
import { get } from "../Framework/http";
import { StatsPageResult } from "../Models/StatsPageResult";
import { ResourceType } from "../Enums/resource-type";
import { IsaacImage } from "../Components/General/isaac-image";
import { ChartData, Chart, ChartDataSets } from "chart.js";
import { IsaacResource } from "../Models/isaac-resource";
import { SearchboxComponent } from "../Components/General/searchbox";
import { VideosComponent } from "../Components/General/videos";

export class Resource implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    static chartsData: Map<string, ChartData>;
    static charts: Map<string, Chart>;
    static allResources: Array<IsaacResource> | undefined;
    static originalBodyBackground = (' ' + getComputedStyle(document.body).backgroundImage as string).slice(1);
    static optionsLoaded: boolean;

    private resourceId: string;
    private backgroundVisible = true;

    constructor(parameters: Array<string>) {
        Resource.chartsData = new Map<string, ChartData>();
        Resource.charts = new Map<string, Chart>();
        Resource.optionsLoaded = false;

        this.resourceId = parameters[0];

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['div', 'loading...'],
                    a: [[A.Id, 'page-container']]
                },
                {
                    e: ['div'],
                    a: [[A.Id, 'chart-options-menu']],
                    c: [
                        {
                            e: ['span', 'Show Options'],
                            a: [[A.Id, 'chart-options-link']],
                            v: [[EventType.Click, e => this.ClickOptions(e)]]
                        },
                        {
                            e: ['div'],
                            a: [[A.Id, 'chart-options-box-container']],
                            c: [
                                {
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['p', 'Compare to...']
                                        },
                                        {
                                            e: ['div'],
                                            a: [[A.Id, 'searchbox-placeholder']]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['button', 'Randomize Bar-Colors'],
                                            a: [[A.Id, 'change-colors'], [A.Class, 'btn-green']],
                                            v: [[EventType.Click, () => this.RandomizeChartColors()]]
                                        },
                                        {
                                            e: ['br']
                                        },
                                        {
                                            e: ['br']
                                        },
                                        {
                                            e: ['button', 'Toggle Background'],
                                            a: [[A.Id, 'hide-background'], [A.Class, 'btn-green']],
                                            v: [[EventType.Click, () => this.ToggleBackground()]]
                                        },
                                        {
                                            e: ['br']
                                        },
                                        {
                                            e: ['br']
                                        },
                                        {
                                            e: ['button', 'Reset Page'],
                                            a: [[A.Id, 'reset-chart'], [A.Class, 'btn-red']],
                                            v: [[EventType.Click, e => this.ResetPage(e)]]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        this.A = this.CreatePage();
    }

    private CreatePage(): Array<AsyncComponentPart> {
        const part: AsyncComponentPart = {
            I: 'page-container',
            P: get<StatsPageResult>(`/Api/Resources/${this.resourceId}/Stats`).then(result => {
                if (!result) {
                    return {
                        e: ['div', 'Resource not found.']
                    };
                }

                setTitle(result.resource.name);

                const chartSections = new Array<FrameworkElement>();

                if (result.history) {
                    const chartId = 'throughout-the-letsplay';
                    Resource.chartsData.set(chartId, result.history);

                    chartSections.push(
                        {
                            e: ['hr']
                        },
                        {
                            e: ['h3', this.ThroughoutTheLetsplayHeader(result.resource.resource_type, result.resource.name)]
                        },
                        {
                            e: ['canvas'],
                            a: [[A.Class, 'chart'], [A.Id, chartId], [A.Height, '500'], [A.Style, 'width: 95% !important;']]
                        }
                    );
                }

                if (result.found_at_stats && result.found_at_stats.labels) {
                    const chartId = 'found-at';
                    Resource.chartsData.set(chartId, result.found_at_stats);

                    let width = 95;
                    if (result.found_at_stats.labels.length < 10) {
                        width = result.found_at_stats.labels.length * 10;
                    }

                    chartSections.push(
                        {
                            e: ['hr']
                        },
                        {
                            e: ['h3', `${result.resource.name} was mostly collected from...`]
                        },
                        {
                            e: ['div'],
                            a: [[A.Class, 'doughnut-chart-container']],
                            c: [
                                {
                                    e: ['canvas'],
                                    a: [[A.Class, 'chart'], [A.Id, chartId], [A.Height, '500'], [A.Style, `width: ${width.toString(10)}% !important;`]]
                                }
                            ]
                        }
                    );
                }

                if (result.character_stats) {
                    const chartId = 'char-stats';
                    Resource.chartsData.set(chartId, result.character_stats);

                    chartSections.push(
                        {
                            e: ['hr']
                        },
                        {
                            e: ['h3', this.CharacterRankingHeader(result.resource.resource_type, result.resource.name)]
                        },
                        {
                            e: ['div'],
                            a: [[A.Class, 'doughnut-chart-container']],
                            c: [
                                {
                                    e: ['canvas'],
                                    a: [[A.Class, 'chart'], [A.Id, chartId], [A.Width, '500'], [A.Height, '500']]
                                }
                            ]
                        }
                    );
                }

                if (result.curse_stats) {
                    const chartId = 'curse-stats';
                    Resource.chartsData.set(chartId, result.curse_stats);

                    chartSections.push(
                        {
                            e: ['hr']
                        },
                        {
                            e: ['h3', this.CurseRankingHeader(result.resource.resource_type, result.resource.name)]
                        },
                        {
                            e: ['div'],
                            a: [[A.Class, 'doughnut-chart-container']],
                            c: [
                                {
                                    e: ['canvas'],
                                    a: [[A.Class, 'chart'], [A.Id, chartId], [A.Width, '500'], [A.Height, '500']]
                                }
                            ]
                        }
                    );
                }

                if (result.floor_stats) {
                    const chartId = 'floor-stats';
                    Resource.chartsData.set(chartId, result.floor_stats);
                    
                    chartSections.push(
                        {
                            e: ['hr']
                        },
                        {
                            e: ['h3', this.FloorRankingheader(result.resource.resource_type, result.resource.name)]
                        },
                        {
                            e: ['canvas'],
                            a: [[A.Class, 'chart'], [A.Id, chartId], [A.Height, (50 + ((result.floor_stats.labels?.length ?? 1) * 20)).toString(10)], [A.Style, 'width: 95% !important;']]
                        }
                    );
                }

                if (result.transformation_item_ranking) {
                    const chartId = 'transformation-item-ranking';
                    Resource.chartsData.set(chartId, result.transformation_item_ranking);

                    chartSections.push(
                        {
                            e: ['hr']
                        },
                        {
                            e: ['h3', 'Frequency of Transformation-Relevant Items']
                        },
                        {
                            e: ['div'],
                            a: [[A.Class, 'doughnut-chart-container']],
                            c: [
                                {
                                    e: ['canvas'],
                                    a: [[A.Id, chartId], [A.Class, 'chart'], [A.Width, '500'], [A.Height, '500']]
                                }
                            ]
                        }
                    );
                }

                return {
                    e: ['div'],
                    c: [
                        {
                            e: ['h1'],
                            c: [
                                new IsaacImage(result.resource, undefined, undefined, true),
                                {
                                    e: ['span', ` ${result.resource.name} `]
                                },
                                new IsaacImage(result.resource, undefined, undefined, true)
                            ]
                        },
                        ...chartSections,
                        new VideosComponent(`Videos where "${result.resource.name}" appears:`, undefined, result.resource.resource_type, undefined, undefined, result.resource.id)
                    ]
                };
            })
        };

        return [part];
    }

    InitializeOptions(this: Resource) {
        const promise = new Promise<unknown>(resolve => {
            debugger;
            const resources = Resource.allResources ?? get<Array<IsaacResource>>(`/Api/Resources`);
            const allResourcesSearchbox = new SearchboxComponent<Resource>(this, 9, resources, true);
            allResourcesSearchbox.Subscribe(this.AddComparison);

            if ((resources as any).then) {
                (resources as Promise<Array<IsaacResource> | null>).then(resources => {
                    if (resources) {
                        Resource.allResources = resources;
                    }
                });
            }

            const html = render(allResourcesSearchbox);
            if (html) {
                const container = document.getElementById('searchbox-placeholder');
                if (container) {
                    container.innerHTML = '';
                    container.append(html);
                }
            }

            resolve();
        });

        promise.then(() => Resource.optionsLoaded = true);
    }

    private ThroughoutTheLetsplayHeader(type: ResourceType, name: string): string {
        switch (type) {
            case ResourceType.Boss: return `${name}-Bossfights throughout the Let's Play`;
            case ResourceType.Character: return `${name}-Plays Throughout the Let's Play`;
            case ResourceType.CharacterReroll: return `${name}-Rerolls Throughout the Let's Play`;
            case ResourceType.Curse: return `Floors cursed with '${name}' Throughout the Let's Play`;
            case ResourceType.Enemy: return `Characters that were killed by '${name}'`;
            case ResourceType.Floor: return `${name}-Visits Throughout the Let's Play`;
            case ResourceType.Item: return `${name}-Pickups Throughout the Let's Play`;
            case ResourceType.ItemSource: return `Collected Items from ${name} Throughout the Let's Play`;
            case ResourceType.Pill: return `Swallowed '${name}' Pills Throughout the Let's Play`;
            case ResourceType.Rune: return `Used '${name}'-Runes Throughout the Let's Play`;
            case ResourceType.TarotCard: return `Used '${name}'-Cards Throughout the Let's Play`;
            case ResourceType.Transformation: return `${name}-Transformations Throughout the Let's Play`;
            case ResourceType.Trinket: return `${name}-Uses Throughout the Let's Play`;
            default: return `History for ${name}`;
        }
    }

    private CharacterRankingHeader(type: ResourceType, name: string): string {
        switch (type) {
            case ResourceType.Boss: return `Most ${name}-Fights per Character`;
            case ResourceType.CharacterReroll: return `Most ${name}-Rerolls per Character`;
            case ResourceType.Curse: return `Characters that were cursed by '${name}' most often`;
            case ResourceType.Enemy: return `Characters most often killed by '${name}'`;
            case ResourceType.Floor: return `${name}-Visits per Character`;
            case ResourceType.Item: return `${name}-Pickups per Character`;
            case ResourceType.ItemSource: return `Characters who collected items from ${name} the most`;
            case ResourceType.Pill: return `Characters who took '${name}' the most`;
            case ResourceType.Rune: return `Characters who used '${name}'-Runes the most`;
            case ResourceType.TarotCard: return `Characters who used '${name}'-Cards the most`;
            case ResourceType.Transformation: return `Characters who transformed into ${name} the most`;
            case ResourceType.Trinket: return `Characters who used ${name} most often`;
            default: return `Character Ranking for ${name}`;
        }
    }

    private CurseRankingHeader(type: ResourceType, name: string): string {
        switch (type) {
            case ResourceType.Boss: return `${name}-Bossfights while being cursed`;
            case ResourceType.Character: return `Most frequent Curses while playing as ${name}`;
            case ResourceType.CharacterReroll: return `Most frequest Curses when rerolling the Character with ${name}`;
            case ResourceType.Enemy: return `Most frequent Curses when dying from '${name}'`;
            case ResourceType.Floor: return `Most frequent Curses for ${name}`;
            case ResourceType.Item: return `Most frequent Curses when collecting '${name}'`;
            case ResourceType.ItemSource: return `Most frequent Curses when an item was collected from '${name}'`;
            case ResourceType.Pill: return `Most frequent Curses when swallowing a '${name}'-Pill`;
            case ResourceType.Rune: return `Most frequent Curses when using a '${name}'-Rune`;
            case ResourceType.TarotCard: return `Most frequent Curses when using a '${name}'-Card`;
            case ResourceType.Transformation: return `Most frequent Curses when transforming into ${name}`;
            case ResourceType.Trinket: return `Most frequent Curses when collecting a '${name}'-Trinket`;
            default: return `Curse Ranking for ${name}`;
        }
    }

    private FloorRankingheader(type: ResourceType, name: string): string {
        switch (type) {
            case ResourceType.Boss: return `${name}-Bossfights per floor`;
            case ResourceType.Character: return `Floors who ${name} visited the most`;
            case ResourceType.CharacterReroll: return `Most ${name} Rerolls per Floor`;
            case ResourceType.Curse: return `Floors cursed most often by '${name}'`;
            case ResourceType.Enemy: return `Losses caused by '${name}' per Floor`;
            case ResourceType.Item: return `${name}-Pickups per Floor`;
            case ResourceType.ItemSource: return `Collected Items from ${name} per Floor`;
            case ResourceType.Pill: return `Swallowed '${name}' Pills per Floor`;
            case ResourceType.Rune: return `Used '${name}'-Runes per Floor`;
            case ResourceType.TarotCard: return `Used '${name}'-Cards per Floor`;
            case ResourceType.Transformation: return `${name}-Transformations per Floor`;
            case ResourceType.Trinket: return `${name}-Uses per Floor`;
            default: return `Floor Ranking for ${name}`;
        }
    }

    private ChangeColors(data: ChartData | undefined) {
        if (data && data.datasets) {
            for (let i = 0; i < data.datasets.length; ++i) {
                this.FillDatasetWithRandomColor(data.datasets[i]);
            }
        }
    }

    private ResetPage(e: Event) {
        if (e.target && e.target instanceof HTMLButtonElement) {
            e.target.disabled = true;
        }

        const page = this.CreatePage();
        page[0].P.then(result => {
            const html = render(result);
            if (html) {
                const container = document.getElementById(page[0].I);
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(html);
                }
            }
        }).finally(() => {
            if (e.target && e.target instanceof HTMLButtonElement) {
                e.target.disabled = false;
                Resource.InitalizeCharts();
            }
        });
    }

    private RandomizeChartColors() {
        for (const data of Resource.chartsData) {
            if (data[0] === 'throughout-the-letsplay' || data[0] === 'found-at' || data[0] === 'floor-stats') {
                const datasets = data[1].datasets;
                if (datasets) {
                    for (const d of datasets) {
                        this.FillDatasetWithRandomColor(d);
                    }
                }
            }
        }
        this.UpdateAllCharts();
    }

    private AddComparison(id: string) {
        const historyChart = Resource.chartsData.get('throughout-the-letsplay');
        const foundAtChart = Resource.chartsData.get('found-at');
        const floorChart = Resource.chartsData.get('floor-stats');
        const characterChart = Resource.chartsData.get('char-stats');
        const curseChart = Resource.chartsData.get('curse-stats');

        if (historyChart && historyChart.datasets && historyChart.datasets.length >= 5) {
            return;
        }

        if (historyChart && historyChart.datasets && historyChart.datasets.length === 1) {
            this.ChangeColors(historyChart);
            this.FillDatasetWithRandomColor(historyChart.datasets[0]);
        }
        if (foundAtChart && foundAtChart.datasets && foundAtChart.datasets.length === 1) {
            this.ChangeColors(foundAtChart);
            this.FillDatasetWithRandomColor(foundAtChart.datasets[0]);
        }
        if (floorChart && floorChart.datasets && floorChart.datasets.length === 1) {
            this.ChangeColors(floorChart);
            this.FillDatasetWithRandomColor(floorChart.datasets[0]);
        }

        if (historyChart?.datasets?.length ?? 0 < 5) {
            get<StatsPageResult>(`/Api/Resources/${id}/Stats`).then(result => {
                if (!result) {
                    return;
                }

                if (result.history && result.history.datasets) {
                    const index = result.history.datasets.length - 1;
                    const newData = result.history.datasets[index];
                    this.FillDatasetWithRandomColor(newData);
                    historyChart?.datasets?.push(newData);
                }

                if (result.character_stats && result.character_stats.datasets) {
                    const index = result.character_stats.datasets.length - 1;
                    const newData = result.character_stats.datasets[index];
                    characterChart?.datasets?.push(newData);
                }

                if (result.curse_stats && result.curse_stats.datasets) {
                    const index = result.curse_stats.datasets.length - 1;
                    const newData = result.curse_stats.datasets[index];
                    curseChart?.datasets?.push(newData);
                }

                if (result.floor_stats && result.floor_stats.datasets) {
                    const index = result.floor_stats.datasets.length - 1;
                    const newData = result.floor_stats.datasets[index];
                    this.FillDatasetWithRandomColor(newData);
                    floorChart?.datasets?.push(newData);
                }

                if (result.found_at_stats && result.found_at_stats.datasets) {
                    const index = result.found_at_stats.datasets.length - 1;
                    const newData = result.found_at_stats.datasets[index];
                    this.FillDatasetWithRandomColor(newData);
                    foundAtChart?.datasets?.push(newData);
                }

                this.UpdateAllCharts();
            });
        }
    }

    private UpdateAllCharts() {
        for (const chart of Resource.charts) {
            chart[1].update();
        }
    }

    private ClickOptions(e: Event) {
        if (!Resource.optionsLoaded) {
            return;
        }

        const clickedLink = e.target;
        const showOptionsBox = document.getElementById('chart-options-menu');

        if (clickedLink && clickedLink instanceof HTMLSpanElement && showOptionsBox && showOptionsBox instanceof HTMLDivElement) {
            const openText = 'Show Options';
            const closeText = 'Hide Options';

            const isOpen = clickedLink.innerText === openText;
            clickedLink.innerText = isOpen ? closeText : openText;

            showOptionsBox.style.left = isOpen ? '0' : '-300px';
            showOptionsBox.style.bottom = isOpen ? '0' : '-450px';
        }
    }

    private FillDatasetWithRandomColor(dataSet: ChartDataSets) {
        if (!dataSet.backgroundColor || !Array.isArray(dataSet.backgroundColor) || !Array.isArray(dataSet.borderColor)) {
            console.error('no dataset backgroundColor!', dataSet);
            return;
        }

        const color = this.RandomColor();
        for (let i = 0; i < dataSet.backgroundColor.length; ++i) {
            dataSet.backgroundColor[i] = color;
            dataSet.borderColor[i] = color;
        }
    }

    private RandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    private ToggleBackground() {
        if (this.backgroundVisible) {
            Resource.HideBackground();
        } else {
            Resource.ShowBackground();
        }
        this.backgroundVisible = !this.backgroundVisible;
    }

    static ShowBackground() {
        document.body.style.backgroundImage = Resource.originalBodyBackground;
    }

    static HideBackground() {
        document.body.style.backgroundImage = 'none';
    }

    static InitalizeCharts() {
        for (const chartData of Resource.chartsData) {
            const id = chartData[0];
            const chart = chartData[1];

            if (!chart.labels?.length) {
                continue;
            }

            const canvas = document.getElementById(id);

            if (canvas && canvas instanceof HTMLCanvasElement) {
                const canvasContext = canvas.getContext('2d');
                if (canvasContext) {
                    let chartType = 'doughnut';
                    if (id === 'throughout-the-letsplay' || id === 'found-at') {
                        chartType = 'bar';
                    } else if (id === 'floor-stats') {
                        chartType = 'horizontalBar';
                    }

                    Resource.charts.set(id, new Chart(canvasContext, {
                        data: chart,
                        type: chartType,
                        options: {
                            scales: {
                                xAxes: [{
                                    ticks: {
                                        autoSkip: false,
                                        beginAtZero: true,
                                        display: chartType === 'doughnut' ? false : true
                                    }
                                }]
                            },
                            responsive: false,
                            maintainAspectRatio: false
                        }
                    }));
                }
            }
        }
    }

    static RegisterPage() {
        const page: PageData = {
            Component: Resource,
            Title: 'Loading resource...',
            Url: ['{ResourceId}'],
            specificPageType: PageType.IsaacResource,
            afterRender: () => {
                debugger;
                Resource.InitalizeCharts();
                (page.Component as new() => Resource).prototype.InitializeOptions();
            },
            beforeLeaving: () => Resource.ShowBackground()
        };
        registerPage(page);
    }
}

(() => {
    setOnLoadPageType(PageType.IsaacResource);
    Resource.RegisterPage();
    initRouter();
})();

