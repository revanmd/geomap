import InfoItem from "./InfoItem";

export default function AccountInfo({ user }) {
    return (
        <div>
            <h2 className="font-semibold text-medium mb-3 mt-5">Info Akun</h2>
            <div className="bg-white rounded-lg shadow-sm p-3 mb-4 border border-gray-200">
                <div className="space-y-3">
                    <InfoItem label="Username" value={user?.name} />
                    <InfoItem label="NIK PI SMART" value={user?.username} />
                    <InfoItem label="Kata Sandi" value="********" />
                </div>
            </div>
        </div>
    )
}