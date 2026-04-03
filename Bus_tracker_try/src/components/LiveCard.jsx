export default function LiveCard() {
  return (
    <div className="bg-[#020617] border border-gray-800 p-4 rounded-2xl shadow-xl space-y-3">

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">Next Stop</div>

        <div className="flex items-center text-xs bg-red-500 px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-red-700 rounded-full mr-2 animate-pulse"></div>
          Live
        </div>
      </div>

      <div className="text-lg font-semibold">Engineering Block</div>

      <div className="text-sm text-gray-400">
        Arriving in <span className="text-white font-medium">5 mins</span>
      </div>

    </div>
  );
}