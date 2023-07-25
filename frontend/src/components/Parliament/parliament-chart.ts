import { getParliamentPoints, Options } from "./chart-helpers";
import { debugGuides } from "./debug";
import { Selection } from "d3-selection";

/**
 *  ___ ____    ___          _ _                    _       ___ _             _
 * |   \__ /   | _ \__ _ _ _| (_)__ _ _ __  ___ _ _| |_    / __| |_  __ _ _ _| |_
 * | |) |_ \   |  _/ _` | '_| | / _` | '  \/ -_) ' \  _|  | (__| ' \/ _` | '_|  _|
 * |___/___/   |_| \__,_|_| |_|_\__,_|_|_|_\___|_||_\__|   \___|_||_\__,_|_|  \__|
 *
 * A d3 plugin for making semi-circle parliament charts.
 */
type OptionKeys = "sections" | "sectionGap" | "seatRadius" | "rowHeight";

type DataPoint = {
  x: number;
  y: number;
  color: string;
  isUtjevning: boolean;
  partiKode: string;
};

type InputData = {
  color: string;
  seats: number;
  partiKode: string;
  utjevning: number;
};

interface Props {
  data: InputData[];
  width: number;
  options: Options;
  debug: boolean;
  onHover: (id: string) => void;
}

const populateUtjevning = (rawData: DataPoint[], data: InputData[]) => {
  let currentParyId = data[0].partiKode;
  let utjevningCounter = 0;
  const returnData: DataPoint[] = [];
  for (let i = 0; i < rawData.length; i++) {
    const mandate = rawData[i];
    const partyData = data.find(
      (party) => party.partiKode === mandate.partiKode
    );

    if (partyData!.partiKode !== currentParyId) {
      currentParyId = partyData!.partiKode;
      utjevningCounter = 0;
    }

    returnData.push({
      ...mandate,
      isUtjevning: utjevningCounter < partyData!.utjevning,
    });

    utjevningCounter++;
  }
  return returnData;
};

export const pc = ({ data, width, options, debug, onHover }: Props) => {
  let graphicWidth = width;

  // clean out any x and y values provided in data objects.
  let rawData: DataPoint[] = populateUtjevning(
    [...data]
      .map((party) =>
        new Array(party.seats).fill({
          x: 0,
          y: 0,
          color: party.color,
          partiKode: party.partiKode,
          isUtjevning: false,
        } as DataPoint)
      )
      .flat(),
    data
  );

  getParliamentPoints(rawData.length, options, graphicWidth).forEach(
    (coords, i) => (rawData[i] = { ...rawData[i], ...coords })
  );

  const parliamentChart: any = (
    selection: Selection<SVGElement, unknown, HTMLElement, any>
  ): any => {
    if (graphicWidth === 0) {
      const n = selection.node();
      if (n === null) {
        console.warn("Selection is null");
        graphicWidth = width;
      } else {
        graphicWidth = n.getBoundingClientRect().width;
      }
    }
    const processedData: DataPoint[] = rawData;
    selection.select("g.parliament-chart").remove();

    // Add new chart
    const innerSelection = selection
      .append("g")
      .attr("class", "parliament-chart");

    // First remove any existing debug lines
    innerSelection.select("g.debug").remove();

    // Append debug lines
    if (debug) {
      debugGuides(innerSelection, graphicWidth, options, processedData.length);
    }

    return innerSelection
      .selectAll("circle")
      .data(processedData)
      .enter()
      .insert("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", options.seatRadius)
      .attr("stroke", "black")
      .attr("id", (d, i) => {
        const party = data.find((p, i) => p.partiKode === d.partiKode);
        return `${party!.partiKode}_${i}`;
      })
      .attr("stroke-width", (d) => (d.isUtjevning ? 1 : 0))
      .attr("fill", (d) => d.color || "#AAA")
      .attr("party", (d) => d.partiKode)
      .on("mouseover", (e, d) => {
        innerSelection
          .selectAll(`circle[party='${d.partiKode}']`)
          .attr("fill", "black");
      })
      .on("mouseout", (e, d) => {
        innerSelection
          .selectAll(`circle[party='${d.partiKode}']`)
          .attr("fill", d.color);
      });
  };

  parliamentChart.width = (w: number) => {
    // eslint-disable-next-line no-restricted-globals
    graphicWidth = w;
    return parliamentChart;
  };

  // Create getters and setters for sections, sectionGap, seatRadius, and rowHeight
  Object.keys(options).forEach((attr) => {
    const a = attr as OptionKeys;
    parliamentChart[a] = (s: number) => {
      // eslint-disable-next-line no-restricted-globals
      options[a] = s;
      return options[a];
    };
  });

  // enable / disable debug mode
  parliamentChart.debug = (b: boolean) => {
    debug = !!b;
    return parliamentChart;
  };

  parliamentChart.data = (d: any[]) => {
    // If an argument with new data is provided
    if (d) {
      // clean out any x and y values provided in data objects.
      rawData = d.map(({ x, y, ...restProps }) => restProps);
      return parliamentChart;
    }

    // If width is not set, don't calculate this instance
    if (graphicWidth <= 0 || rawData.length <= 0) return rawData;

    // Check if we have already run this instance
    if (rawData.every((r) => r.x && r.y)) return rawData;

    // The number of points we need to fit
    const totalPoints = rawData.length;

    // The locations of all the points
    const locations = getParliamentPoints(totalPoints, options, graphicWidth);
    // Add locations to the rawData object
    locations.forEach(
      (coords, i) => (rawData[i] = { ...rawData[i], ...coords })
    );

    return rawData;
  };

  parliamentChart.aggregatedData = (d: any[]) => {
    rawData = d.reduce((acc, val) => {
      const { seats = 0, x, y, ...restProps } = val;
      return [...acc, ...Array(seats).fill(restProps)];
    }, []);

    return parliamentChart;
  };

  return parliamentChart;
};
