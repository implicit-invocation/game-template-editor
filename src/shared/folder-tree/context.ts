import { createContext, useCallback, useContext, useState } from "react";
import { Folder, FolderActionCallback } from "./type";
import { Deferred, getFolder, getPathType, isExpanded } from "./util";

export const useFolder = (
  initialFolder: Folder,
  folderActionCallback?: FolderActionCallback
) => {
  const [folder, setFolder] = useState<Folder>(initialFolder);
  const [cursor, setCursor] = useState<string[] | undefined>(undefined);
  const [selectedPaths, setSelectedPaths] = useState<string[][]>([]);
  const [expandedPaths, setExpandedPaths] = useState<string[][]>([]);
  const [addPrompt, setAddPrompt] = useState<
    | {
        path: string[];
        deferred: Deferred<{ name: string; cancel: boolean }>;
        type: "folder" | "file";
      }
    | undefined
  >();

  const [deletionConfirm, setDeletionConfirm] = useState<
    | {
        paths: string[][];
        deferred: Deferred<{ result: boolean; silent: boolean }>;
      }
    | undefined
  >();

  const confirmDelete = useCallback((paths: string[][]) => {
    const deferred = new Deferred<{ result: boolean; silent: boolean }>();
    setDeletionConfirm((prev) => {
      if (prev !== undefined) {
        prev.deferred.resolve({ result: false, silent: true });
      }
      return { paths, deferred };
    });
    return deferred.promise;
  }, []);

  const cancelConfirmDelete = useCallback(() => {
    setDeletionConfirm(undefined);
  }, []);

  const add = useCallback(
    async (type: "file" | "folder", name: string, path: string[]) => {
      if (folderActionCallback) {
        const shouldRun = await folderActionCallback("add", type, name, path);
        if (!shouldRun) {
          return;
        }
      }
      let currentFolder = folder;
      for (const pathItem of path) {
        const child = currentFolder.children.find(
          (child) => child.name === pathItem
        );
        if (child === undefined) {
          throw new Error("Path item not found");
        }
        if (child.type === "folder") {
          currentFolder = child;
        } else {
          throw new Error("Path item is not a folder");
        }
      }
      currentFolder.children.push(
        type === "file"
          ? { type: "file", name }
          : { type: "folder", name, children: [] }
      );
      setFolder({ ...folder });
    },
    [folder, folderActionCallback]
  );

  const remove = useCallback(
    async (name: string, path: string[]) => {
      if (folderActionCallback) {
        const type = getPathType(folder, [...path, name]);
        let shouldRun = true;
        if (type === "none") {
          shouldRun = false;
        } else {
          shouldRun = await folderActionCallback("remove", type, name, path);
        }
        if (!shouldRun) {
          return;
        }
      }
      // TODO: trigger delete children recursively if folder
      const parent = getFolder(folder, path);
      parent.children = parent.children.filter((c) => c.name !== name);
      setFolder({ ...folder });
    },
    [folder, folderActionCallback]
  );

  const expand = useCallback((path: string[]) => {
    setExpandedPaths((expandedPaths) => {
      if (isExpanded(expandedPaths, path)) {
        return expandedPaths;
      }
      return [...expandedPaths, path];
    });
  }, []);

  const collapse = useCallback((path: string[]) => {
    setExpandedPaths((expandedPaths) => {
      const index = expandedPaths.findIndex((expandedPath) => {
        if (expandedPath.length !== path.length) {
          return false;
        }
        for (let i = 0; i < path.length; i++) {
          if (expandedPath[i] !== path[i]) {
            return false;
          }
        }
        return true;
      });
      if (index === -1) {
        return expandedPaths;
      }
      const newExpandedPaths = [...expandedPaths];
      newExpandedPaths.splice(index, 1);
      return newExpandedPaths;
    });
  }, []);

  const requestAdd = useCallback(
    (path: string[], type: "folder" | "file" = "folder") => {
      const deferred = new Deferred<{ name: string; cancel: boolean }>();
      setAddPrompt({ path: path, deferred, type });
      return deferred.promise;
    },
    []
  );

  const cancelAdd = useCallback(() => {
    setAddPrompt(undefined);
  }, []);

  return {
    root: folder,
    add,
    remove,
    cursor,
    setCursor,
    selectedPaths,
    setSelectedPaths,
    expand,
    collapse,
    expanded: expandedPaths,
    confirmDelete,
    cancelConfirmDelete,
    deletionConfirm,
    addPrompt,
    cancelAdd,
    requestAdd,
    setRoot: setFolder,
  };
};

export type FolderHandler = ReturnType<typeof useFolder>;

export const FolderContext = createContext<
  ReturnType<typeof useFolder> | undefined
>(undefined);

export const FolderProvider = FolderContext.Provider;
export const useFolderContext = () => {
  const folderContext = useContext(FolderContext);
  if (folderContext === undefined) {
    throw new Error("Folder context not found");
  }
  return folderContext;
};
