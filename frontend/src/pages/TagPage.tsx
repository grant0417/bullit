import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { PostLine } from "../components/PostLine";

export function TagPage() {
  let { tag } = useParams<{ tag: string; }>();

  const postsQuery = useQuery(["posts", "list"], async () => {
    const res = await fetch("/api/posts");
    return await res.json();
  });

  return (
    <div className="sm:mx-2 bg-white sm:bg-transparent">
      <div className="sm:mx-auto max-w-4xl flex flex-col gap-2">
        <div className="sm:border sm:rounded bg-white p-3 flex flex-row justify-between">
          <div className="text-xl">
            <span className="font-bold">Tag:</span> {tag}
          </div>
          <div className="text-xl">
            <button className="border rounded px-1 bg-gray-50 hover:bg-gray-200">
              Follow
            </button>
          </div>
        </div>
        <div className="divide-y sm:border sm:rounded bg-white ">
          {postsQuery.data &&
            postsQuery.data.map((post: any) => (
              <div className="py-0.5 px-2">
                <PostLine key={post.id} post={post} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
