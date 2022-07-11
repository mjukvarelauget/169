import React from "react";
import { useQuery } from "react-query";
import { backendUrl, ElectionType, getPartyColor } from "../utils";

const useElectionData = (
  electionType: ElectionType,
  year: number,
  county: string
) => {
  return useQuery(["election", { electionType, year, county }], async () => {
    const response = await fetch(
      `${backendUrl}/${electionType}/${year}/${county}`
    );
    console.log(response);

    const json = await response.json();
    console.log(json);

    return json;
  });
};

interface Props {
  electionType: ElectionType;
  county: string;
  year: number;
}

export const Dots: React.FC<Props> = (props) => {
  const { electionType, county, year } = props;
  const { data } = useElectionData(electionType, year, county);

  if (!data) return null;

  const d: any = data;

  const partiesWithMandates: any = d.partier.filter(
    (party: any) => party.mandater.resultat.antall > 0
  );

  return (
    <div>
      Mandatfordeling: <b style={{ textTransform: "capitalize" }}>{county}</b>
      <ol>
        {partiesWithMandates.map((party: any) => (
          <li
            style={{ display: "flex", alignItems: "center" }}
            key={party.id.partikode}
          >
            <p style={{ marginRight: "12px" }}>
              {party.id.navn} - {party.mandater.resultat.antall}
            </p>
            <ColoredDots
              partyId={party.id.partikode}
              count={party.mandater.resultat.antall}
            />
          </li>
        ))}
      </ol>
    </div>
  );
};

interface Dot {
  partyId: string;
  count: number;
}
const ColoredDots: React.FC<Dot> = (props) => {
  const arr = new Array(props.count).fill("b").map((_, i) => (
    <div
      key={i}
      style={{
        margin: "0 2px",
        borderRadius: "50%",
        width: "12px",
        height: "12px",
        background: getPartyColor(props.partyId),
      }}
    />
  ));
  return <div style={{ display: "flex" }}>{arr}</div>;
};
