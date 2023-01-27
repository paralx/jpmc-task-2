import * as React from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement {
  load: (table: Table) => void,
}

class Graph extends React.Component<IProps, {}> {
  table: Table | undefined;
  prevData: ServerRespond[] = [];

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    const elem: PerspectiveViewerElement = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      elem.load(this.table);
    }
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.table) {
      // keep track of previous data
      this.prevData = prevProps.data;

      // filter out new data that is not in the prevData
      const newData = this.props.data.filter(el => !this.prevData.find(prevEl => prevEl.timestamp === el.timestamp));

      // insert new data into Perspective table
      this.table.update(newData.map((el: any) => {
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;
