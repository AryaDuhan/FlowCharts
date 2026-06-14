// toolbar.js

import { DraggableNode } from './draggableNode';
import { SubmitButton } from './submit';

export const PipelineToolbar = () => {

    return (
        <div className="omoriDialogue">
            <div className="omoriDialogueSpeaker">PIPELINE</div>
            <div className="omoriDialogueRow">
                <DraggableNode type='customInput' label='Input' />
                <DraggableNode type='llm' label='LLM' />
                <DraggableNode type='customOutput' label='Output' />
                <DraggableNode type='text' label='Text' />
                <SubmitButton />
            </div>
        </div>
    );
};
