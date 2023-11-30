import { IUniPagination } from "@/interfaces/productReview";

function UniPagination({
  onClickChangePage,
  onClickNextChangePage,
  onClickPrevChangePage,
  pageInformation,
}: IUniPagination) {
  console.log(pageInformation);

  const isFirstDisabled = pageInformation.current_page === 1;
  const isNextDisabled =
    pageInformation.current_page === pageInformation.total_pages;

  const shownButton =
    pageInformation.current_page === 1 ||
    (pageInformation.current_page === pageInformation.total_pages &&
      pageInformation.total_pages <= 5)
      ? [1, 2, 3, 4, 5]
      : pageInformation.current_page === pageInformation.total_pages
      ? [
          pageInformation.current_page - 4,
          pageInformation.current_page - 3,
          pageInformation.current_page - 2,
          pageInformation.current_page - 1,
          pageInformation.current_page,
        ]
      : pageInformation.current_page === 2
      ? [
          pageInformation.current_page - 1,
          pageInformation.current_page,
          pageInformation.current_page + 1,
          pageInformation.current_page + 2,
          pageInformation.current_page + 3,
        ]
      : [
          pageInformation.current_page - 2,
          pageInformation.current_page - 1,
          pageInformation.current_page,
          pageInformation.current_page + 1,
          pageInformation.current_page + 2,
        ];
  return (
    <>
      <button
        onClick={() => onClickPrevChangePage("page")}
        disabled={isFirstDisabled}
        className={`h-[2.6rem] w-[5.2rem] rounded-l-lg border-x-[1px] border-y-[1px] border-primary bg-background font-bold transition-colors hover:bg-primary hover:text-primary-foreground disabled:border-primary disabled:bg-muted disabled:text-muted-foreground`}
      >
        Prev
      </button>
      {shownButton.map((number) => (
        <button
          disabled={number > pageInformation.total_pages}
          onClick={() => onClickChangePage("page", number)}
          className={`${
            number === pageInformation.current_page
              ? "bg-primary text-primary-foreground"
              : " bg-background transition-colors hover:bg-primary/20 hover:transition-colors"
          } h-[2.6rem] w-[2.6rem] border-y-[1px] border-r-[1px] border-primary font-bold disabled:border-primary disabled:bg-muted disabled:text-muted-foreground`}
          key={number}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onClickNextChangePage("page")}
        disabled={isNextDisabled || pageInformation.total_pages === 0}
        className="h-[2.6rem] w-[5.2rem] rounded-r-lg border-y-[1px] border-r-[1px] border-primary bg-background font-bold transition-colors hover:bg-primary hover:text-primary-foreground disabled:border-primary disabled:bg-muted disabled:text-muted-foreground"
      >
        Next
      </button>
    </>
  );
}

export default UniPagination;
