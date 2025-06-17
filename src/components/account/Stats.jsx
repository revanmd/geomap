import { useRouter } from "next/navigation";
import StatItem from "./StatItem";

export default function Stats({ stats }) {
    const router = useRouter();

    return (
        <div className="bg-white rounded-lg shadow-sm pt-4 mb-2 border border-gray-200">

            <div className="grid grid-cols-4 gap-4 px-4">
                <StatItem
                    icon={<img src="/paddy.png" className="w-5 h-5" alt="Padi" />}
                    value={stats?.count_padi}
                    total={stats?.count_total}
                    label="Padi"
                    bgColor="bg-green-800"
                />
                <StatItem
                    icon={<img src="/corn.png" className="w-5 h-5" alt="Padi" />}
                    value={stats?.count_jagung}
                    total={stats?.count_total}
                    label="Jagung"
                    bgColor="bg-yellow-700"
                />
                <StatItem
                    icon={<img src="/cane.png" className="w-5 h-5" alt="Padi" />}
                    value={stats?.count_tebu}
                    total={stats?.count_total}
                    label="Tebu"
                    bgColor="bg-teal-700"
                />
                <StatItem
                    icon={<img src="/others.png" className="w-5 h-5" alt="Padi" />}
                    value={stats?.count_other}
                    total={stats?.count_total}
                    label="Lainnya"
                    bgColor="bg-gray-300"
                />
            </div>

            <button className="rounded-b-lg p-1 w-full mt-3 bg-blue-500 text-white flex items-center justify-between px-4"
                onClick={() => router.push("/leaderboard")}
            >
                <span className="text-sm">Lihat poin keseluruhan</span>
                <span className="text-lg">→</span>
            </button>
        </div>
    )
}