export default function AppCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-[#1A1A2E] border border-[#2A2A4A] overflow-hidden">
      <div className="flex flex-col items-center p-6 pb-4">
        {/* Icon skeleton */}
        <div className="mb-4 h-[72px] w-[72px] rounded-2xl shimmer" />
        {/* Name skeleton */}
        <div className="mb-2 h-4 w-28 rounded shimmer" />
        {/* Description skeleton */}
        <div className="h-3 w-36 rounded shimmer mb-1" />
        <div className="h-3 w-24 rounded shimmer" />
      </div>
      <div className="px-4 pb-5 pt-3 border-t border-[#2A2A4A]/60">
        <div className="h-8 w-full rounded-xl shimmer" />
      </div>
    </div>
  );
}
