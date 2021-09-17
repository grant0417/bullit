import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/outline";
import useStore from "../Store";
import axios from "axios";
import { useMutation } from "react-query";
import { useEffect, useState } from "react";

export function Votes({
  id,
  votes,
  currentVote,
}: {
  id: string;
  votes: number;
  currentVote?: number;
}) {
  const username = useStore((state) => state.username);
  const [localCurrentVote, setLocalCurrentVote] = useState<number>(
    currentVote || 0
  );

  useEffect(() => {
    setLocalCurrentVote(currentVote || 0);
  }, [currentVote]);

  const voteMutation = useMutation((vote: number) =>
    axios.post(`/api/posts/${id}/vote`, { vote })
  );

  return (
    <div className="flex flex-col text-center">
      <button
        aria-label="Vote Up"
        onClick={() => {
          if (localCurrentVote === 1) {
            setLocalCurrentVote(0);
            voteMutation.mutate(0);
          } else {
            setLocalCurrentVote(1);
            voteMutation.mutate(1);
          }
        }}
        className={
          username ? (localCurrentVote === 1 ? "text-yellow-500" : "") : "text-gray-300 pointer-events-none"
        }
      >
        <ChevronUpIcon className="h-6 w-6" aria-hidden />
      </button>
      <div>
        {votes - (currentVote ?? 0) + localCurrentVote}
      </div>
      <button
        aria-label="Vote Down"
        onClick={() => {
          if (localCurrentVote === -1) {
            setLocalCurrentVote(0);
            voteMutation.mutate(0);
          } else {
            setLocalCurrentVote(-1);
            voteMutation.mutate(-1);
            }
        }}
        className={
          username ? (localCurrentVote === -1 ? "text-blue-500" : "") : "text-gray-300 pointer-events-none"
        }
      >
        <ChevronDownIcon className="h-6 w-6" aria-hidden />
      </button>
    </div>
  );
}
