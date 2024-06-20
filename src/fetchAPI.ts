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
        const serverURL = import.meta.env.PROD ? window.location.href : import.meta.env.VITE_SERVER;
        console.log("SERVER URL:", serverURL);
        console.log("IS IN PROD:", import.meta.env.PROD);
        if (!auth) throw new Error("No auth");
        if (!auth.user) throw new Error("No user");
        const token = auth.user.token;
        const url = new URL(fetchUrl, serverURL);
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

  return { files, setFiles };
}
