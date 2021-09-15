import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { PostLine } from '../components/PostLine';
import axios from 'axios';
import { useHistory } from 'react-router';
import SortSelector from '../components/SortSelector';

export function HomePage() {
  const history = useHistory();

  const [sort, setSort] = useState(() => {
    const search = new URLSearchParams(history.location.search);
    return search.get('sort') ?? 'new';
  });
  const [page, setPage] = useState(() => {
    const search = new URLSearchParams(history.location.search);
    return Number(search.get('page'));
  });

  const postsQuery = useQuery(['posts', 'list', { sort, page }], async () => {
    const { data } = await axios.get(`/api/posts?sort=${sort}&page=${page}`);
    return data;
  });

  const updateSort = useCallback(
    (newSort: string) => {
      setSort(newSort);
      const params = new URLSearchParams();
      params.append('sort', newSort);
      if (page > 0) {
        params.append('page', `${page}`);
      }
      history.push({ search: params.toString() });
    },
    [history, page]
  );

  const updatePage = useCallback(
    (newPage: number) => {
      if (newPage >= 0) {
        setPage(newPage);
        const params = new URLSearchParams();
        params.append('sort', sort);
        if (newPage > 0) {
          params.append('page', `${newPage}`);
        }
        history.push({ search: params.toString() });
      }
    },
    [history, sort]
  );

  return (
    <div className="sm:mx-2 flex flex-col sm:gap-2 gap-0 bg-white sm:bg-transparent">
      <div className="sm:border sm:rounded bg-white sm:mx-auto max-w-4xl w-full py-2 sm:py-1 px-2">
        <SortSelector sort={sort} setSort={updateSort} />
      </div>
      <div className="divide-y sm:border sm:rounded bg-white sm:mx-auto max-w-4xl w-full">
        {postsQuery.data ? (
          postsQuery.data.rows.length > 0 ? (
            postsQuery.data.rows.map((post: any) => (
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
      <div className="flex flex-row gap-1 sm:mx-auto max-w-4xl w-full">
        {page > 0 && (
          <button
            className="sm:border sm:rounded bg-white py-2 sm:py-1 px-2"
            onClick={() => {
              updatePage(page - 1);
            }}
          >
            {'< Prev'}
          </button>
        )}
        {(!postsQuery.data || postsQuery.data?.next) && (
          <button
            className="sm:border sm:rounded bg-white py-2 sm:py-1 px-2"
            onClick={() => {
              updatePage(page + 1);
            }}
          >
            {'Next >'}
          </button>
        )}
      </div>
    </div>
  );
}
