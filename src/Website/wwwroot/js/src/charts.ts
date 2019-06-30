import { SearchBox } from './components/searchbox';
import { IsaacResource } from './interfaces/isaac-resource';

declare const Chart: any;

let chart: any = null;
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
    if (chart.data.datasets.length === 1) {
        fillDatasetWithRandomColor(chart.data.datasets[0]);
    }
    if (chart.data.datasets.length < 5) {
        fetch(`/api/resources/${id}/OverTime`).then(x => x.json()).then(result => {
            chart.data.datasets.push(result.datasets[0]);
            fillDatasetWithRandomColor(chart.data.datasets[chart.data.datasets.length - 1]);
            chart.update();
        });
    }
};

const fillDatasetWithRandomColor = (dataSet: any) => {
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
    for (let i = 0; i < chart.data.datasets.length; i++) {
        fillDatasetWithRandomColor(chart.data.datasets[i]);
    }
    chart.update();
}

const initializeResetChartButton = () => {
    const resetButton = document.getElementById('reset-chart');
    if (resetButton) {
        resetButton.addEventListener('click', e => {
            (e.target as HTMLButtonElement).disabled = true;
            e.stopPropagation();
            e.preventDefault();
            fetchInitialChartData().then(result => {
                chart.data = result;
                chart.update();
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
    return fetch(`/api/resources/${resourceId}/OverTime`).then(x => x.json());
}

(() => {
    console.log(originalBodyBackground);
    initializeHideBackgroundButton();
    initializeResetChartButton();
    initializeChangeColorButton();
    initializeShowOptionsLink();

    fetchInitialChartData().then(result => {
        console.log('result is', result);
        const canvas = document.getElementById('throughout-the-letsplay');
        if (canvas) {
            chart = new Chart(canvas, {
                type: 'bar',
                data: result,
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
    });
})();