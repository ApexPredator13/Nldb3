import { Render, Div, div, h3, canvas, attr, hr, cl, h1, span, t, p, button, br } from "../Framework/renderer";
import { registerPage, setOnLoadPageType, initRouter, setTitle, PAGE_TYPE_ISAAC_RESOURCE } from "../Framework/router";
import { get } from "../Framework/http";
import { isaacImage } from "../Components/General/isaac-image";
import { ChartData, Chart } from "chart.js";
import { Videos } from "../Components/General/renderVideos";

let chartsData, charts, originalBodyBackground, backgroundVisible, optionsLoaded, resourceId, allResources;
const pageContainerId = 'page-container';

function resourcePage(parameters) {

    resourceId = parameters[0];
    charts = new Map();
    chartsData = new Map();
    backgroundVisible = true;
    optionsLoaded = false;

    if (!originalBodyBackground) {
        originalBodyBackground = (' ' + getComputedStyle(document.body).backgroundImage).slice(1);
    }

    new Render([
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

    createPage()
        .then(() => initializeCharts())
        .then(() => initializeOptions());
}


function getAllResources() {
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
}

function initializeOptions() {
    getAllResources.then(resources => {
        renderSearchbox(addComparison, 1, resources, true);
    }).then(() => optionsLoaded = true);
}


function throughoutTheLetsplayHeader(type, name) {
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
}

function characterRankingHeader(type, name) {
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
}

function curseRankingHeader(type, name) {
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
}

function floorRankingHeader(type, name) {
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
}


function createPage() {
    return new Promise(resolve => {
        get(`/Api/Resources/${resourceId}/Stats`).then(result => {
            if (!result) {
                new Render([
                    Div(t('Resource not found.'))
                ]);
                return;
            }

            setTitle(result.resource.name);

            const chartSections = [];

            if (result.history) {
                const chartId = 'throughout-the-letsplay';
                Resource.chartsData.set(chartId, result.history);

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
                Resource.chartsData.set(chartId, result.found_at_stats);

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
                Resource.chartsData.set(chartId, result.character_stats);

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
                Resource.chartsData.set(chartId, result.curse_stats);

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
                Resource.chartsData.set(chartId, result.floor_stats);

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
                Resource.chartsData.set(chartId, result.transformation_item_ranking);

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

            new Render([
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
};


function resetPage(e) {
    e.target.disabled = true;
    createPage().then(() => {
        initializeCharts();
        e.target.disabled = false;
    });
}


function randomizeChartColors() {
    for (const data of chartsData) {
        if (data[0] === 'throughout-the-letsplay' || data[0] === 'found-at' || data[0] === 'floor-stats') {
            const datasets = data[1].datasets;
            if (datasets) {
                for (const d of datasets) {
                    fillDatasetWithRandomColor(d);
                }
            }
        }
    }

    updateAllCharts();
}


function changeColors(data) {
    if (data && data.datasets) {
        for (let i = 0; i < data.datasets.length; ++i) {
            fillDatasetWithRandomColor(data.datasets[i]);
        }
    }
}

function addComparison() {
    const historyChart = chartsData.get('throughout-the-letsplay');
    const foundAtChart = chartsData.get('found-at');
    const floorChart = chartsData.get('floor-stats');
    const characterChart = chartsData.get('char-stats');
    const curseChart = chartsData.get('curse-stats');

    if (historyChart && historyChart.datasets && historyChart.datasets.length >= 5) {
        return;
    }

    if (historyChart && historyChart.datasets && historyChart.datasets.length === 1) {
        changeColors(historyChart);
        tfillDatasetWithRandomColor(historyChart.datasets[0]);
    }
    if (foundAtChart && foundAtChart.datasets && foundAtChart.datasets.length === 1) {
        changeColors(foundAtChart);
        fillDatasetWithRandomColor(foundAtChart.datasets[0]);
    }
    if (floorChart && floorChart.datasets && floorChart.datasets.length === 1) {
        changeColors(floorChart);
        fillDatasetWithRandomColor(floorChart.datasets[0]);
    }

    if (historyChart.datasets.length < 5) {
        get(`/Api/Resources/${id}/Stats`).then(result => {
            if (!result) {
                return;
            }

            if (result.history && result.history.datasets) {
                const index = result.history.datasets.length - 1;
                const newData = result.history.datasets[index];
                fillDatasetWithRandomColor(newData);
                historyChart.datasets.push(newData);
            }

            if (result.character_stats && result.character_stats.datasets) {
                const index = result.character_stats.datasets.length - 1;
                const newData = result.character_stats.datasets[index];
                characterChart.datasets.push(newData);
            }

            if (result.curse_stats && result.curse_stats.datasets) {
                const index = result.curse_stats.datasets.length - 1;
                const newData = result.curse_stats.datasets[index];
                curseChart.datasets.push(newData);
            }

            if (result.floor_stats && result.floor_stats.datasets) {
                const index = result.floor_stats.datasets.length - 1;
                const newData = result.floor_stats.datasets[index];
                this.FillDatasetWithRandomColor(newData);
                floorChart.datasets.push(newData);
            }

            if (result.found_at_stats && result.found_at_stats.datasets) {
                const index = result.found_at_stats.datasets.length - 1;
                const newData = result.found_at_stats.datasets[index];
                this.FillDatasetWithRandomColor(newData);
                foundAtChart.datasets.push(newData);
            }

            updateAllCharts();
        });
    }
}


function initializeCharts() {
    for (const chartData of chartsData) {
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

        charts.set(id, new Chart(canvasContext, {
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

function updateAllCharts() {
    for (const chart of charts) {
        chart[1].update();
    }
}

function clickOptions(e) {
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
}

function fillDatasetWithRandomColor(dataSet) {
    if (!dataSet.backgroundColor || !Array.isArray(dataSet.backgroundColor) || !Array.isArray(dataSet.borderColor)) {
        console.error('no dataset backgroundColor!', dataSet);
        return;
    }

    const color = randomColor();
    for (let i = 0; i < dataSet.backgroundColor.length; ++i) {
        dataSet.backgroundColor[i] = color;
        dataSet.borderColor[i] = color;
    }
}

function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function toggleBackground() {
    if (backgroundVisible) {
        hideBackground();
    } else {
        showBackground();
    }
    backgroundVisible = !backgroundVisible;
}

function hideBackground() {
    document.body.style.backgroundImage = 'none';
}

function showBackground() {
    document.body.style.backgroundImage = originalBodyBackground;
}

function registerResourcePage() {
    registerPage(resourcePage, 'Loading Resource...', ['{id}'], undefined, undefined, showBackground)
}

export {
    resourcePage,
    registerResourcePage
}

(() => {
    setOnLoadPageType(PAGE_TYPE_ISAAC_RESOURCE);
    registerResourcePage();
    initRouter();
})();

