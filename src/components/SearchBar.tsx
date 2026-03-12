import { FormEvent, useEffect, useState } from "react";

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
}

export function SearchBar({
  initialValue = "",
  placeholder = "Search drinks, brands, categories",
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(query.trim());
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label="Search drinks"
      />
      <button type="submit">Search</button>
    </form>
  );
}
