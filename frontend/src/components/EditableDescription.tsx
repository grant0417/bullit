import { PencilAltIcon, CheckIcon, XIcon } from "@heroicons/react/solid";
import { useState } from "react";

function EditableDescription({ description }: { description: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);

  return (
    <div className="sm:max-w-md">
      {isEditing ? (
        <div className="flex flex-row justify-center gap-2 items-start">
          <textarea
            className="text-gray-800 text-sm w-full ring-1 ring-gray-200 rounded appearance-none py-0.5 px-1"
            value={newDescription}
            // rows={1}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <div className="flex flex-row gap-1">
            <button
              onClick={() => {
                setIsEditing(false);
              }}
              className="group"
            >
              <CheckIcon className="w-4 h-4 text-gray-800 group-hover:text-gray-500" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
              }}
              className="group"
            >
              <XIcon className="w-4 h-4 text-gray-800 group-hover:text-gray-500" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-center gap-0.5">
          <div className="text-gray-800 text-sm py-0.5 px-1">{newDescription}</div>
          <button onClick={() => setIsEditing(true)}>
            <PencilAltIcon className="h-4 w-4 text-gray-800 hover:text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
}

export default EditableDescription;
