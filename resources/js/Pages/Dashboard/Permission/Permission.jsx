import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeader, { HeaderStat } from "@/Components/Dashboard/PageHeader";
import { Badge, Card, EmptyState } from "@/Components/Dashboard/ui";
import { usePage } from "@inertiajs/react";
import { FaShieldAlt, FaKey } from "react-icons/fa";

export default function Permission() {
    const { permissions } = usePage().props;

    return (
        <DashboardLayout title="Permission">
            <div className="space-y-6">
                <PageHeader
                    icon={FaShieldAlt}
                    title="Daftar Permission Sistem"
                    description="Kontrol akses fitur aplikasi sesuai standar keamanan PLN."
                >
                    <HeaderStat
                        icon={FaKey}
                        value={`${permissions ? permissions.length : 0} permission`}
                        label="Terintegrasi dengan role & akses menu"
                    />
                </PageHeader>

                <Card
                    padded={false}
                    icon={FaKey}
                    title="Permission Sistem"
                    description="Monitoring hak akses modul dan fitur aplikasi."
                    actions={
                        <Badge tone="brand">
                            Total permission:{" "}
                            {permissions ? permissions.length : 0}
                        </Badge>
                    }
                >
                    {permissions && permissions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th className="w-16">No</th>
                                        <th>Nama Permission</th>
                                        <th>Keterangan</th>
                                        <th>Guard Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permissions.map((permission, index) => (
                                        <tr key={permission.id}>
                                            <td className="whitespace-nowrap tabular-nums text-slate-500">
                                                {index + 1}
                                            </td>
                                            <td className="whitespace-nowrap">
                                                <span className="font-mono text-[13px] font-semibold text-ink-900">
                                                    {permission.name}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="max-w-xs text-slate-600">
                                                    {permission.description ||
                                                        "Tidak ada keterangan"}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap">
                                                <Badge tone="slate">
                                                    {permission.guard_name ||
                                                        "web"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState
                            icon={FaShieldAlt}
                            title="Belum ada permission terdaftar"
                            description="Tambahkan permission melalui modul manajemen akses untuk mengatur hak user terhadap fitur aplikasi."
                        />
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
