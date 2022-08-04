import React from "react";
import { ElectionResult, getPartyColor } from "../utils";
import { ColoredDots, useGetNationalElection } from "./Dots";

export const Assembly = () => {
  const { data, isLoading } = useGetNationalElection();

  if (isLoading) return <>Laster..</>;

  const d: ElectionResult = data!;
  const partiesWithMandates = d.partier.filter(
    (party) => party.mandater.resultat.antall > 0
  );

  const point = (r: number, theta: number): { x: number; y: number } => {
    return { x: r * Math.sin(theta), y: r * Math.cos(theta) };
  };

  let r = 200;

  return (
    <div>
      Antall stemmer {d.stemmer.total}, {d.frammote.prosent}%
      <div
        style={{
          position: "relative",
        }}
      >
        {partiesWithMandates.map((party, i) => {
          return new Array(party.mandater.resultat.antall)
            .fill("b")
            .map((_, k) => {
              const { x, y } = point(r + k, i/2);

              return (
                <div
                  key={i}
                  style={{
                    top: y + 200,
                    left: x + 400,
                    margin: "0 2px",
                    borderRadius: "50%",
                    position: "absolute",
                    width: "12px",
                    height: "12px",
                    background: getPartyColor(party.id.partikode),
                  }}
                />
              );
            });
        })}
      </div>
    </div>
  );
};
