import './App.css';
// import VirtualizedList from './VirtualizedList';
// const items = Array.from({ length: 100_000 }, (_, index) => `Item ${index + 1}`);
// import UploadFile from './UploadFile';
import { NextUIProvider } from "@nextui-org/react";
// import CreateAccount from "./CreateAccount";
import Auth from "./Authentication";

function App() {
  return (
    <NextUIProvider>
      <Auth />
      <div className="flex justify-center content-center items-center">
        {/* <CreateAccount /> */}
        {/* <UploadFile /> */}
      </div>
    </NextUIProvider>

  )
}

export default App
