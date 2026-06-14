import { ReactFlowProvider } from "reactflow";
import { PipelineToolbar } from "./toolbar";
import { PipelineUI } from "./ui";

function App() {
  return (
    <ReactFlowProvider>
      <div>
        <PipelineToolbar />
        <PipelineUI />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
