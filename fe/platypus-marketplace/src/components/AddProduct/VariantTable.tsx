/*eslint no-unused-vars: "off"*/

import React from "react";
import { InputPrimeIcon } from "../Input/InputPrimeIcon";
import { IVariantTable } from "@/interfaces/table";

const VariantTable = ({
  parent,
  parentType,
  var1Type,
  var2Type,
  child,
  childType,
  varianChild,
  stockZero,
  updateVar1TypeItem,
  updateVar2TypeItem,
}: IVariantTable) => {
  return (
    <table className="mt-5 w-full table-fixed overflow-scroll rounded-lg border-[1px] border-border">
      <thead>
        <tr>
          {!child && (
            <th className=" min-w-[40%] overflow-hidden text-ellipsis whitespace-nowrap border-b-[1px] border-border py-3">
              {parent}
            </th>
          )}
          {child && (
            <>
              <th className=" min-w-[20%] overflow-hidden text-ellipsis whitespace-nowrap border-b-[1px] border-border py-3">
                {parent}
              </th>
              <th className=" min-w-[20%] overflow-hidden text-ellipsis whitespace-nowrap border-b-[1px] border-border py-3">
                {child}
              </th>
            </>
          )}
          <th className=" min-w-[20%] overflow-hidden text-ellipsis whitespace-nowrap border-b-[1px] border-border py-3">
            Price
          </th>
          <th className=" min-w-[20%] overflow-hidden text-ellipsis whitespace-nowrap border-b-[1px] border-border py-3">
            Stock
          </th>
          <th className=" min-w-[20%] overflow-hidden text-ellipsis whitespace-nowrap border-b-[1px] border-border py-3">
            SKU
          </th>
        </tr>
      </thead>
      <tbody>
        {child &&
          varianChild &&
          var2Type &&
          var2Type.map((type, i) => {
            return (
              <tr
                className="transition-colors hover:bg-primary/10 hover:transition-colors"
                key={`${type.childType}-${type.parentType}`}
              >
                <td className=" w-[14.3%] p-3 py-7 text-center">
                  {type.parentType}
                </td>
                <td className="w-[14.3%] p-3 py-7 text-center">
                  {type.childType}
                </td>
                <td className="relative w-[14.3%] p-3 py-7">
                  <InputPrimeIcon
                    onChange={(e) =>
                      updateVar2TypeItem(i, { price: e.target.value })
                    }
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", "."].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    type="number"
                    value={type.price}
                    placeholder="Price"
                    icon="Rp"
                    className="w-full"
                  />
                  <p className=" absolute bottom-2 line-clamp-1 text-xs font-bold text-destructive">
                    {parseInt(type.price as string) < 100 && `Min Rp 100`}
                    {parseInt(type.price as string) > 100000000000000 &&
                      `Max Rp 100T`}
                    {type.price === "" && (
                      <span className="text-destructive">{`Required`}</span>
                    )}
                  </p>
                </td>
                <td className="relative w-[14.3%] p-3 py-7">
                  <InputPrimeIcon
                    onChange={(e) =>
                      updateVar2TypeItem(i, { stock: e.target.value })
                    }
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", "."].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    type="number"
                    value={type.stock}
                    className="w-full"
                    placeholder="Stock"
                  />
                  <p className=" absolute bottom-2 line-clamp-1 text-xs font-bold text-destructive">
                    {parseInt(type.stock as string) < (stockZero ? 0 : 1) &&
                      `Min ${stockZero ? 0 : 1}`}
                    {parseInt(type.stock as string) > 100000 && `Max 100.000`}
                    {type.stock === "" && (
                      <span className="text-destructive">{`Required`}</span>
                    )}
                  </p>
                </td>
                <td className="w-[14.3%] p-3 py-7">
                  <InputPrimeIcon
                    onChange={(e) =>
                      updateVar2TypeItem(i, { sku: e.target.value })
                    }
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", "."].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    type="number"
                    value={type.sku}
                    className="w-full"
                    placeholder="SKU"
                  />
                </td>
                {/* <td className="relative w-[14.3%] p-3 py-7">
                  <InputPrimeIcon
                    onChange={(e) =>
                      updateVar2TypeItem(i, { weight: e.target.value })
                    }
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", "."].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    type="number"
                    value={type.weight}
                    icon="g"
                    iconEnd
                    className="w-full"
                    placeholder="Weight"
                  />
                  <p className=" absolute bottom-2 line-clamp-1 text-xs font-bold text-destructive">
                    {parseInt(type.weight as string) < 1 && `Min 1`}
                    {parseInt(type.weight as string) > 500000 && `Max 500.000`}
                    {type.weight === "" && (
                      <span className="text-destructive">{`Required`}</span>
                    )}
                  </p>
                </td>
                <td className="flex w-full items-center justify-center p-3 py-7">
                  <input
                    onChange={() =>
                      updateVar2TypeItem(i, { status: !type.status })
                    }
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={type.status}
                  />
                </td> */}
              </tr>
            );
          })}
        {!child &&
          !varianChild &&
          var1Type.map((type, i) => {
            return (
              <tr key={type.type}>
                <td className="w-[28.6%] p-3 py-7 text-center">{type.type}</td>
                <td className="relative w-[14.3%] p-3 py-7">
                  <InputPrimeIcon
                    onChange={(e) =>
                      updateVar1TypeItem(i, { price: e.target.value })
                    }
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", "."].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    type="number"
                    value={type.price}
                    placeholder="Price"
                    icon="Rp"
                    className="w-full"
                  />
                  <p className=" absolute bottom-2 line-clamp-1 text-xs font-bold text-destructive">
                    {parseInt(type.price as string) < 100 && `Min Rp 100`}
                    {parseInt(type.price as string) > 100000000000000 &&
                      `Max Rp 100T`}
                    {type.price === "" && (
                      <span className="text-destructive">{`Required`}</span>
                    )}
                  </p>
                </td>
                <td className="relative w-[14.3%] p-3 py-7">
                  <InputPrimeIcon
                    onChange={(e) =>
                      updateVar1TypeItem(i, { stock: e.target.value })
                    }
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", "."].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    type="number"
                    value={type.stock}
                    className="w-full"
                    placeholder="Stock"
                  />
                  <p className=" absolute bottom-2 line-clamp-1 text-xs font-bold text-destructive">
                    {parseInt(type.stock as string) < (stockZero ? 0 : 1) &&
                      `Min ${stockZero ? 0 : 1}`}
                    {parseInt(type.stock as string) > 100000 && `Max 100.000`}
                    {type.stock === "" && (
                      <span className="text-destructive">{`Required`}</span>
                    )}
                  </p>
                </td>
                <td className="w-[14.3%] p-3 py-7">
                  <InputPrimeIcon
                    onChange={(e) =>
                      updateVar1TypeItem(i, { sku: e.target.value })
                    }
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", "."].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    type="number"
                    value={type.sku}
                    className="w-full"
                    placeholder="SKU"
                  />
                </td>
                {/* <td className="relative w-[14.3%] p-3 py-7">
                  <InputPrimeIcon
                    onChange={(e) =>
                      updateVar1TypeItem(i, { weight: e.target.value })
                    }
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", "."].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    type="number"
                    value={type.weight}
                    icon="g"
                    iconEnd
                    className="w-full"
                    placeholder="Weight"
                  />
                  <p className=" absolute bottom-2 line-clamp-1 text-xs font-bold text-destructive">
                    {parseInt(type.weight as string) < 1 && `Min 1`}
                    {parseInt(type.weight as string) > 500000 && `Max 500.000`}
                    {type.weight === "" && (
                      <span className="text-destructive">{`Required`}</span>
                    )}
                  </p>
                </td>
                <td className="flex w-full items-center justify-center p-3 py-7">
                  <input
                    onChange={() =>
                      updateVar1TypeItem(i, { status: !type.status })
                    }
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={type.status}
                  />
                </td> */}
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

export default VariantTable;
