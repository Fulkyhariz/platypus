import { useLoading } from "@/store/loading/useLoading";
import PlatypusHead from "../SVG/PlatypusHead";

const LoadingScreen = () => {
  const show = useLoading.use.show();

  if (!show) {
    return null;
  }
  return (
    <div className="fixed inset-0 top-0 z-[200] flex h-[100vh] w-[100vw] items-center justify-center bg-white/50 text-sm">
      <div className="flex flex-col items-center">
        <PlatypusHead className="h-20 w-20 animate-bounce" />
      </div>
    </div>
  );
};

export default LoadingScreen;
