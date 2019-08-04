import { SearchBox } from './components/searchbox';
import { Chart } from 'chart.js';
import { setIsaacResourceName } from './lib/dom-operations';

let historyChart: any = null;
let foundAtChart: any = null;
let characterChart: any = null;
let curseChart: any = null;
let floorChart: any = null;
let transformationItemRankingChart: any = null;

let compareSearchComponent: SearchBox | null = null;
let idsInChart: Array<string> = new Array<string>();
let originalBodyBackground = (' ' + getComputedStyle(document.body).backgroundImage as string).slice(1);

const changeColorButton = document.getElementById('change-colors');
const hideBackgroundButton = document.getElementById('hide-background');

const showOptionsBox = document.getElementById('chart-options-menu');
const showOptionsLink = document.getElementById('chart-options-link');
let showOptions = false;
let canChangeOptions = true;

const addComparison = (id: string) => {
    // update colors if only 1 dataset exists
    if (historyChart && historyChart.data.datasets.length === 1) {
        fillDatasetWithRandomColor(historyChart.data.datasets[0]);
    }
    if (foundAtChart && foundAtChart.data.datasets.length === 1) {
        fillDatasetWithRandomColor(foundAtChart.data.datasets[0]);
    }
    if (floorChart && floorChart.data.datasets.length === 1) {
        fillDatasetWithRandomColor(floorChart.data.datasets[0]);
    }

    // get data, update charts with available data
    if (historyChart && historyChart.data.datasets.length < 5) {
        fetch(`/api/resources/${id}/Stats`).then(x => x.json()).then(result => {
            historyChart.data.datasets.push(result.history.datasets[0]);
            fillDatasetWithRandomColor(historyChart.data.datasets[historyChart.data.datasets.length - 1]);
            historyChart.update();

            if (foundAtChart && result.found_at_stats) {
                debugger;
                foundAtChart.data.datasets.push(result.found_at_stats.datasets[0]);
                fillDatasetWithRandomColor(foundAtChart.data.datasets[foundAtChart.data.datasets.length - 1]);
                foundAtChart.update();
            }
            if (characterChart && result.character_stats) {
                characterChart.data.datasets.push(result.character_stats.datasets[0]);
                characterChart.update();
            }
            if (curseChart && result.curse_stats) {
                curseChart.data.datasets.push(result.curse_stats.datasets[0]);
                curseChart.update();
            }
            if (floorChart && result.floor_stats) {
                floorChart.data.datasets.push(result.floor_stats.datasets[0]);
                floorChart.update();
            }
            
            if (transformationItemRankingChart && result.transformation_item_ranking) {
                // cannot update transformation item ranking chart, items cannot be compared in the same chart!
                // transformationItemRankingChart.data.datasets.push(result.transformation_item_ranking.datasets[0]);
            }
        });
    }
};

const fillDatasetWithRandomColor = (dataSet: any) => {
    console.log('dataSet is ', dataSet);
    if (!dataSet || !dataSet.backgroundColor) {
        debugger;
    }
    const color = randomColor();
    for (let i = 0; i < dataSet.backgroundColor.length; i++) {
        dataSet.backgroundColor[i] = color;
        dataSet.borderColor[i] = color;
    }
}

const randomColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const initializeHideBackgroundButton = () => {
    if (hideBackgroundButton) {
        hideBackgroundButton.addEventListener('click', () => {
            const style = getComputedStyle(document.body).backgroundImage;
            console.log('style is ', style);
            if (style !== 'none') {
                hideBackgroundButton.innerText = 'Show Background';
                document.body.style.backgroundImage = 'none';
            } else {
                document.body.style.backgroundImage = originalBodyBackground;
                hideBackgroundButton.innerText = 'Hide Background';
            }
        });
    }
}

const initializeShowOptionsLink = () => {
    if (showOptionsLink && showOptionsBox) {
        showOptionsLink.addEventListener('click', () => {
            if (canChangeOptions) {
                // initialize comparison window
                if (compareSearchComponent === null) {
                    compareSearchComponent = new SearchBox("compare-to-searchbox", fetch(`/api/resources`).then(response => response.json()));
                    compareSearchComponent.elementWasSelected.subscribe(id => {
                        if (idsInChart.indexOf(id) === -1) {
                            idsInChart.push(id);
                            addComparison(id);
                        }
                    });
                }

                // change button text
                showOptionsLink.innerText = showOptions ? 'Show Options' : 'Hide Options';

                // change window size
                showOptions = !showOptions;
                canChangeOptions = false;
                showOptionsBox.style.left = showOptions ? '0' : '-300px';
                showOptionsBox.style.bottom = showOptions ? '0' : '-450px';
                setTimeout(() => canChangeOptions = true, 200);
            }
        });
    }
}


const changeColors = (): void => {
    if (foundAtChart) {
        for (let i = 0; i < foundAtChart.data.datasets.length; i++) {
            fillDatasetWithRandomColor(foundAtChart.data.datasets[i]);
        }
        foundAtChart.update();
    }
    if (historyChart) {
        for (let i = 0; i < historyChart.data.datasets.length; i++) {
            fillDatasetWithRandomColor(historyChart.data.datasets[i]);
        }
        historyChart.update();
    }
    if (floorChart) {
        for (let i = 0; i < floorChart.data.datasets.length; i++) {
            fillDatasetWithRandomColor(floorChart.data.datasets[i]);
        }
        floorChart.update();
    }
}

const initializeResetChartButton = () => {
    const resetButton = document.getElementById('reset-chart');
    if (resetButton) {
        resetButton.addEventListener('click', e => {
            (e.target as HTMLButtonElement).disabled = true;
            e.stopPropagation();
            e.preventDefault();
            fetchInitialChartData().then(result => {
                historyChart.data = result.history;
                historyChart.update();

                if (result.found_at_stats) {
                    foundAtChart.data = result.found_at_stats;
                    foundAtChart.update();
                }
                if (result.character_stats) {
                    characterChart.data = result.character_stats;
                    characterChart.update();
                }
                
                idsInChart.splice(1, idsInChart.length - 1);
                (e.target as HTMLButtonElement).disabled = false;
            });
        });
    }
}

const initializeChangeColorButton = () => {
    if (changeColorButton) {
        changeColorButton.addEventListener('click', () => {
            changeColors();
        });
    }
}

const fetchInitialChartData = () => {
    const resourceId = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
    setIsaacResourceName(resourceId);
    idsInChart = new Array<string>(resourceId);
    return fetch(`/api/resources/${resourceId}/Stats`).then(x => x.json());
}

(() => {
    console.log(originalBodyBackground);
    initializeHideBackgroundButton();
    initializeResetChartButton();
    initializeChangeColorButton();
    initializeShowOptionsLink();

    fetchInitialChartData().then(result => {
        console.log('result is', result);
        const historyCanvas = document.getElementById('throughout-the-letsplay');
        const foundAtCanvas = document.getElementById('found-at-ranking');
        const characterCanvas = document.getElementById('character-ranking');
        const curseCanvas = document.getElementById('curse-ranking');
        const floorCanvas = document.getElementById('floor-ranking');
        const transformationItemRankingCanvas = document.getElementById('transformation-item-ranking');

        // initialize history chart
        if (historyCanvas && historyCanvas instanceof HTMLCanvasElement) {
            historyChart = new Chart(historyCanvas, {
                type: 'bar',
                data: result.history,
                options: {
                    scales: {
                        xAxes: [{
                            ticks: {
                                autoSkip: false,
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }

        // initialize 'found at' chart
        if (foundAtCanvas && foundAtCanvas instanceof HTMLCanvasElement) {
            foundAtChart = new Chart(foundAtCanvas, {
                type: 'bar',
                data: result.found_at_stats,
                options: {
                    scales: {
                        xAxes: [{
                            ticks: {
                                autoSkip: false,
                                beginAtZero: true
                            }
                        }]
                    },
                    maintainAspectRatio: false,
                    responsive: true
                }
            });
        }

        // initialize 'character ranking' chart
        if (characterCanvas && characterCanvas instanceof HTMLCanvasElement) {
            characterChart = new Chart(characterCanvas, {
                type: 'doughnut',
                data: result.character_stats,
                options: {
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero: true,
                                autoSkip: false
                            }
                        }]
                    },
                    maintainAspectRatio: false,
                    responsive: true
                }
            });
        }

        // initialize 'curse ranking' chart
        if (curseCanvas && curseCanvas instanceof HTMLCanvasElement) {
            curseChart = new Chart(curseCanvas, {
                type: 'doughnut',
                data: result.curse_stats,
                options: {
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero: true,
                                autoSkip: false
                            }
                        }]
                    },
                    maintainAspectRatio: false,
                    responsive: true
                }
            });
        }

        // initialize 'floor ranking' chart
        if (floorCanvas && floorCanvas instanceof HTMLCanvasElement) {
            floorChart = new Chart(floorCanvas, {
                type: 'horizontalBar',
                data: result.floor_stats,
                options: {
                    scales: {
                        xAxes: [{
                            barPercentage: 0.8,
                            ticks: {
                                beginAtZero: true,
                                autoSkip: false
                            }
                        }]
                    },
                    maintainAspectRatio: true,
                    responsive: true
                }
            });
        }

        // initialize 'transformation item ranking' chart
        if (transformationItemRankingCanvas && transformationItemRankingCanvas instanceof HTMLCanvasElement) {
            transformationItemRankingChart = new Chart(transformationItemRankingCanvas, {
                type: 'doughnut',
                data: result.transformation_item_ranking,
                options: {
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero: true,
                                autoSkip: false
                            }
                        }]
                    },
                    maintainAspectRatio: false,
                    responsive: true
                }
            });
        }
    });
})();