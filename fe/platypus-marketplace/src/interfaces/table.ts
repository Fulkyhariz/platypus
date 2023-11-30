import { ITypeValue, ITypeValueWithChild, IVariantType } from "./product";

export interface IVariantTable {
  parent: string;
  child?: string;
  parentType: IVariantType[];
  childType?: IVariantType[];
  var1Type: ITypeValue[];
  var2Type?: ITypeValueWithChild[];
  varianChild: boolean;
  stockZero?: boolean;
  updateVar1TypeItem: (index: number, newValues: Partial<ITypeValue>) => void;
  updateVar2TypeItem: (index: number, newValues: Partial<ITypeValue>) => void;
}
