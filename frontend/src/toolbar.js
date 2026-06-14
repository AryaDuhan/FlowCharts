// toolbar.js

import { DraggableNode } from "./draggableNode";
import { SubmitButton } from "./submit";

export const PipelineToolbar = () => {
  return (
    <div className="omoriDialogue">
      <div className="omoriDialogueSpeaker">PIPELINE</div>
      <div className="omoriDialogueRow">
        <DraggableNode type="customInput" label="Input" />
        <DraggableNode type="llm" label="LLM" />
        <DraggableNode type="customOutput" label="Output" />
        <DraggableNode type="text" label="Text" />
        <DraggableNode type="math" label="Math" />
        <DraggableNode type="timer" label="Timer" />
        <DraggableNode type="logic" label="Logic" />
        <DraggableNode type="note" label="Note" />
        <DraggableNode type="api" label="API" />
        <SubmitButton />
      </div>
    </div>
  );
};
