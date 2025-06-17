export default function InfoItem({ label, value }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{label}</span>
            <div className="flex items-center gap-3">
                <span className="font-medium">{value}</span>
            </div>
        </div>
    );
}