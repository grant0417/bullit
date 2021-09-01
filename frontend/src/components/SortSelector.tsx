import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";

function SortSelector({
  sort,
  setSort,
}: {
  sort: string;
  setSort: (s: string) => void;
}) {
  return (
    <div className="flex flex-row gap-1">
      <label htmlFor="sort">Sort:</label>
      <select
        id="sort"
        name="sort"
        value={sort}
        onChange={(e) => {
          setSort(e.target.value);
        }}
        className="border rounded"
      >
        <option value="hot">Hotest</option>
        <option value="new">Newest</option>
        <option value="top-hour">Top of the hour</option>
        <option value="top-day">Top of the day</option>
        <option value="top-week">Top of the week</option>
        <option value="top-month">Top of the month</option>
        <option value="top-year">Top of the year</option>
        <option value="top-all">Top of all time</option>
      </select>
    </div>
  );
}

export default SortSelector;
