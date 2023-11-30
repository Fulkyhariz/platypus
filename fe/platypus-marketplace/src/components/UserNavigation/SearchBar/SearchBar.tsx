import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  IoSearchOutline,
  IoArrowUndoOutline,
  IoCartOutline,
} from "react-icons/io5";
import { BiFilterAlt } from "react-icons/bi";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterSearchForm } from "@/components/Form/FilterSearchForm";
function SearchBar() {
  return (
    <div className="fixed top-0 z-10 flex w-full items-center justify-between gap-2 border-b-[1px] border-b-border bg-background px-3 py-3 md:px-24">
      <Link href="/" className="flex items-center">
        <IoArrowUndoOutline />
        <p>&nbsp;Back</p>
      </Link>
      <Input placeholder="Search" icon={<IoSearchOutline />} />
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex items-center">
              <BiFilterAlt />
              <p>&nbsp;Filter</p>
            </div>
          </SheetTrigger>
          <SheetContent className="overflow-y-scroll">
            <SheetHeader className="mb-5">
              <SheetTitle>
                <div className="flex items-center">
                  <BiFilterAlt />
                  <p className="font-medium">&nbsp;Filter Search</p>
                </div>
              </SheetTitle>
              <SheetDescription className="text-left">
                Please choose your filter
              </SheetDescription>
            </SheetHeader>
            <FilterSearchForm />
          </SheetContent>
        </Sheet>
        <IoCartOutline className="h-5 w-5" />
      </div>
    </div>
  );
}

export default SearchBar;
