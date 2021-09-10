import { useLayoutEffect, useState } from "react";
import { useQuery } from "react-query";
import { PostLine } from "../components/PostLine";
import axios from "axios";
import SortSelector from "../components/SortSelector";

export function HomePage() {
  const [sort, setSort] = useState("hot");

  const postsQuery = useQuery(["posts", "list", { sort }], async () => {
    const { data } = await axios.get(`/api/posts?sort=${sort}`);
    return data;
  });

  return (
    <div className="sm:mx-2 flex flex-col sm:gap-2 gap-0 bg-white sm:bg-transparent">
      <div className="sm:border sm:rounded bg-white sm:mx-auto max-w-4xl w-full py-2 sm:py-1 px-2">
        <SortSelector sort={sort} setSort={setSort} />
      </div>
      <div className="divide-y sm:border sm:rounded bg-white sm:mx-auto max-w-4xl w-full">
        {postsQuery.data ? (
          postsQuery.data.length > 0 ? (
            postsQuery.data.map((post: any) => (
              <div key={post.id} className="py-0.5 px-2">
                <PostLine key={post.id} post={post} />
              </div>
            ))
          ) : (
            <div className="text-center p-2">No posts found</div>
          )
        ) : (
          <>
            {postsQuery.isLoading && (
              <div className="text-center p-2">Loading...</div>
            )}
            {postsQuery.isError && (
              <div className="text-center p-2">Error loading posts.</div>
            )}
          </>
        )}
      </div>
      {/* <div className="sm:border sm:rounded">
            <div>Create Account</div>
            <div>Log In</div>
          </div> */}
    </div>
  );
}
