import { Button } from "@nextui-org/react";
import { ReactElement, useState } from "react";
import { useAuth } from "./Authentication";

export default function UploadFile(): ReactElement {
  const auth = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<string[]>(auth?.user?.files ? auth.user.files : []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      console.log("files", event.target.files);
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!selectedFile) {
      throw new Error("No file selected");
    }

    if (!auth || !auth.user) throw new Error("Not logged in");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const url = new URL("https://10.0.0.96:8080/upload");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.user.token}`
        },
        mode: "cors",
        body: formData
      });

      if (response.ok) {
        const serverResponse = await response.json();
        setFiles(serverResponse);
        setSelectedFile(null);
      }
      else throw new Error(response.statusText);
    } catch (error) {
      if (error instanceof Error) {
        console.error("ERROR:", error.message);
        // setServerResponse(error.message);
      }
      else {
        console.error('Error uploading file:', error);
        // setServerResponse(JSON.stringify(error));
      }
    }
  };

  if (!auth?.user) return (<p>You must be logged in to upload</p>);

  return (
    <div>
      <form className="flex flex-col gap-4" onSubmit={handleUpload}>
        <h2>Upload File</h2>
        {/* <Input type="file" onChange={handleFileChange} /> */}
        <input type="file" id="input" onChange={handleFileChange} />
        <Button type="submit">Upload</Button>
      </form>
      <h2>Files in your directory:</h2>
      {/* <ul>
        {
          files?.map(file => <li>{file}</li>)
        }
      </ul> */}
      <pre>{JSON.stringify(files)}</pre>
    </div>
  );
}
