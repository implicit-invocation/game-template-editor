import { HTMLAttributes } from "react";
import {
  FolderTree,
  addItemToFolderTree,
  deleteItemFromFolderTree,
  useFolder,
} from "./shared/folder-tree";
import { Wizard } from "./type";

export const TemplateCustomizationWizard = ({
  wizard,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  wizard: Wizard;
}) => {
  return <div {...props}>{JSON.stringify(wizard)}</div>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const EXAMPLE_WIZARD: Wizard = {
//   steps: [
//     {
//       name: "Step 1",
//       fields: {
//         bg: "texture",
//       },
//       preview: {
//         width: 390,
//         height: 844,
//         bgColor: "blue",
//         components: [],
//       },
//     },
//   ],
// };

// const UploadMultipleFiles = () => {
//   const ref = useRef<HTMLInputElement>(null);
//   const onData = async (files: FileList | null) => {
//     if (!files) return;
//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
//       const base64 = await blobToBase64String(file);
//       console.log(file.name, base64.length);
//     }
//   };
//   return (
//     <div>
//       <input
//         type="file"
//         multiple
//         ref={ref}
//         className="hidden"
//         accept=".png,.jpg,.jpeg"
//         onChange={(e) => onData(e.target.files)}
//       />
//       <button
//         className="bg-blue-900 text-white p-2"
//         onClick={() => {
//           ref.current?.click();
//         }}
//       >
//         Upload files
//       </button>
//     </div>
//   );
// };

function App() {
  const folder = useFolder({
    name: "root",
    type: "folder",
    children: [
      {
        type: "folder",
        name: "assets",
        children: [],
      },
    ],
  });
  return (
    <div className="flex-1 bg-gray-900 w-full">
      {/* <TemplateCustomizationWizard
        className="w-full h-full"
        wizard={EXAMPLE_WIZARD}
      /> */}
      <div className="w-80 h-full flex flex-col justify-center items-center pt-2">
        <div className="flex flex-row w-full justify-center items-center gap-2">
          <button
            className="bg-indigo-600 p-2 rounded-md text-white"
            onClick={() => addItemToFolderTree(folder, "folder")}
          >
            Add folder
          </button>
          <button
            className="bg-indigo-600 p-2 rounded-md text-white"
            onClick={() => addItemToFolderTree(folder, "file")}
          >
            Add file
          </button>
          <button
            className="bg-indigo-600 p-2 rounded-md text-white"
            onClick={() => deleteItemFromFolderTree(folder)}
          >
            Delete
          </button>
        </div>
        <FolderTree className="w-full flex-1" folder={folder} />
      </div>
    </div>
  );
}

export default App;
