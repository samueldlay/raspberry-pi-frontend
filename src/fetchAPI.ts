import { useState, useEffect } from "react";
import { useAuth } from "./Authentication";

type User = {
  email: string;
  userID: string;
  token: string;
}

export function getFiles(fetchUrl: string) {
  const [files, setFiles] = useState<string[]>([]);
  const auth = useAuth();

  // consider using React Query here in the future
  useEffect(() => {
    const fetchedFiles = async () => {
      try {
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

export async function downloadFile({ file, user }: { file: string, user: User }) {
  if (!file && !user) return;
  try {
    const serverURL = import.meta.env.PROD ? window.location.href : import.meta.env.VITE_SERVER;
    const token = user.token;
    const apiUrl = `/api/download/${user.userID}/${file}`
    const url = new URL(apiUrl, serverURL);
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file;
    a.click();
  } catch (cause) {
    if (cause instanceof Error) console.error(cause.message);
    else console.error(JSON.stringify(cause))
  }
}

export async function removeFile({ file, user, setFiles }: { file: string, user: User, setFiles: React.Dispatch<React.SetStateAction<string[]>> }) {
  if (!file && !user) return;
  try {
    const serverURL = import.meta.env.PROD ? window.location.href : import.meta.env.VITE_SERVER;
    const token = user.token;
    const apiUrl = `/api/remove/${user.userID}/${file}`
    const url = new URL(apiUrl, serverURL);
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });
    if (!res.ok) throw new Error("FILE NOT DELETED")
    const files = await res.json();
    if (Array.isArray(files)) setFiles(files);

  } catch (cause) {
    if (cause instanceof Error) console.error(cause.message);
    else console.error(JSON.stringify(cause))
  }
}
