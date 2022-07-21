import { useEffect, useRef, useState } from "react";
import { request } from "./api/pull-requests";

export function useAsync<T>(supplier: () => Promise<T>, fetch = true) {
  const [data, setDetails] = useState<T | null>(null);
  const fetching = useRef(false);

  useEffect(() => {
    console.log({ fetch });
    if (!fetching.current && fetch) {
      fetching.current = true;

      supplier().then((result) => {
        setDetails(result);
      });
    }
  }, [fetch]);

  return [data, data === null] as const;
}

export function useResouce<T>(link: { href: string } | string, { fetch = true, internal = false, fields = [] }) {
  return useAsync(() => {
    return request<T>(typeof link === "string" ? link : link.href, { internal, fields });
  }, fetch);
}
