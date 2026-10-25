import { Loader } from "@/components/Loader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader size={104} label="Loading" />
    </div>
  );
}
