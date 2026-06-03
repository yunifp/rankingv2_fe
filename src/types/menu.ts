export interface Menu {
  id: string;
  title: string;
  path: string;
  icon: string | null;
  order: number;
  parentId: string | null;
  parent?: Menu | null;
  children?: Menu[];
}

export interface MenuFormData {
  title: string;
  path: string;
  icon: string;
  order: number;
  parentId: string | null;
}
