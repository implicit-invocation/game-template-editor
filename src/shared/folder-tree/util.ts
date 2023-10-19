import { FolderHandler } from ".";
import { File, Folder } from "./type";

export class Deferred<T> {
  promise: Promise<T>;
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: () => void;
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export const getPathType = (
  root: Folder,
  path: string[]
): "folder" | "file" | "none" => {
  let currentFolder = root;
  for (let i = 0; i < path.length - 1; i++) {
    const pathItem = path[i];
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
  const target = currentFolder.children.find(
    (child) => child.name === path[path.length - 1]
  );
  return target === undefined ? "none" : target.type;
};

export const isExpanded = (expanded: string[][], path: string[]) => {
  for (const expandedPath of expanded) {
    if (expandedPath.length !== path.length) {
      continue;
    }
    let match = true;
    for (let i = 0; i < path.length; i++) {
      if (expandedPath[i] !== path[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      return true;
    }
  }
  return false;
};

export const compareFolderNode = (a: Folder | File, b: Folder | File) => {
  if (a.name === "builtin:") {
    return 1000;
  }
  if (a.type === "folder" && b.type === "file") {
    return -1;
  } else if (a.type === "file" && b.type === "folder") {
    return 1;
  }
  return a.name.localeCompare(b.name);
};

export const isSibling = (path1: string[], path2: string[]) => {
  if (path1.length !== path2.length) {
    return false;
  }
  for (let i = 0; i < path1.length - 1; i++) {
    if (path1[i] !== path2[i]) {
      return false;
    }
  }
  return true;
};

export const getFolder = (root: Folder, path: string[]): Folder => {
  let currentFolder = root;
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
  return currentFolder;
};

export const getSiblingsBetween = (
  path1: string[],
  path2: string[],
  root: Folder
): string[][] => {
  if (!isSibling(path1, path2)) {
    return [];
  }
  const parentPath = path1.slice(0, path1.length - 1);
  const parent = getFolder(root, parentPath);
  if (parent === undefined) {
    return [];
  }
  const index1 = parent.children.findIndex(
    (child) => child.name === path1[path1.length - 1]
  );
  const index2 = parent.children.findIndex(
    (child) => child.name === path2[path2.length - 1]
  );
  if (index1 === -1 || index2 === -1) {
    return [];
  }
  const minIndex = Math.min(index1, index2);
  const maxIndex = Math.max(index1, index2);
  const siblings = [];
  for (let i = minIndex; i <= maxIndex; i++) {
    siblings.push([...parentPath, parent.children[i].name]);
  }
  return siblings;
};

export const isSamePath = (path1: string[], path2: string[]) => {
  if (path1.length !== path2.length) {
    return false;
  }
  for (let i = 0; i < path1.length; i++) {
    if (path1[i] !== path2[i]) {
      return false;
    }
  }
  return true;
};

export const isPathsPointingToItem = (
  name: string,
  parentPath: string[],
  paths: string[][]
) => {
  for (const path of paths) {
    if (isPathPointingToItem(name, parentPath, path)) {
      return true;
    }
  }
  return false;
};

export const isPathPointingToItem = (
  name: string,
  parentPath: string[],
  path: string[]
) => {
  if (parentPath.length !== path.length - 1) {
    return false;
  }
  for (let i = 0; i < parentPath.length; i++) {
    if (parentPath[i] !== path[i]) {
      return false;
    }
  }
  return path[parentPath.length] === name;
};

export const addItemToFolderTree = async (
  folder: FolderHandler,
  addType: "file" | "folder"
) => {
  if (folder.addPrompt !== undefined) {
    return;
  }
  let addPath = folder.selectedPaths[folder.selectedPaths.length - 1];
  if (!addPath) {
    addPath = [];
  }
  const type = getPathType(folder.root, addPath);
  if (type === "folder") {
    folder.expand(addPath);
  } else if (type === "file") {
    addPath = addPath.slice(0, addPath.length - 1);
  }
  const result = await folder.requestAdd(addPath, addType);
  if (result.cancel) {
    folder.cancelAdd();
    return;
  }
  const newPath = [...addPath, result.name];
  const available = getPathType(folder.root, newPath) === "none";
  if (available) {
    await folder.add(addType, result.name, addPath);
    folder.setSelectedPaths([[...addPath, result.name]]);
    folder.cancelAdd();
  } else {
    alert("Name already exists");
    folder.cancelAdd();
  }
};

export const deleteItemFromFolderTree = async (folder: FolderHandler) => {
  if (folder.selectedPaths.length === 0) {
    return;
  }
  const confirmed = await folder.confirmDelete(folder.selectedPaths);
  if (!confirmed.silent) {
    folder.cancelConfirmDelete();
  }
  if (confirmed.result) {
    for (const path of folder.selectedPaths) {
      await folder.remove(path[path.length - 1], path.slice(0, -1));
    }
    folder.setSelectedPaths([]);
  }
};
