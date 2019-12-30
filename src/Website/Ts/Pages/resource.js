import { Html, Div, div, h3, canvas, attr, hr, cl, h1, span, t, p, button, br, id, event } from "../Framework/renderer";
import { registerPage, setOnLoadPageType, initRouter, setTitle, PAGE_TYPE_ISAAC_RESOURCE } from "../Framework/router";
import { get } from "../Framework/http";
import { isaacImage } from "../Components/General/isaac-image";
import { Chart } from "chart.js";
import { Videos } from "../Components/General/Videos";
import "../Framework/Customizable/typedefs.js"

let originalBodyBackground, backgroundVisible, optionsLoaded, resourceId, allResources;
const pageContainerId = 'page-container';

/**
 * Displays stats about any resource in the binding of isaac
 * @param {string[]} parameters - route parameters. parameters[0] is the resource ID
 */
function ResourcePage(parameters) {

    this.resourceId = parameters[0];
    this.charts = new Map();
    this.chartsData = new Map();
    this.backgroundVisible = true;
    this.optionsLoaded = false;

    if (!originalBodyBackground) {
        originalBodyBackground = (' ' + getComputedStyle(document.body).backgroundImage).slice(1);
    }
}


ResourcePage.prototype = {

    /** starts rendering the page, the calls the server for data and renders the charts */
    renderPage: function () {
        new Html([
            Div(
                div(
                    id(pageContainerId),
                    t('loading...')
                ),
                div(
                    id('chart-options-menu'),
                    span(
                        t('Show Options'),
                        id('chart-options-link'),
                        event('click', clickOptions)
                    ),
                    div(
                        id('chart-options-box-container'),

                        div(
                            p(
                                t('Compare to...')
                            ),
                            div(
                                id('searchbox-placeholder')
                            )
                        ),
                        div(
                            button(
                                t('Randomize Bar-Colors'),
                                id('change-colors'),
                                cl('btn-green'),
                                event('click', randomizeChartColors)
                            ),
                            br(),
                            br(),
                            button(
                                t('Toggle Background'),
                                id('hide-background'),
                                cl('btn-green'),
                                event('click', toggleBackground)
                            ),
                            br(),
                            br(),
                            button(
                                t('Reset Page'),
                                id('reset-chart'),
                                cl('btn-red'),
                                event('click', e => resetPage(e))
                            )
                        )
                    )
                )
            )
        ]);

        this.prepareCharts()
            .then(() => this.initializeCharts())
            .then(() => this.initializeOptions());
    },


    /** loads the options menu in the bottom left */
    initializeOptions: function () {
        this.getAllResources.then(resources => {
            this.renderSearchbox(addComparison, 1, resources, true);
        }).then(() => optionsLoaded = true);
    },


    /** 
     * loads all isaac resources, caches them, then returns them 
     * @returns {Promise<IsaacResource[]>}
     */
    getAllResources: function () {
        return new Promise(resolve => {

            if (allResources) {
                resolve(allResources);
            } else {
                get(`/Api/Resources`).then(resources => {
                    allResources = resources;
                    resolve(resources);
                });
            }
        });
    },


    /**
     * creates the header text based on type
     * @param {number} type
     * @param {string} name
     * @returns {string}
     */
    throughoutTheLetsplayHeader: function (type, name) {
        switch (type) {
            case 1: return `${name}-Bossfights throughout the Let's Play`;
            case 2: return `${name}-Plays Throughout the Let's Play`;
            case 14: return `${name}-Rerolls Throughout the Let's Play`;
            case 3: return `Floors cursed with '${name}' Throughout the Let's Play`;
            case 11: return `Characters that were killed by '${name}'`;
            case 5: return `${name}-Visits Throughout the Let's Play`;
            case 6: return `${name}-Pickups Throughout the Let's Play`;
            case 7: return `Collected Items from ${name} Throughout the Let's Play`;
            case 8: return `Swallowed '${name}' Pills Throughout the Let's Play`;
            case 9: return `Used '${name}'-Runes Throughout the Let's Play`;
            case 10: return `Used '${name}'-Cards Throughout the Let's Play`;
            case 12: return `${name}-Transformations Throughout the Let's Play`;
            case 13: return `${name}-Uses Throughout the Let's Play`;
            default: return `History for ${name}`;
        }
    },


    /**
     * creates the character ranking header text based on resource type
     * @param {number} type
     * @param {string} name
     * @returns {string}
     */
    characterRankingHeader: function (type, name) {
        switch (type) {
            case 1: return `Most ${name}-Fights per Character`;
            case 14: return `Most ${name}-Rerolls per Character`;
            case 3: return `Characters that were cursed by '${name}' most often`;
            case 11: return `Characters most often killed by '${name}'`;
            case 5: return `${name}-Visits per Character`;
            case 6: return `${name}-Pickups per Character`;
            case 7: return `Characters who collected items from ${name} the most`;
            case 8: return `Characters who took '${name}' the most`;
            case 9: return `Characters who used '${name}'-Runes the most`;
            case 10: return `Characters who used '${name}'-Cards the most`;
            case 12: return `Characters who transformed into ${name} the most`;
            case 13: return `Characters who used ${name} most often`;
            default: return `Character Ranking for ${name}`;
        }
    },


    /**
     * creates the header for the curse ranking based on resource type
     * @param {number} type
     * @param {string} name
     * @returns {string}
     */
    curseRankingHeader: function (type, name) {
        switch (type) {
            case 1: return `${name}-Bossfights while being cursed`;
            case 2: return `Most frequent Curses while playing as ${name}`;
            case 14: return `Most frequest Curses when rerolling the Character with ${name}`;
            case 11: return `Most frequent Curses when dying from '${name}'`;
            case 5: return `Most frequent Curses for ${name}`;
            case 6: return `Most frequent Curses when collecting '${name}'`;
            case 7: return `Most frequent Curses when an item was collected from '${name}'`;
            case 8: return `Most frequent Curses when swallowing a '${name}'-Pill`;
            case 9: return `Most frequent Curses when using a '${name}'-Rune`;
            case 10: return `Most frequent Curses when using a '${name}'-Card`;
            case 12: return `Most frequent Curses when transforming into ${name}`;
            case 13: return `Most frequent Curses when collecting a '${name}'-Trinket`;
            default: return `Curse Ranking for ${name}`;
        }
    },


    /**
     * creates the floor ranking header text based on resource type
     * @param {number} type
     * @param {string} name
     * @returns {string}
     */
    floorRankingHeader: function (type, name) {
        switch (type) {
            case 1: return `${name}-Bossfights per floor`;
            case 2: return `Floors who ${name} visited the most`;
            case 14: return `Most ${name} Rerolls per Floor`;
            case 3: return `Floors cursed most often by '${name}'`;
            case 11: return `Losses caused by '${name}' per Floor`;
            case 6: return `${name}-Pickups per Floor`;
            case 7: return `Collected Items from ${name} per Floor`;
            case 8: return `Swallowed '${name}' Pills per Floor`;
            case 9: return `Used '${name}'-Runes per Floor`;
            case 10: return `Used '${name}'-Cards per Floor`;
            case 12: return `${name}-Transformations per Floor`;
            case 13: return `${name}-Uses per Floor`;
            default: return `Floor Ranking for ${name}`;
        }
    },


    /** 
     *  prepares page and charts for data
     *  @returns {Promise<void>}
     */
    prepareCharts: function () {
        return new Promise(resolve => {
            get(`/Api/Resources/${resourceId}/Stats`).then(result => {
                if (!result) {
                    new Html([
                        Div(t('Resource not found.'))
                    ]);
                    return;
                }

                setTitle(result.resource.name);

                const chartSections = [];

                if (result.history) {
                    debugger;
                    const chartId = 'throughout-the-letsplay';
                    this.chartsData.set(chartId, result.history);

                    chartSections.push(
                        hr(),
                        h3(
                            t(throughoutTheLetsplayHeader(result.resource.resource_type, result.resource.name))
                        ),
                        canvas(
                            attr({ class: 'chart', id: chartId, height: '500', style: 'width: 95% !important' })
                        )
                    );
                }

                if (result.found_at_stats && result.found_at_stats.labels) {
                    const chartId = 'found-at';
                    this.chartsData.set(chartId, result.found_at_stats);

                    let width = 95;
                    if (result.found_at_stats.labels.length < 10) {
                        width = result.found_at_stats.labels.length * 10;
                    }

                    chartSections.push(
                        hr(),
                        h3(
                            t(`${result.resource.name} was mostly collected from...`)
                        ),
                        div(
                            cl('doughnut-chart-container'),
                            canvas(
                                attr({ class: 'chart', id: chartId, height: '500', style: `width: ${width.toString(10)}% !important` })
                            )
                        )
                    );
                }

                if (result.character_stats) {
                    const chartId = 'char-stats';
                    this.chartsData.set(chartId, result.character_stats);

                    chartSections.push(
                        hr(),
                        h3(
                            t(characterRankingHeader(result.resource.resource_type, result.resource.name))
                        ),
                        div(
                            cl('doughnut-chart-container'),
                            canvas(
                                attr({ class: 'chart', id: chartId, width: '500', height: '500' })
                            )
                        )
                    );
                }

                if (result.curse_stats) {
                    const chartId = 'curse-stats';
                    this.chartsData.set(chartId, result.curse_stats);

                    chartSections.push(
                        hr(),
                        h3(
                            t(curseRankingHeader(result.resource.resource_type, result.resource.name))
                        ),
                        div(
                            cl('doughnut-chart-container'),
                            canvas(
                                attr({ class: 'chart', id: chartId, width: '500', height: '500' })
                            )
                        )
                    );
                }

                if (result.floor_stats) {
                    const chartId = 'floor-stats';
                    this.chartsData.set(chartId, result.floor_stats);

                    chartSections.push(
                        hr(),
                        h3(
                            t(floorRankingHeader(result.resource.resource_type, result.resource.name))
                        ),
                        canvas(
                            attr({ class: 'chart', id: chartId, height: (50 + ((result.floor_stats.labels.length || 1) * 20)).toString(10), style: 'width: 95% !important;' })
                        )
                    );
                }

                if (result.transformation_item_ranking) {
                    const chartId = 'transformation-item-ranking';
                    this.chartsData.set(chartId, result.transformation_item_ranking);

                    chartSections.push(
                        hr(),
                        h3(
                            t('Frequency of Transformation-Relevant Items')
                        ),
                        div(
                            cl('doughnut-chart-container'),
                            canvas(
                                attr({ id: chartId, class: 'chart', width: '500', height: '500' })
                            )
                        )
                    );
                }

                new Html([
                    Div(
                        h1(
                            isaacImage(result.resource, null, true),
                            span(t(result.resource.name)),
                            isaacImage(result.resource, null, true),
                        ),
                        ...chartSections,
                        div(id('videos-container'))
                    )
                ], pageContainerId);

                Videos('videos-container', `Videos where "${result.resource.name}" appears:`, undefined, result.resource.resource_type, undefined, undefined, result.resource.id);

                resolve();
            });
        });
    },


    /**
     * resets the page completely
     * @param {Event} e - the raw button click event
     */
    resetPage: function (e) {
        e.target.disabled = true;
        createPage().then(() => {
            initializeCharts();
            e.target.disabled = false;
        });
    },


    /** if resource comparisons are on the page, colors datasets randomly */
    randomizeChartColors: function () {
        for (const data of this.chartsData) {
            if (data[0] === 'throughout-the-letsplay' || data[0] === 'found-at' || data[0] === 'floor-stats') {
                const datasets = data[1].datasets;
                if (datasets) {
                    for (const d of datasets) {
                        this.fillDatasetWithRandomColor(d);
                    }
                }
            }
        }

        this.updateAllCharts();
    },


    /**
     * changes color for a chart.js dataset
     * @param {import("chart.js").ChartData} data
     */
    changeColors: function (data) {
        if (data && data.datasets) {
            for (let i = 0; i < data.datasets.length; ++i) {
                fillDatasetWithRandomColor(data.datasets[i]);
            }
        }
    },


    /** adds the dataset of another resources to all charts on the page */
    addComparison: function () {
        const historyChart = this.chartsData.get('throughout-the-letsplay');
        const foundAtChart = this.chartsData.get('found-at');
        const floorChart = this.chartsData.get('floor-stats');
        const characterChart = this.chartsData.get('char-stats');
        const curseChart = this.chartsData.get('curse-stats');

        if (historyChart && historyChart.datasets && historyChart.datasets.length >= 5) {
            return;
        }

        if (historyChart && historyChart.datasets && historyChart.datasets.length === 1) {
            this.changeColors(historyChart);
            this.fillDatasetWithRandomColor(historyChart.datasets[0]);
        }
        if (foundAtChart && foundAtChart.datasets && foundAtChart.datasets.length === 1) {
            this.changeColors(foundAtChart);
            this.fillDatasetWithRandomColor(foundAtChart.datasets[0]);
        }
        if (floorChart && floorChart.datasets && floorChart.datasets.length === 1) {
            this.changeColors(floorChart);
            this.fillDatasetWithRandomColor(floorChart.datasets[0]);
        }

        if (historyChart.datasets.length < 5) {
            get(`/Api/Resources/${id}/Stats`).then(result => {
                if (!result) {
                    return;
                }

                if (result.history && result.history.datasets) {
                    const index = result.history.datasets.length - 1;
                    const newData = result.history.datasets[index];
                    this.fillDatasetWithRandomColor(newData);
                    this.historyChart.datasets.push(newData);
                }

                if (result.character_stats && result.character_stats.datasets) {
                    const index = result.character_stats.datasets.length - 1;
                    const newData = result.character_stats.datasets[index];
                    this.characterChart.datasets.push(newData);
                }

                if (result.curse_stats && result.curse_stats.datasets) {
                    const index = result.curse_stats.datasets.length - 1;
                    const newData = result.curse_stats.datasets[index];
                    this.curseChart.datasets.push(newData);
                }

                if (result.floor_stats && result.floor_stats.datasets) {
                    const index = result.floor_stats.datasets.length - 1;
                    const newData = result.floor_stats.datasets[index];
                    this.fillDatasetWithRandomColor(newData);
                    this.floorChart.datasets.push(newData);
                }

                if (result.found_at_stats && result.found_at_stats.datasets) {
                    const index = result.found_at_stats.datasets.length - 1;
                    const newData = result.found_at_stats.datasets[index];
                    this.fillDatasetWithRandomColor(newData);
                    this.foundAtChart.datasets.push(newData);
                }

                this.updateAllCharts();
            });
        }
    },


    /** draws initial charts for the resource */
    initializeCharts: function () {
        for (const chartData of this.chartsData) {
            const id = chartData[0];
            const chart = chartData[1];

            if (!chart.labels.length) {
                continue;
            }

            const canvasContext = document.getElementById(id).getContext('2d');

            let chartType = 'doughnut';
            if (id === 'throughout-the-letsplay' || id === 'found-at') {
                chartType = 'bar';
            } else if (id === 'floor-stats') {
                chartType = 'horizontalBar';
            }

            this.charts.set(id, new Chart(canvasContext, {
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
    },


    /** calls the chart.js 'update()' function on all charts on the page */
    updateAllCharts: function() {
        for (const chart of this.charts) {
            chart[1].update();
        }
    },


    /**
     * expands the options window from the bottom right
     * @param {Event} e - the raw click event
     */
    clickOptions: function(e) {
        if (!optionsLoaded) {
            return;
        }

        const clickedLink = e.target;
        const showOptionsBox = document.getElementById('chart-options-menu');

        const openText = 'Show Options';
        const closeText = 'Hide Options';

        const isOpen = clickedLink.innerText === openText;
        clickedLink.innerText = isOpen ? closeText : openText;

        showOptionsBox.style.left = isOpen ? '0' : '-300px';
        showOptionsBox.style.bottom = isOpen ? '0' : '-450px';
    },


    /**
     * fills a chart.js dataset with a random color
     * @param {import("chart.js").ChartDataSets} dataSet
     */
    fillDatasetWithRandomColor: function (dataSet) {
        if (!dataSet.backgroundColor || !Array.isArray(dataSet.backgroundColor) || !Array.isArray(dataSet.borderColor)) {
            console.error('no dataset backgroundColor!', dataSet);
            return;
        }

        const color = randomColor();
        for (let i = 0; i < dataSet.backgroundColor.length; ++i) {
            dataSet.backgroundColor[i] = color;
            dataSet.borderColor[i] = color;
        }
    },


    /** creates a random color */
    randomColor: function () {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },


    /** switches the background image on or off */
    toggleBackground: function () {
        if (this.backgroundVisible) {
            this.hideBackground();
        } else {
            this.showBackground();
        }
        this.backgroundVisible = !this.backgroundVisible;
    },


    /** hides the background image */
    hideBackground: function () {
        document.body.style.backgroundImage = 'none';
    },


    /** displays the background image */
    showBackground: function () {
        document.body.style.backgroundImage = originalBodyBackground;
    }
}





function registerResourcePage() {
    registerPage(ResourcePage, 'Loading Resource...', ['{resourceId}'], PAGE_TYPE_ISAAC_RESOURCE, () => { document.body.style.backgroundImage = originalBodyBackground; })
}

export {
    ResourcePage,
    registerResourcePage
}

(() => {
    setOnLoadPageType(PAGE_TYPE_ISAAC_RESOURCE);
    registerResourcePage();
    initRouter();
})();

