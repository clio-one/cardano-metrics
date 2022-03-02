import GSTC from '/blocklog/timeline/dist/gstc.esm.min.js';
import { Plugin as CalendarScroll } from '/blocklog/timeline/dist/plugins/calendar-scroll.esm.min.js';
import { Plugin as DependencyLines } from '/blocklog/timeline/dist/plugins/dependency-lines.esm.min.js';

const colors = ['rgba(150, 150, 150, 0.2)', '#e17d63', '#77576b', '#555d74'];

const response = await fetch('https://api.clio.one/blocklog/v1/fetch/');
const data = await response.json();
console.log(data);

const columnsFromDB = [
  {
    id: 'id',
    label: 'ID',
    data: ({ row }) => Number(GSTC.api.sourceID(row.id)), // show original id
    sortable: ({ row }) => Number(GSTC.api.sourceID(row.id)), // sort by id converted to number
    width: 40,
    header: {
      content: 'ID',
    },
  },
  {
    id: 'label',
    data: 'label',
    sortable: 'label',
    isHTML: false,
    width: 120,
    header: {
      content: 'Node',
    },
  },
];

const seconds = [
  {
    zoomTo: 100, // we want to display this format for all zoom levels until ...
    period: 'second',
    periodIncrement: 1,
    main: true,
    format({ timeStart, vido }) {
      return vido.html`<div style="text-align:center;">${timeStart.format('D-MMM HH:mm:ss')}</div>`; // full list of formats: https://day.js.org/docs/en/display/format
    },
  },
];

let gstc, state;

function setTippyContent(element, data) {
  if (!gstc) return;
  if ((!data || !data.item) && element._tippy) return element._tippy.destroy();
  const itemData = gstc.api.getItemData(data.item.id);
  if (!itemData) return element._tippy.destroy();
  if (itemData.detached && element._tippy) return element._tippy.destroy();
  // @ts-ignore
  if (!itemData.detached && !element._tippy) tippy(element, { trigger: 'mouseenter click' });
  if (!element._tippy) return;
  const startDate = itemData.time.startDate;
  const endDate = itemData.time.endDate;
  const deltaDate = itemData.time.endDate - itemData.time.startDate + 1 
  const tooltipContent = `${data.item.tlabel} in ${deltaDate}ms at ${endDate.format('mm:ss.SSS')} `;
  //const tooltipContent = `${data.item.tlabel} at ${startDate} `;
  element._tippy.setContent(tooltipContent);
}

function itemTippy(element, data) {
  setTippyContent(element, data);
  return {
    update(element, data) {
      if (element._tippy) element._tippy.destroy();
      setTippyContent(element, data);
    },
    destroy(element, data) {
      if (element._tippy) element._tippy.destroy();
    },
  };
}


// Configuration object
const config = {
  licenseKey:
    '====BEGIN LICENSE KEY====\njuLIeUh7NgbfZ0486F7OqEw6uET58kJvlJSrXJALAJTUYVfEe79LrPeKTGjiYKVbadZraiJTuKwKhkZtnEenlAWCZTz0RBOVn34nE9B96R7YYf6UI3Sznb7ln0U4clVPGr4a9j7zK/R+Bn1ZksVAk0iySVoFVxmdimUh3HVLwsJhEy9LguCvFDtsArVyH4xalZuWe3lJ6Q4bs0nOPFW/6HBr4vmgCWHCmMT5P6nZyNCERU0OrHtflZM8qym9uiieLCIUI8to9MU7ZvBMlnWmc3RkAIC3ZcNk3VlQ0+sPLhKkd9+cgCCq6F0gIIBMou0Ud9ziwhP3X1JiVzoVZMTcFw==||U2FsdGVkX1+CNjx/qcFd0QLOe0tufoQlxo4QCvh94Meti/aLbuWesxxlE5xezMXS7zl1pmfk7AhlEsl+zFUCH4WJ9Gjw0sJ/yugFBJ35gLo=\nnRYzTFtKS8HiUJZGEXA967WZ12G48byJzO8w3KwT9rZWYvzVr1TQqxTJeF5WbUZr8t4rh9+9Nq/jErA2LJ/+j7/p46FOqmkt7xFutm68v3GMHN/pdDY9FvPA/fi2cRkK86KBXW8pbZxiLtY6H/vohMwKtN2rSXmXUXB5YYVah/y7tZBnh0nL9Pqd0JV5MPn8cE+bYD3s+t1ecJWqlGGndGirw5CMhyvHsu6NSCrIBz8kzEdNkUQEO8DkfDhZjJyMhZFkeEzuid5jDoHlbPwNsop1DeTG3AbiEN2hEgS3xThq4ncrinKGsrZXzxtyZDMluV4dp+2Scko3wVb9/2GI5w==\n====END LICENSE KEY====',
  innerHeight: 600,

  plugins: [
    CalendarScroll(),
  ],

  list: {
    columns: {
      data: GSTC.api.fromArray(columnsFromDB),
    },
    rows: GSTC.api.fromArray(data.nodes),
  },
  chart: {
    items: GSTC.api.fromArray(data.blocks),
    calendarLevels: [seconds],
    time: {
      zoom: 4,
      period: 'second',
      //from: data.base.from.valueOf(),
      //to: data.base.to.valueOf(),
      //from: GSTC.api.date('2022-02-24T22:20:00').valueOf(),
      //to: GSTC.api.date('2022-02-24T22:25:00').valueOf(),
    },
  },
  actions: {
    'chart-timeline-items-row-item': [itemTippy],
  },
};

// Generate GSTC state from configuration object
state = GSTC.api.stateFromConfig(config);

// for testing
//globalThis.state = state;
const el = document.getElementById('gstc');
el.classList.add('gstc--dark');
document.body.classList.add('gstc--dark');

// Mount the component
gstc = GSTC({
  element: document.getElementById('gstc'),
  state,
});

globalThis.gstc = gstc;
globalThis.state = state;

document.getElementById('zoom').addEventListener('input', (ev) => {
  const value = ev.target.value;
  console.log(value);
  state.update('config.chart.time.zoom', value);
});
