import { HTMLAttributes } from "react";
import { FolderHandler, FolderProvider, useFolderContext } from "./context";
import { Down, FileIcon, Right } from "./icons";
import { Folder } from "./type";
import {
  compareFolderNode,
  getSiblingsBetween,
  isExpanded,
  isPathsPointingToItem,
  isSamePath,
  isSibling,
} from "./util";

export type FolderTreeProps = {
  folder: FolderHandler;
};

export const FolderDisplay = ({
  folder,
  path,
}: {
  folder: Folder;
  path: string[];
}) => {
  const {
    root,
    setSelectedPaths,
    selectedPaths,
    cursor,
    setCursor,
    expanded,
    expand,
    collapse,
    addPrompt,
    deletionConfirm,
  } = useFolderContext();
  return (
    <div className="flex flex-col">
      {addPrompt &&
        isSamePath(path, addPrompt.path) &&
        addPrompt.type === "folder" && (
          <div
            className="p-0.5 flex flex-row justify-between items-center gap-1"
            style={{
              paddingLeft: `${path.length * 1}rem`,
            }}
          >
            <input
              autoFocus
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  addPrompt.deferred.resolve({
                    cancel: true,
                    name: "",
                  });
                } else if (e.key === "Enter") {
                  addPrompt.deferred.resolve({
                    cancel: false,
                    name: e.currentTarget.value,
                  });
                }
              }}
              className="w-full text-white bg-gray-700 border-none outline-none py-0.5"
            />
          </div>
        )}
      {folder.children.sort(compareFolderNode).map((child) => {
        const childPath = [...path, child.name];

        return (
          <div
            key={child.name}
            className="flex flex-col"
            draggable={child.type === "file"}
            onDragStart={(e) => {
              if (child.type !== "file") {
                return;
              }
              e.dataTransfer.setData(
                "text",
                childPath[0] === "builtin:"
                  ? childPath.join("")
                  : childPath.join("/")
              );
            }}
          >
            <div
              className={[
                cursor && isSamePath(childPath, cursor)
                  ? "border-indigo-400"
                  : "border-transparent",
                "flex items-center gap-1 cursor-pointer hover:bg-gray-800 justify-start relative p-1 border-2",
                isPathsPointingToItem(child.name, path, selectedPaths)
                  ? "bg-indigo-700 hover:bg-indigo-600"
                  : undefined,
              ].join(" ")}
              style={{
                paddingLeft: `${path.length * 1}rem`,
              }}
              onClick={(e) => {
                setCursor(childPath);
                if (!isExpanded(expanded, childPath)) {
                  expand(childPath);
                } else {
                  collapse(childPath);
                }
                const spanning = e.shiftKey;
                const picking = e.ctrlKey || e.metaKey;

                if (!spanning && !picking) {
                  setSelectedPaths([childPath]);
                } else if (spanning && isSibling(selectedPaths[0], childPath)) {
                  // TODO: breadth first for non-siblings selection
                  if (cursor) {
                    const from = cursor;
                    const to = childPath;

                    const newSelection = getSiblingsBetween(from, to, root);
                    setSelectedPaths((selected) => {
                      return [...selected, ...newSelection].sort((a, b) =>
                        a.join("").localeCompare(b.join(""))
                      );
                    });
                  }
                } else if (picking && isSibling(selectedPaths[0], childPath)) {
                  if (isPathsPointingToItem(child.name, path, selectedPaths)) {
                    setSelectedPaths((selected) =>
                      selected.filter(
                        (selectedPath) => !isSamePath(selectedPath, childPath)
                      )
                    );
                  } else {
                    setSelectedPaths(
                      [...selectedPaths, childPath].sort((a, b) =>
                        a.join("").localeCompare(b.join(""))
                      )
                    );
                  }
                }
              }}
            >
              {child.type === "folder" &&
                (isExpanded(expanded, childPath) ? (
                  <Down className="h-4 w-4" />
                ) : (
                  <Right className="h-4 w-4" />
                ))}

              {child.type === "file" && <FileIcon className="h-4 w-4" />}
              <div className="flex flex-row justify-start items-center gap-0.5">
                {child.name}
              </div>

              {deletionConfirm &&
                isPathsPointingToItem(
                  child.name,
                  path,
                  deletionConfirm.paths
                ) && (
                  <div
                    className="h-full w-full absolute flex flex-row justify-end items-center gap-2 px-2 text-xs bg-black/75"
                    style={{
                      marginLeft: `-${path.length * 1}rem`,
                    }}
                  >
                    {isSamePath(deletionConfirm.paths[0], childPath) && (
                      <>
                        <button
                          className="cursor-pointer bg-red-500 px-2 rounded-md w-12 shadow-md"
                          onClick={() => {
                            deletionConfirm.deferred.resolve({
                              result: true,
                              silent: false,
                            });
                          }}
                        >
                          Yes
                        </button>
                        <button
                          className="cursor-pointer bg-gray-800 px-2 rounded-md w-12 shadow-md"
                          onClick={() => {
                            deletionConfirm.deferred.resolve({
                              result: false,
                              silent: false,
                            });
                          }}
                        >
                          No
                        </button>
                      </>
                    )}
                  </div>
                )}
            </div>
            {child.type === "folder" && isExpanded(expanded, childPath) && (
              <div>
                <FolderDisplay folder={child} path={[...path, child.name]} />
              </div>
            )}
          </div>
        );
      })}
      {addPrompt &&
        isSamePath(path, addPrompt.path) &&
        addPrompt.type === "file" && (
          <div
            className="p-0.5 flex flex-row justify-between items-center gap-1"
            style={{
              paddingLeft: `${path.length * 1}rem`,
            }}
          >
            <FileIcon className="h-4 w-4" />
            <input
              autoFocus
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  addPrompt.deferred.resolve({
                    cancel: true,
                    name: "",
                  });
                } else if (e.key === "Enter") {
                  addPrompt.deferred.resolve({
                    cancel: false,
                    name: e.currentTarget.value,
                  });
                }
              }}
              className="w-full text-white bg-gray-700 border-none outline-none py-0.5"
            />
          </div>
        )}
    </div>
  );
};

export const FolderTree = ({
  folder,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & FolderTreeProps) => {
  return (
    <FolderProvider value={folder}>
      <div
        {...props}
        className={[
          "overflow-y-auto overflow-x-hidden p-2 text-sm select-none text-white flex flex-col gap-2",
          className,
        ].join(" ")}
      >
        <div className="flex-1 w-full">
          <div
            onClick={() => {
              folder.setSelectedPaths([]);
              folder.setCursor(undefined);
            }}
            className={[
              "flex items-center cursor-pointer hover:bg-gray-800 text-sm py-1",
              folder.selectedPaths.length === 0
                ? "bg-indigo-700 hover:bg-indigo-600"
                : undefined,
            ].join(" ")}
          >
            Root
          </div>
          <FolderDisplay folder={folder.root} path={[]} />
        </div>
      </div>
    </FolderProvider>
  );
};
