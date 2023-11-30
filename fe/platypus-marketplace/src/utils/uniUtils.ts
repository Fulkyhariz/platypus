import { ICategory } from "@/pages";

export function ratingFormat(num: number): string {
  if (String(num).length === 1) {
    return num + ".0";
  } else {
    return num.toFixed(1);
  }
}

export function setOthersToLast(categories: ICategory[]) {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].name == "Others") {
      categories.push(categories.splice(i, 1)[0]);
    }
  }
  return categories;
}
