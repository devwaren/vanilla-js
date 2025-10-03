

const DEFAULT_DEBOUNCE_TIME = 500;

export function useJSRequest(
  fetchFunction,
  debounceTime = DEFAULT_DEBOUNCE_TIME
) {
  let data = null;
  let isLoading = false;
  let error = null;
  let timeoutId = null;

  const fetchData = async () => {
    isLoading = true;
    error = null;

    try {
      const result = await fetchFunction();
      data = result;
    } catch (err) {
      error = Error(err);
    } finally {
      isLoading = false;
    }
  };

  const debouncedFetch = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(fetchData, debounceTime);
  };

  // Initial fetch
  debouncedFetch();

  return { data, isLoading, error };
}
