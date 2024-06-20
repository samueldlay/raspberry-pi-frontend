import { useState, useEffect } from "react";
import { useAuth } from "./Authentication";

export function getFiles(fetchUrl: string) {
  const [files, setFiles] = useState<string[]>([]);
  const auth = useAuth();

  // consider using React Query here in the future
  useEffect(() => {
    const fetchedFiles = async () => {
      try {
        // const url = new URL(fetchUrl, window.location.href);
        console.log("href:", window.location.href);
        if (!auth) throw new Error("No auth");
        if (!auth.user) throw new Error("No user");
        const token = auth.user.token;
        const url = new URL(fetchUrl, "https://10.0.0.96:8080");
        const res = await fetch(url, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(auth.user),
        });
        const awaitedFiles = await res.json();
        console.log({ awaitedFiles })
        setFiles(awaitedFiles);
      }
      catch (cause) {
        if (cause instanceof Error) console.error(cause.message);
        else console.error(JSON.stringify(cause));
      }
    }
    fetchedFiles();
  }, [fetchUrl, auth]);

  return files;
}
