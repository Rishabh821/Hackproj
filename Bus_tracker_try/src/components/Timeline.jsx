export function Timeline() {
    const hardstops =[{ name: "Stop 1", time: "10:10", status: "done" },
  { name: "Stop 2", time: "10:20", status: "current" },
  { name: "Stop 3", time: "10:30", status: "pending" },];
    return (
        hardstops.map((stop, index) => (
        <div className="space-y-4" key={index}>
            <div className="border-2 border-gray-700 p-3 rounded-lg flex items-center space-x-3">
                <div className="w-auto font-mono">{stop.time}</div>
                <div className="relative flex flex-col items-center h-12 w-6 top-4">
  
  {/* Vertical Line */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-22 bg-gray-600"></div>

  {/* Circle */}
  <div className="w-4 h-4 rounded-full bg-blue-500 z-10 flex items-center justify-center">
    <div className="w-2 h-2 rounded-full bg-white"></div>
  </div>

</div>
                <div className="w-auto">{stop.name}</div>
            </div>
        </div>))
        

    );
}