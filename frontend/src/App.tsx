import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Dots } from "./components/Dots";
import { InteractiveMap } from "./components/InteractiveMap";
import { Parliment } from "./components/Parliament/Parliament";
import { ElectionType } from "./utils";

const queryClient = new QueryClient();

function App() {
  const year = 2021;
  const electionType: ElectionType = "st";
  const [county, setCounty] = useState<string>("akershus");

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        Dette er en valg
        <div>
          <InteractiveMap onChangeCounty={setCounty} />
          <Dots year={year} county={county} electionType={electionType} />
          <Parliment />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
