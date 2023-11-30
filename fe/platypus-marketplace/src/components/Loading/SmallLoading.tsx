import { useLoading } from "@/store/loading/useLoading";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const varSmallLoading = cva("h-full w-full", {
  variants: {
    variant: {
      default: "bg-background",
      destructive: "bg-destructive",
      outline: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ISmallLoading
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof varSmallLoading> {}
{
}

const SmallLoading = ({ className, variant, ...props }: ISmallLoading) => {
  const looadingSm = useLoading.use.looadingSm();

  if (!looadingSm) {
    return null;
  }
  return (
    <div className={cn(varSmallLoading({ variant }), className)} {...props}>
      <span className="loading loading-dots loading-lg text-primary"></span>
    </div>
  );
};

export default SmallLoading;
