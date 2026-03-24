export default function LiveCard() {
    return (
        <div className="bg-blue-950 w-auto p-2 rounded-2xl shadow-lg space-y-2">
            <div className="flex justify-between border-2 border-gray-700 p-3 rounded-lg">
                <div className="text-md font-light text-gray-500">Next Stop</div>
                <div className="flex items-center bg-red-500 px-3 py-1 rounded-full text-sm">
                <div className="w-3 h-3 bg-red-700 rounded-full mr-2"></div>
                <div>Live</div></div>
            </div>
            <div className="text-lg font-bold border-2 border-gray-700 p-3 rounded-lg">Stop Name</div>
            <div className="text-gray-500 font-light border-2 border-gray-700 p-3 rounded-lg">Arriving in x Minutes </div>
        
        </div>
        

    );
}