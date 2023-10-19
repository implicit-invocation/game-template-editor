export type File = {
  type: "file";
  name: string;
};

export type Folder = {
  type: "folder";
  name: string;
  children: (Folder | File)[];
};

export type FolderActionCallback = (
  action: "add" | "remove",
  type: "file" | "folder",
  name: string,
  path: string[]
) => Promise<boolean> | boolean;
