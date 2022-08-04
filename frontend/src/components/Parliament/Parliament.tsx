import React, { useEffect, useRef } from "react";
import { select } from "d3-selection";
import { pc } from "./parliament-chart";
import { useGetNationalElection } from "../Dots";
import { getPartyColor, partyOrder } from "../../utils";

export const Parliment: React.FC<{}> = (props) => {
  const width = 860;
  const seatRadius = 12;
  const rowHeight = 42;
  const sections = 2;
  const sectionGap = 60;
  const debug = false;

  const { data, isLoading } = useGetNationalElection();
  const svgRef = useRef<SVGSVGElement>(null);

  const partiesWithMandates = data?.partier.filter(
    (party) => party.mandater.resultat.antall > 0
  );

  const inputData = partiesWithMandates
    ?.map((party) => ({
      color: getPartyColor(party.id.partikode),
      seats: party.mandater.resultat.antall,
      partiKode: party.id.partikode,
      utjevning: party.mandater.resultat.utjevningAntall,
    }))
    .sort(
      (a, b) =>
        partyOrder.indexOf(a.partiKode) - partyOrder.indexOf(b.partiKode)
    )
    .filter((p) => p.partiKode !== "Andre");

  useEffect(() => {
    const svg = select(svgRef.current);
    if (inputData !== undefined) {
      svg.call(
        pc({
          data: inputData,
          width,
          options: {
            seatRadius,
            rowHeight,
            sections,
            sectionGap,
          },
          debug,
        })
      );
    }
  }, [svgRef, inputData]);

  return isLoading ? (
    <>Laster...</>
  ) : (
    <svg ref={svgRef} width={width} height={1200} id="the child"></svg>
  );
};
