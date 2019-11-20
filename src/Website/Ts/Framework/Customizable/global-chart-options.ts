import { Chart } from "chart.js";

const setGlobalChartOptions = () => {
    Chart.defaults.scale.ticks.beginAtZero = true;
};

export {
    setGlobalChartOptions
}