import dayjs from 'dayjs';
import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import RequestModal from './requestModal';



const generateTimeIntervals = () => {
    const times = [];
    const start = new Date(2023, 0, 1, 7, 0);
    const end = new Date(2023, 0, 1, 23, 0);

    let current = new Date(start);
    while (current < end) {
        times.push(current.getTime());
        current = new Date(current.getTime() + 5 * 60 * 1000);
    }
    return times;
};
const timeIntervals = generateTimeIntervals();

const zeroRanges = [
    [new Date(2023, 0, 1, 7, 0).getTime(), new Date(2023, 0, 1, 9, 0).getTime()],
    [new Date(2023, 0, 1, 12, 0).getTime(), new Date(2023, 0, 1, 13, 0).getTime()],
    [new Date(2023, 0, 1, 17, 0).getTime(), new Date(2023, 0, 1, 18, 0).getTime()],
    [new Date(2023, 0, 1, 19, 30).getTime(), new Date(2023, 0, 1, 23, 0).getTime()],
];

const isZeroTime = (timestamp) => {
    return zeroRanges.some(([start, end]) => timestamp >= start && timestamp < end);
};


const DualChart = () => {
    const [modalShow, setModalShow] = useState(false);
    const [selectedRange, setSelectedRange] = useState({ start: '', end: '' });
    const handleBarClick = (point) => {
        const start = dayjs(point.y[0]).format('HH:mm');
        const end = dayjs(point.y[1]).format('HH:mm');
        setSelectedRange({ start, end });
        setModalShow(true);
    };



    const topOptions = {
        chart: {
            type: 'bar',
            stacked: true,
            toolbar: { show: false },
            zoom: { enabled: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 300
                }
            }
        },
        title: {
            text: 'Tracked Hours',
            align: 'left',
            offsetX: -10,
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333'
            }
        },
        xaxis: {
            type: 'datetime',
            min: new Date(2023, 0, 1, 7, 0).getTime(),
            max: new Date(2023, 0, 1, 23, 0).getTime(),
            labels: {
                show: false,
                datetimeFormatter: {
                    hour: 'HH:mm',
                },
            },
        },
        yaxis: {
            labels: {
                formatter: (val) => `${val}%`,
                offsetX: -20
            },
        },
        grid: {
            show: false
        },
        tooltip: {
            shared: false,
            intersect: true,
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const seriesName = w.config.series[seriesIndex].name;
                const value = series[seriesIndex][dataPointIndex];
                const point = w.config.series[seriesIndex].data[dataPointIndex];


                const startTimestamp = w.config.series[seriesIndex].data[dataPointIndex].x;
                const start = dayjs(Number(startTimestamp));
                const end = start.add(5, 'minute');

                const formattedRange = `${start.format('hh:mm A')} - ${end.format('hh:mm A')}`;

                if (
                    (seriesName === 'Productive' || seriesName === 'Unproductive') &&
                    point.customData &&
                    Array.isArray(point.customData)
                ) {
                    const rows = point.customData
                        .map(app => `<div class='d-flex align-items-center justify-content-between'><div>${app.app}</div>  <div class='fw-bold'>${app.duration} min</div></div>`)
                        .join('<br/>');

                    return `
        <div class='tooltip-container'>
          <div class='tooltip-head'>${seriesName} - ${value}%</div>
          <div class='tooltip-content'>${rows}</div>
          <div class='tooltip-time'>${formattedRange}</div>
        </div>
      `;
                }

                return `
      <div style="padding: 8px;">
        <strong>${seriesName} - ${value}%</strong>
      </div>
    `;
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
        },
        colors: ['#4ade80', '#f97316', '#d1d5db'],
        dataLabels: { enabled: false },
    };

    const topSeries = [
        {
            name: 'Productive',
            data: timeIntervals.map((t) => ({
                x: t,
                y: isZeroTime(t) ? 0 :  Math.floor(Math.random() * 50),
                customData: [
                    { app: 'stackoverflow', duration: 1 },
                    { app: 'chrome', duration: 24 },
                ]
            })),
        },
        {
            name: 'Unproductive',
            data: timeIntervals.map((t) => ({
                x: t,
                y: isZeroTime(t) ? 0 : Math.floor(Math.random() * 20),
                customData: [
                    { app: 'YouTube', duration: 10 },
                    { app: 'Spotify', duration: 5 }
                ]
            })),
        },
        {
            name: 'Neutral',
            data: timeIntervals.map((t) => ({
                x: t,
                y: isZeroTime(t) ? 0 : Math.floor(Math.random() * 30)
            })),
        },
    ];

    const bottomOptions = {
        chart: {
            type: 'rangeBar',
            height: 100,
            toolbar: { show: false },
            events: {
                dataPointSelection: function (event, chartContext, config) {
                    const { seriesIndex, dataPointIndex } = config;
                    const seriesName = chartContext.w.config.series[seriesIndex]?.name;
                    if (seriesName === 'Idle') {
                        const point = chartContext.w.config.series[seriesIndex]?.data?.[dataPointIndex];
                        if (point) handleBarClick(point);
                    }
                },
                dataPointMouseEnter: function (event, chartContext, config) {
                    const seriesName = chartContext.w.config.series[config.seriesIndex]?.name;
                    if (seriesName === 'Idle') {
                        event.target.style.cursor = 'pointer';
                    } else {
                        event.target.style.cursor = 'default';
                    }
                },
                dataPointMouseLeave: function (event) {
                    event.target.style.cursor = 'default';
                }
            },
            zoom: { enabled: false },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '50%',
                rangeBarGroupRows: true,

            },
        },
        xaxis: {
            type: 'datetime',
            min: new Date(2023, 0, 1, 7, 0).getTime(),
            max: new Date(2023, 0, 1, 23, 0).getTime(),
            labels: {
                datetimeUTC: false,
                datetimeFormatter: {
                    hour: 'hh:mm TT',  
                },
                style: {
                    fontSize: '12px',
                },
            },
        },
        yaxis: { show: false },
        grid: {
            show: false,
            padding: { top: -30,left: 40,right:15 },
        },
        colors: ['#1e3a8a', '#e5e7eb'],
        tooltip: {
            shared: false,
            intersect: true,
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const point = w.config.series[seriesIndex].data[dataPointIndex];
                const seriesName = w.config.series[seriesIndex].name;

                const start = dayjs(point.y[0]);
                const end = dayjs(point.y[1]);
                const durationInSeconds = end.diff(start, 'second');

                const hours = Math.floor(durationInSeconds / 3600);
                const minutes = Math.floor((durationInSeconds % 3600) / 60);
                const seconds = durationInSeconds % 60;





                return `
      <div style="padding: 10px;">
         ${hours}h:${minutes}m:${seconds}s - ${seriesName}
      </div>
    `;
            }
        },
        legend: { show: false },
        dataLabels: { enabled: false },
    };

    const bottomSeries = [
        {
            name: 'Online',
            data: [
                {
                    x: 'Timeline',
                    y: [
                        new Date('2023-01-01T09:00:00').getTime(),
                        new Date('2023-01-01T12:00:00').getTime(),
                    ],
                },
                {
                    x: 'Timeline',
                    y: [
                        new Date('2023-01-01T13:00:00').getTime(),
                        new Date('2023-01-01T17:00:00').getTime(),
                    ],
                },
                {
                    x: 'Timeline',
                    y: [
                        new Date('2023-01-01T18:00:00').getTime(),
                        new Date('2023-01-01T19:30:00').getTime(),
                    ],
                },
            ],
        },
        {
            name: 'Idle',
            data: [
                {
                    x: 'Timeline',
                    y: [
                        new Date('2023-01-01T07:00:00').getTime(),
                        new Date('2023-01-01T09:00:00').getTime(),
                    ],
                },
                {
                    x: 'Timeline',
                    y: [
                        new Date('2023-01-01T12:00:00').getTime(),
                        new Date('2023-01-01T13:00:00').getTime(),
                    ],
                },
                {
                    x: 'Timeline',
                    y: [
                        new Date('2023-01-01T17:00:00').getTime(),
                        new Date('2023-01-01T18:00:00').getTime(),
                    ],
                },
                {
                    x: 'Timeline',
                    y: [
                        new Date('2023-01-01T19:30:00').getTime(),
                        new Date('2023-01-01T23:00:00').getTime(),
                    ],
                },
            ],
        },
    ];

    return (
        <div className='chart-container'>
            <div className='chart-wrapper'>
                <Chart options={topOptions} series={topSeries} type="bar" height={300} />
                <div className='second-chart'>
                    <Chart options={bottomOptions} series={bottomSeries} type="rangeBar" height={80} />
                </div>
            </div>
            {modalShow ?
                <RequestModal modalShow={modalShow} setModalShow={setModalShow} selectedRange={selectedRange} />
                :
                <></>
            }
        </div>
    );
};

export default DualChart;
