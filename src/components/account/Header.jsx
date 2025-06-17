export default function Header({data}) {
    function getInitials(name) {
        const words = name.trim().split(/\s+/);
        
        if (words.length === 1) {
          const word = words[0];
          return (word[0] + (word[1] || '')).toUpperCase();
        }
      
        const firstInitial = words[0][0];
        const lastInitial = words[words.length - 1][0];
        return (firstInitial + lastInitial).toUpperCase();
      }

    return (
        <div className="relative bg-gradient-to-r from-blue-400 to-blue-100 p-6 pb-28">
            <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                opacity: '0.5'
            }}></div>

            <div className="relative flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold mb-2 text-blue-600">
                    {data?.photo ? <img src={data?.photo} alt="Profile" className="w-full h-full object-cover rounded-full" /> : getInitials(data?.name || "NA")}
                </div>
                <span className="text-lg font-semibold text-white">{data?.name || "Waiting for data..."}</span>
            </div>
        </div>
    )
}