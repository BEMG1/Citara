import type { IReference } from "@/utils/referenceUtils";

export interface IReferences {
  references: IReference[];
  setReferences: React.Dispatch<React.SetStateAction<IReference[]>>;
}
