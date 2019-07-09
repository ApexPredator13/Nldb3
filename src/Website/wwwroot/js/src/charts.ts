import { SearchBox } from './components/searchbox';
import { IsaacResource } from './interfaces/isaac-resource';

declare const Chart: any;

let historyChart: any = null;
let foundAtChart: any = null;
let characterChart: any = null;
let curseChart: any = null;

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
    // randomize colors
    if (historyChart.data.datasets.length === 1) {
        fillDatasetWithRandomColor(historyChart.data.datasets[0]);
    }
    if (foundAtChart.data.datasets.length === 1) {
        fillDatasetWithRandomColor(foundAtChart.data.datasets[0]);
    }

    if (historyChart.data.datasets.length < 5) {
        fetch(`/api/resources/${id}/Stats`).then(x => x.json()).then(result => {
            historyChart.data.datasets.push(result.history.datasets[0]);
            historyChart.update();
            fillDatasetWithRandomColor(historyChart.data.datasets[historyChart.data.datasets.length - 1]);

            if (result.found_at_stats) {
                foundAtChart.data.datasets.push(result.found_at_stats.datasets[0]);
                foundAtChart.update();
                fillDatasetWithRandomColor(foundAtChart.data.datasets[foundAtChart.data.datasets.length - 1]);
            }
            if (result.character_stats) {
                characterChart.data.datasets.push(result.character_stats.datasets[0]);
                characterChart.update();
            }
        });
    }

    // update 'found at' chart
    if (foundAtChart.data.datasets.length === 1) {
        fillDatasetWithRandomColor(foundAtChart.data.datasets[0]);
    }
};

const fillDatasetWithRandomColor = (dataSet: any) => {
    console.log('dataSet is ', dataSet);
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
                    compareSearchComponent = new SearchBox("comparison-dd");
                    compareSearchComponent.elementWasSelected.subscribe(id => {
                        if (idsInChart.indexOf(id) === -1) {
                            idsInChart.push(id);
                            addComparison(id);
                        }
                    });
                    fetch(`/api/resources`).then(response => response.json()).then((result: Array<IsaacResource>) => {
                        if (compareSearchComponent) {
                            compareSearchComponent.ReplaceAll(result);
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
    for (let i = 0; i < historyChart.data.datasets.length; i++) {
        fillDatasetWithRandomColor(foundAtChart.data.datasets[i]);
    }
    for (let i = 0; i < historyChart.data.datasets.length; i++) {
        fillDatasetWithRandomColor(historyChart.data.datasets[i]);
    }
    historyChart.update();
    foundAtChart.update();
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
        const characterCanvas = document.getElementById('character-ranking')

        // initialize history chart
        if (historyCanvas && historyCanvas instanceof HTMLCanvasElement) {
            historyChart = new Chart(historyCanvas, {
                type: 'bar',
                data: result.history,
                options: {
                    scales: {
                        xAxes: [{
                            beginAtZero: true,
                            ticks: {
                                autoSkip: false
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
                            beginAtZero: true,
                            ticks: {
                                autoSkip: false
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
                            beginAtZero: true,
                            ticks: {
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

    });
})();