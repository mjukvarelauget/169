import raw from "../data/st/2021/2021st.json";

type Election = "st" | "ko" | "ft";
const baseUrl = `https://valgresultat.no/api`;

export const getElection = (year: string, electionType: Election) => {
  // const data = await fetch(`${baseUrl}/${year}/${electionType}`, {
  //   headers: {
  //     "Access-Control-Allow-Origin": "*",
  //     "Content-Type": "application/json",
  //   },
  // });
  const data = raw;
  return data;
};
