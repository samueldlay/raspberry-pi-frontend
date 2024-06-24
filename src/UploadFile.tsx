import { Button, Input } from "@nextui-org/react";
import { ReactElement, useState } from "react";
import { useAuth } from "./Authentication";
import { getFiles, downloadFile, removeFile } from "./fetchAPI";

function truncate(str: string) {
  const split = str.split(".");
  const extension = split.pop();
  const joined = split.join(".");
  const trunc = joined.slice(0, 20);
  return `${trunc}${trunc.length >= 20 ? "(trunc)" : ""}.${extension}`;
}

function fileExtension(originalFile: string, newVal: string) {
  const newValExt = newVal.split(".").pop();
  const originalExtFile = originalFile.split(".").pop();
  if (newValExt !== originalExtFile) {
    return `${newVal}.${originalExtFile}`;
  }
  // const split = newVal.split(".");
  // split.pop();
  return newVal;
}

export default function UploadFile(): ReactElement {
  const auth = useAuth();
  const { files, setFiles } = getFiles("/api/files");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileText, setFileText] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      setFileText(event.target.files[0].name);
      console.log(event.target.files)
    }
  };

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    // const newFileName = fileExtension(value)
    // biome-ignore lint/style/noNonNullAssertion: <Biome is wrong>
    const fileExt = fileExtension(selectedFile?.name!, value)
    setFileText(fileExt);
    // if (selectedFile?.name) selectedFile.name = value;
    if (selectedFile) {
      console.log("file type", selectedFile.type);
    }
  }

  const changeFileName = () => {
    if (selectedFile) {
      const blob = new Blob([selectedFile], { type: selectedFile.type });
      const file = new File([blob], fileText, { type: blob.type });
      console.log("why is this empty?", file.type);
      setSelectedFile(file)
      console.log(file);
    }
  }

  const handleUpload = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!selectedFile) {
      throw new Error("No file selected");
    }

    if (!auth || !auth.user) throw new Error("Not logged in");

    const formData = new FormData();
    formData.append("file", selectedFile);
    // UP NEXT: UPDATE FILES AFTER UPLOAD
    try {
      const serverURL = import.meta.env.PROD
        ? window.location.href
        : import.meta.env.VITE_SERVER;
      const url = new URL("/api/upload", serverURL);
      // const url = new URL("https://10.0.0.96:8080/api/upload");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
        },
        mode: "cors",
        body: formData,
      });

      if (!response.ok) throw new Error(response.statusText);

      const data = (await response.json()) as string[];

      setSelectedFile(null); // TODO: update file state
      setFiles(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("ERROR:", error.message);
      } else {
        console.error("Error uploading file:", error);
      }
    }
  };

  if (!auth?.user) return <p>You must be logged in to upload</p>;

  return (
    <div className="flex flex-col pb-20">
      <form className="flex flex-col items-center gap-4" onSubmit={handleUpload}>
        <input
          type="file"
          id="fileElem"
          // multiple
          // accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {selectedFile ? <div>
          <p>{selectedFile.name}</p>
          <Input value={fileText} onChange={handleTextInputChange} type="text" />
          <Button onClick={changeFileName}>Change filename</Button>
        </div> : null}
        <Button onClick={() => {
          const fileElm = document.getElementById("fileElem");
          fileElm?.click();
        }} className="w-72" type="button">
          Choose File
        </Button>
        <Button className="w-72" type="submit">
          Upload
        </Button>
      </form>
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl">
          {files.length ? "Files:" : "No files in this directory"}
        </h1>
        <ul className="flex bg-slate-200 p-2 md:p-4 h-[40rem] overflow-scroll flex-col gap-4">
          {files?.map((file, index) => (
            <li className="flex text-xl flex-col md:flex-row gap-2" key={file}>
              {index + 1}.) {truncate(file)}
              <Button
                onClick={async () =>
                  // biome-ignore lint/style/noNonNullAssertion: <Biome is wrong>
                  await downloadFile({ file, user: auth.user! })
                }
              >
                Download
              </Button>
              <Button
                onClick={async () =>
                  // biome-ignore lint/style/noNonNullAssertion: <Biome is wrong>
                  await removeFile({ file, user: auth.user!, setFiles })
                }
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
